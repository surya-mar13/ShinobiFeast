import { useState, useEffect, useCallback } from "react";
import { api } from "../../utils/api";

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
  preparing: "Prepared",
  "out-for-delivery": "On the Way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const getStatusLabel = (status) => STATUS_LABELS[status] || status;

const NEXT_STATUS = {
  pending: "accepted",
  accepted: "preparing",
};

const NEXT_LABEL = {
  pending: "✓ Accept Order",
  accepted: "🍳 Mark as Prepared",
};

function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchOrders = useCallback(async () => {
    try {
      const data = await api.get("/order-api/vendor");
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Auto-refresh every 10 s + on focus/visibility change
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchOrders();
    }, 10000);
    const onFocus = () => fetchOrders();
    const onVisibility = () => { if (document.visibilityState === "visible") fetchOrders(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await api.put(`/order-api/${orderId}/status`, { status: newStatus });
      await fetchOrders();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (loading)
    return <div className="flex justify-center items-center h-64"><span className="animate-pulse text-gray-400 text-lg">Loading orders...</span></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">📋 Vendor Orders</h1>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "pending", "accepted", "preparing", "out-for-delivery"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filter === s ? "bg-[#FF5C00] text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {s === "all" ? "All" : getStatusLabel(s)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><p className="text-4xl mb-3">📋</p><p>No orders in this category.</p></div>
      ) : (
        <div className="flex flex-col gap-5">
          {filtered.map((order) => (
            <div key={order._id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 py-3 bg-gray-50 border-b">
                <div>
                  <p className="text-xs text-gray-400 font-mono">{order._id}</p>
                  <p className="text-xs text-gray-500 mt-0.5">👤 {order.user?.name || "Customer"} • {order.user?.phone}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
                    {getStatusLabel(order.status)}
                  </span>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="px-5 py-4">
                <div className="flex flex-col gap-1 text-sm">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-gray-700">
                      <span>{item.product?.name || "Product"} × {item.quantity}</span>
                      <span className="font-medium">₹{item.priceAtPurchase * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-3 pt-2 flex justify-between font-bold text-gray-800 text-sm">
                  <span>Total</span>
                  <span>₹{order.totalAmount}</span>
                </div>

                {/* Status actions */}
                {NEXT_STATUS[order.status] && (
                  <div className="mt-3 flex flex-col gap-2">
                    {order.status === "accepted" && !order.deliveryPartner && (
                      <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                        <span className="text-base">⏳</span>
                        <span className="text-sm font-semibold text-yellow-700">Waiting for a delivery partner to accept this order before you can mark it as prepared</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusUpdate(order._id, NEXT_STATUS[order.status])}
                        disabled={updating === order._id || (order.status === "accepted" && !order.deliveryPartner)}
                        title={order.status === "accepted" && !order.deliveryPartner ? "A delivery partner must accept the order first" : ""}
                        className="bg-[#FF5C00] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {updating === order._id ? "Updating..." : (NEXT_LABEL[order.status] || `Mark as ${getStatusLabel(NEXT_STATUS[order.status])}`)}
                      </button>
                      {["pending", "accepted"].includes(order.status) && (
                        <button
                          onClick={() => handleStatusUpdate(order._id, "cancelled")}
                          disabled={updating === order._id}
                          className="border border-red-300 text-red-500 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 transition disabled:opacity-60"
                        >
                          {order.status === "pending" ? "✕ Reject" : "Cancel"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VendorOrders;
