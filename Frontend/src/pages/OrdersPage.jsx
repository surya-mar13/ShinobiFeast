import { useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-blue-100 text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  "out-for-delivery": "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_LABELS = {
  pending: "Pending",
  accepted: "Accepted",
  preparing: "Prepared – Ready for Pickup",
  "out-for-delivery": "On the Way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const getStatusLabel = (status) => STATUS_LABELS[status] || status;

const TIMELINE_STEPS = [
  { key: "pending",          label: "Order Placed",    icon: "🛒" },
  { key: "accepted",         label: "Accepted",        icon: "✅" },
  { key: "preparing",        label: "Prepared",        icon: "🍳" },
  { key: "out-for-delivery", label: "On the Way",      icon: "🚴" },
  { key: "delivered",        label: "Delivered",       icon: "🏠" },
];
const STEP_ORDER = TIMELINE_STEPS.map((s) => s.key);

function StatusTimeline({ status }) {
  if (status === "cancelled") {
    return (
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="text-base">❌</span>
          <span className="text-sm font-semibold text-red-600">Order Cancelled</span>
        </div>
      </div>
    );
  }
  const currentIdx = STEP_ORDER.indexOf(status);
  return (
    <div className="px-5 pb-4">
      <div className="flex items-center gap-0">
        {TIMELINE_STEPS.map((step, i) => {
          const done = i <= currentIdx;
          const active = i === currentIdx;
          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all ${
                  done
                    ? active
                      ? "border-[#FF5C00] bg-orange-50 text-[#FF5C00]"
                      : "border-green-400 bg-green-50 text-green-600"
                    : "border-gray-200 bg-gray-50 text-gray-300"
                }`}>
                  {step.icon}
                </div>
                <span className={`text-xs mt-1 text-center leading-tight max-w-14 ${done ? (active ? "text-[#FF5C00] font-semibold" : "text-green-600 font-medium") : "text-gray-300"}`}>
                  {step.label}
                </span>
              </div>
              {i < TIMELINE_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mb-5 mx-1 ${i < currentIdx ? "bg-green-400" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const getPaymentLabel = (order) => {
  if (order.paymentStatus === "pending" && order.paymentMethod === "COD") {
    return "COD";
  }
  return order.paymentStatus;
};

const METHODS = [
  { id: "COD",  label: "Cash on Delivery", icon: "💵" },
  { id: "CARD", label: "Credit / Debit Card", icon: "💳" },
  { id: "UPI",  label: "UPI", icon: "📱" },
];

// Load Razorpay checkout script once
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

function PayModal({ order, onClose, onPaid }) {
  const [method, setMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");

  const handlePay = async () => {
    setLoading(true);
    setErr("");
    try {
      // ── COD: simple backend call, no Razorpay involved ──────────────────
      if (method === "COD") {
        await api.post("/payment-api/pay", { orderId: order._id, method: "COD" });
        onPaid();
        return;
      }

      // ── CARD / UPI: go through Razorpay Checkout ─────────────────────────
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error("Razorpay key is missing. Add VITE_RAZORPAY_KEY_ID in Frontend/.env and restart frontend.");
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Failed to load Razorpay SDK. Check your internet connection.");

      // 1. Create a Razorpay order on the backend
      const { razorpayOrder } = await api.post("/payment-api/create-order", { orderId: order._id });

      // 2. Open Razorpay checkout popup
      await new Promise((resolve, reject) => {
        const options = {
          key: razorpayKey,
          amount: razorpayOrder.amount,          // in paise
          currency: razorpayOrder.currency,
          order_id: razorpayOrder.id,
          name: "ShinobiFeast",
          description: `Order #${order._id}`,
          theme: { color: "#FF5C00" },
          handler: async (response) => {
            try {
              // 3. Verify signature on the backend
              await api.post("/payment-api/verify", {
                razorpay_order_id:  response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                orderId: order._id,
              });
              resolve();
            } catch (e) {
              reject(e);
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment was cancelled.")),
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (resp) =>
          reject(new Error(resp.error?.description || "Payment failed"))
        );
        rzp.open();
      });

      onPaid();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">💳 Pay Now</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        </div>
        <p className="text-sm text-gray-500">Order total: <span className="font-bold text-gray-800">₹{order.totalAmount}</span></p>

        {/* Method selector */}
        <div className="flex flex-col gap-2">
          {METHODS.map((m) => (
            <label key={m.id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${method === m.id ? "border-[#FF5C00] bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}>
              <input type="radio" name="payModal" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="accent-[#FF5C00]" />
              <span>{m.icon}</span>
              <span className="text-sm font-medium text-gray-700">{m.label}</span>
            </label>
          ))}
        </div>

        {method !== "COD" && (
          <p className="text-xs text-gray-400 -mt-1">
            🔒 Your card / UPI details are entered securely in the Razorpay popup — never stored by us.
          </p>
        )}

        {err && <p className="text-red-500 text-sm font-medium">{err}</p>}

        <button onClick={handlePay} disabled={loading} className="w-full bg-[#FF5C00] text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-60">
          {loading ? "Processing..." : method === "COD" ? "Confirm COD" : `Pay ₹${order.totalAmount} via Razorpay`}
        </button>
      </div>
    </div>
  );
}

function OrdersPage() {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [payOrder, setPayOrder]   = useState(null); // order opened in pay modal

  const fetchOrders = useCallback(async () => {
    try {
      const data = await api.get("/order-api/myorders");
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchOrders();
      }
    }, 15000);

    const handleFocus = () => fetchOrders();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchOrders();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchOrders]);

  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(orderId);
    try {
      await api.put(`/order-api/${orderId}/status`, { status: "cancelled", cancelReason: "Cancelled by user", cancelledBy: "user" });
      await fetchOrders();
    } catch (err) {
      alert(err.message);
    } finally {
      setCancelling(null);
    }
  };

  if (loading)
    return <div className="flex justify-center items-center h-64"><span className="animate-pulse text-gray-400 text-lg">Loading orders...</span></div>;

  return (
    <>
      {payOrder && (
        <PayModal
          order={payOrder}
          onClose={() => setPayOrder(null)}
          onPaid={() => { setPayOrder(null); fetchOrders(); }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">📦 My Orders</h1>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <span className="text-6xl">📦</span>
            <p className="text-gray-500 text-lg">No orders yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 py-4 bg-gray-50 border-b">
                  <div>
                    <p className="text-xs text-gray-400 font-mono">Order ID: {order._id}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      💳 {getPaymentLabel(order)}
                    </span>
                  </div>
                </div>

                {/* Tracking Timeline */}
                <StatusTimeline status={order.status} />

                {/* Delivery Address */}
                {order.deliveryAddress && (
                  <div className="px-5 pb-3 flex items-start gap-2">
                    <span className="text-base mt-0.5">📍</span>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Delivery Address</p>
                      <p className="text-sm text-gray-700 mt-0.5">{order.deliveryAddress}</p>
                    </div>
                  </div>
                )}

                {/* Delivery OTP — show when order is out-for-delivery */}
                {order.status === "out-for-delivery" && order.deliveryOtp && !order.otpVerified && (
                  <div className="mx-5 mb-4 flex flex-col items-center gap-1 bg-orange-50 border-2 border-dashed border-[#FF5C00] rounded-2xl px-5 py-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Delivery OTP</p>
                    <p className="text-3xl font-extrabold tracking-[0.3em] text-[#FF5C00]">{order.deliveryOtp}</p>
                    <p className="text-xs text-gray-500 text-center">Share this code with your delivery partner to confirm handover</p>
                  </div>
                )}
                {order.otpVerified && order.status === "out-for-delivery" && (
                  <div className="mx-5 mb-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
                    <span className="text-base">✅</span>
                    <span className="text-sm font-semibold text-green-700">OTP verified — delivery in progress</span>
                  </div>
                )}

                {/* Items */}
                <div className="px-5 py-4">
                  <div className="flex flex-col gap-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.product?.name || "Product"} <span className="text-gray-400">× {item.quantity}</span></span>
                        <span className="font-medium text-gray-800">₹{item.priceAtPurchase * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-3 pt-3 flex justify-between font-bold text-gray-800">
                    <span>Total</span>
                    <span>₹{order.totalAmount}</span>
                  </div>
                </div>

                {/* Actions */}
                {!order.isCancelled && order.status !== "cancelled" && (
                  <div className="px-5 pb-4 flex flex-wrap gap-2">
                    {/* Pay Now — only for unstarted (pending) orders that haven't been set up as COD */}
                    {order.paymentStatus === "pending" && order.status === "pending" && order.paymentMethod !== "COD" && (
                      <button
                        onClick={() => setPayOrder(order)}
                        className="text-sm bg-[#FF5C00] text-white px-4 py-1.5 rounded-lg hover:bg-orange-600 transition font-semibold"
                      >
                        💳 Pay Now
                      </button>
                    )}
                    {/* Cancel */}
                    {["pending", "accepted"].includes(order.status) && (
                      <button
                        onClick={() => handleCancel(order._id)}
                        disabled={cancelling === order._id}
                        className="text-sm text-red-500 border border-red-300 px-4 py-1.5 rounded-lg hover:bg-red-50 transition disabled:opacity-60"
                      >
                        {cancelling === order._id ? "Cancelling..." : "Cancel Order"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default OrdersPage;
