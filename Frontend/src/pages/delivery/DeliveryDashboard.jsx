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

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

function RazorpayUpiModal({ order, onPaid, onClose }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleCollect = async () => {
    setLoading(true);
    setErr("");
    try {
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) throw new Error("Razorpay key missing. Add VITE_RAZORPAY_KEY_ID in Frontend/.env");

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Failed to load Razorpay SDK. Check your internet connection.");

      const { razorpayOrder } = await api.post("/payment-api/delivery/create-order", { orderId: order._id });

      await new Promise((resolve, reject) => {
        const options = {
          key: razorpayKey,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          order_id: razorpayOrder.id,
          name: "ShinobiFeast",
          description: `Order #${order._id}`,
          theme: { color: "#FF5C00" },
          method: { upi: true, card: false, netbanking: false, wallet: false, emi: false },
          config: { display: { preferences: { show_default_blocks: false }, sequence: ["block.upi"], blocks: { upi: { name: "Pay via UPI", instruments: [{ method: "upi" }] } } } },
          handler: async (response) => {
            try {
              await api.post("/payment-api/delivery/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: order._id,
              });
              resolve();
            } catch (e) { reject(e); }
          },
          modal: { ondismiss: () => reject(new Error("Payment was cancelled.")) },
        };
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (resp) => reject(new Error(resp.error?.description || "Payment failed")));
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
          <h2 className="text-lg font-bold text-gray-800">📱 Collect UPI Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        </div>
        <p className="text-sm text-gray-500">Amount to collect: <span className="font-bold text-gray-800">₹{order.totalAmount}</span></p>
        <p className="text-xs text-gray-400">Tap below to open Razorpay checkout. The customer can scan the UPI QR or pay via their UPI app.</p>
        {err && <p className="text-red-500 text-sm font-medium">{err}</p>}
        <button
          onClick={handleCollect}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition disabled:opacity-60"
        >
          {loading ? "Opening Razorpay..." : "📱 Open UPI Checkout"}
        </button>
        <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 text-center">Cancel</button>
      </div>
    </div>
  );
}

function OrderCard({ order, actions }) {
  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 py-3 bg-gray-50 border-b">
        <div>
          <p className="font-mono text-xs text-gray-400">{order._id}</p>
          <p className="text-sm text-gray-700 font-medium mt-0.5">
            👤 {order.user?.name}
            {order.user?.phone && <span className="text-gray-400 font-normal"> • {order.user.phone}</span>}
          </p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize self-start sm:self-auto ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
          {getStatusLabel(order.status)}
        </span>
      </div>

      {/* Items */}
      <div className="px-5 py-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items to pick up</p>
        <div className="flex flex-col gap-2">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.product?.imageUrl && (
                <img src={item.product.imageUrl} alt={item.product.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 flex justify-between text-sm">
                <span className="text-gray-700 font-medium">{item.product?.name || "Product"} <span className="text-gray-400 font-normal">× {item.quantity}</span></span>
                <span className="font-semibold text-gray-800">₹{item.priceAtPurchase * item.quantity}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t mt-3 pt-3 flex justify-between font-bold text-gray-800">
          <span>Total</span>
          <span>₹{order.totalAmount}</span>
        </div>
        {order.paymentStatus !== "paid" && (
          <div className="mt-2 flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
            <span className="text-lg">💵</span>
            <span className="text-sm font-semibold text-yellow-700">COD — Collect ₹{order.totalAmount} cash from customer</span>
          </div>
        )}

        {order.status === "out-for-delivery" && (
          <div className="mt-2 flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
            <span className="text-lg">🚚</span>
            <span className="text-sm font-semibold text-purple-700">Picked up from restaurant — on the way to customer</span>
          </div>
        )}

        {/* Action buttons */}
        {actions && <div className="flex flex-wrap gap-2 mt-4">{actions(order)}</div>}
      </div>
    </div>
  );
}

function DeliveryDashboard() {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [loadingMine, setLoadingMine] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [profileForm, setProfileForm] = useState({ vehicleType: "bike", vehicleNumber: "" });
  const [profileMsg, setProfileMsg] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
    const [existingProfile, setExistingProfile] = useState(null);
    const [profileFetching, setProfileFetching] = useState(false);
  const [tab, setTab] = useState("available");
  const [upiQrOrder, setUpiQrOrder] = useState(null);
  // OTP state: { [orderId]: { value, error, verified, loading } }
  const [otpState, setOtpState] = useState({});

  const setOtp = (orderId, patch) =>
    setOtpState((prev) => ({ ...prev, [orderId]: { ...prev[orderId], ...patch } }));

  const fetchAvailable = useCallback(async () => {
    setLoadingAvailable(true);
    try {
      const data = await api.get("/delivery-api/available-orders");
      setAvailableOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAvailable(false);
    }
  }, []);

  const fetchMine = useCallback(async () => {
    setLoadingMine(true);
    try {
      const data = await api.get("/delivery-api/my-deliveries");
      setMyDeliveries(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMine(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await api.get("/delivery-api/history");
      setHistoryOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailable();
    fetchMine();
  }, [fetchAvailable, fetchMine]);

  // Fetch history when tab is first switched to "history"
  useEffect(() => {
    if (tab === "history") fetchHistory();
  }, [tab, fetchHistory]);

    useEffect(() => {
      if (tab === "profile" && existingProfile === null) {
        setProfileFetching(true);
        api.get("/delivery-api/profile")
          .then((data) => {
            setExistingProfile(data.profile);
            setProfileForm({
              vehicleType: data.profile.vehicleType || "bike",
              vehicleNumber: data.profile.vehicleNumber || "",
              currentLocation: data.profile.currentLocation || "",
            });
          })
          .catch(() => {
            setExistingProfile(false); // false = no profile yet
          })
          .finally(() => setProfileFetching(false));
      }
    }, [tab, existingProfile]);

  // Auto-refresh every 15s so stale "On The Way" orders disappear once delivered
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchAvailable();
        fetchMine();
      }
    }, 15000);

    const handleFocus = () => { fetchAvailable(); fetchMine(); };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchAvailable();
        fetchMine();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchAvailable, fetchMine]);

  const handleAccept = async (orderId) => {
    setActionLoading(orderId + "_accept");
    try {
      await api.put(`/delivery-api/order/${orderId}/accept`, {});
      setTab("mine");
    } catch (err) {
      alert(err.message);
    } finally {
      // Always refresh both lists so stale cards are cleared even on error
      await Promise.all([fetchAvailable(), fetchMine()]);
      setActionLoading(null);
    }
  };

  const handleDelivered = async (orderId) => {
    setActionLoading(orderId + "_delivered");
    try {
      await api.put(`/delivery-api/order/${orderId}/delivered`, {});
    } catch (err) {
      alert(err.message);
    } finally {
      await fetchMine();
      setActionLoading(null);
    }
  };

  const handleVerifyOtp = async (orderId) => {
    const otp = otpState[orderId]?.value || "";
    if (otp.length !== 6) {
      setOtp(orderId, { error: "Enter the 6-digit OTP" });
      return;
    }
    setOtp(orderId, { loading: true, error: "" });
    try {
      await api.put(`/delivery-api/order/${orderId}/verify-otp`, { otp });
      setOtp(orderId, { loading: false, verified: true, error: "" });
      // Now mark delivered
      await handleDelivered(orderId);
    } catch (err) {
      setOtp(orderId, { loading: false, error: err.message || "Invalid OTP" });
    }
  };

  const handleOutForDelivery = async (orderId) => {
    setActionLoading(orderId + "_outfordelivery");
    try {
      await api.put(`/delivery-api/order/${orderId}/out-for-delivery`, {});
    } catch (err) {
      alert(err.message);
    } finally {
      await fetchMine();
      setActionLoading(null);
    }
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg("");
    try {
        if (existingProfile) {
          const data = await api.put("/delivery-api/profile", profileForm);
          setExistingProfile(data.profile);
          setProfileMsg("Profile updated successfully!");
        } else {
          const data = await api.post("/delivery-api/create-profile", profileForm);
          setExistingProfile(data.profile);
          setProfileMsg("Delivery profile created successfully!");
        }
    } catch (err) {
      setProfileMsg(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const tabs = [
    { key: "available", label: `Available (${availableOrders.length})` },
    { key: "mine", label: `My Deliveries (${myDeliveries.length})` },
    { key: "history", label: "History" },
    { key: "profile", label: "Profile" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">🚴 Delivery Hub</h1>

      {/* Razorpay UPI Payment Modal */}
      {upiQrOrder && (
        <RazorpayUpiModal
          order={upiQrOrder}
          onPaid={() => { setUpiQrOrder(null); fetchMine(); }}
          onClose={() => setUpiQrOrder(null)}
        />
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition ${tab === t.key ? "bg-[#FF5C00] text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Available Orders ── */}
      {tab === "available" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-700">Orders Accepted — Ready to Assign</h2>
            <button onClick={() => { fetchAvailable(); fetchMine(); }} className="text-sm text-[#FF5C00] hover:underline font-medium">
              ↻ Refresh
            </button>
          </div>

          {loadingAvailable ? (
            <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse" />)}</div>
          ) : availableOrders.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">🚴</p>
              <p className="text-lg font-medium">No available orders right now</p>
              <p className="text-sm mt-1">New orders appear here once a vendor accepts them</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {availableOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  actions={(o) => (
                    // Backend getAvailableOrders returns status="accepted" with deliveryPartner=null
                    <button
                      onClick={() => handleAccept(o._id)}
                      disabled={actionLoading === o._id + "_accept"}
                      className="bg-[#FF5C00] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-60"
                    >
                      {actionLoading === o._id + "_accept" ? "Accepting..." : "✓ Accept Delivery"}
                    </button>
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── My Active Deliveries ── */}
      {tab === "mine" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-700">My Active Deliveries</h2>
            <button onClick={fetchMine} className="text-sm text-[#FF5C00] hover:underline font-medium">
              ↻ Refresh
            </button>
          </div>

          {loadingMine ? (
            <div className="space-y-4">{[...Array(2)].map((_, i) => <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse" />)}</div>
          ) : myDeliveries.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">📦</p>
              <p className="text-lg font-medium">No active deliveries</p>
              <p className="text-sm mt-1">Accept an order from the Available tab to start delivering</p>
              <button
                onClick={() => setTab("available")}
                className="mt-4 bg-[#FF5C00] text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-orange-600 transition"
              >
                Browse Available Orders
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {myDeliveries.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  actions={(o) =>
                    ["accepted", "preparing"].includes(o.status) ? (
                      <button
                        onClick={() => handleOutForDelivery(o._id)}
                        disabled={actionLoading === o._id + "_outfordelivery"}
                        className="bg-[#FF5C00] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-60"
                      >
                        {actionLoading === o._id + "_outfordelivery" ? "Updating..." : "🚴 Picked Up • Start Delivery"}
                      </button>
                    ) : o.status === "out-for-delivery" ? (
                      <div className="flex flex-col gap-2 w-full">
                        {/* Payment collection indicator */}
                        {o.paymentStatus !== "paid" && (
                          o.codPreference === "upi" ? (
                            <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                              <span className="text-base">📱</span>
                              <span className="text-sm font-semibold text-purple-700">Customer will pay via UPI — show them the QR</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                              <span className="text-base">💵</span>
                              <span className="text-sm font-semibold text-yellow-700">Collect ₹{o.totalAmount} cash from customer</span>
                            </div>
                          )
                        )}

                        {/* OTP verification */}
                        {!otpState[o._id]?.verified ? (
                          <div className="flex flex-col gap-2 bg-orange-50 border-2 border-dashed border-[#FF5C00] rounded-xl px-4 py-3">
                            <p className="text-xs font-semibold text-gray-600">🔐 Enter the 6-digit OTP from the customer to confirm delivery</p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="_ _ _ _ _ _"
                                value={otpState[o._id]?.value || ""}
                                onChange={(e) => setOtp(o._id, { value: e.target.value.replace(/\D/g, "").slice(0, 6), error: "" })}
                                className="flex-1 text-center text-xl font-bold tracking-[0.3em] border-2 border-orange-300 rounded-xl p-2 outline-none focus:border-[#FF5C00]"
                              />
                              <button
                                onClick={() => handleVerifyOtp(o._id)}
                                disabled={otpState[o._id]?.loading || actionLoading === o._id + "_delivered"}
                                className="bg-[#FF5C00] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition disabled:opacity-60"
                              >
                                {otpState[o._id]?.loading ? "Verifying..." : "Verify"}
                              </button>
                            </div>
                            {otpState[o._id]?.error && (
                              <p className="text-xs text-red-500 font-medium">{otpState[o._id].error}</p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                            <span className="text-base">✅</span>
                            <span className="text-sm font-semibold text-green-700">OTP verified — marking delivered...</span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {o.paymentStatus !== "paid" && o.codPreference === "upi" && (
                            <button
                              onClick={() => setUpiQrOrder(o)}
                              className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
                            >
                              📱 Show UPI QR
                            </button>
                          )}
                        </div>
                      </div>
                    ) : null
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── History ── */}
      {tab === "history" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-700">Delivery History</h2>
            <button onClick={fetchHistory} className="text-sm text-[#FF5C00] hover:underline font-medium">
              ↻ Refresh
            </button>
          </div>
          {loadingHistory ? (
            <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />)}</div>
          ) : historyOrders.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">📋</p>
              <p className="text-lg font-medium">No completed deliveries yet</p>
              <p className="text-sm mt-1">Finished deliveries will appear here</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {historyOrders.map((order) => (
                <OrderCard key={order._id} order={order} actions={null} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Profile ── */}
      {tab === "profile" && (
        <div className="max-w-md">
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
              {profileFetching ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-200 rounded-xl animate-pulse" />)}</div>
              ) : (
              <>
              <h2 className="text-lg font-bold text-gray-700 mb-5">{existingProfile ? "My Delivery Profile" : "Create Delivery Profile"}</h2>
              <form onSubmit={handleCreateProfile} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">Vehicle Type</label>
                <select
                  value={profileForm.vehicleType}
                  onChange={(e) => setProfileForm({ ...profileForm, vehicleType: e.target.value })}
                  className="w-full p-3 border rounded-xl outline-none text-sm focus:ring-2 focus:ring-orange-300 bg-white"
                >
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                  <option value="cycle">Cycle</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">Vehicle Number</label>
                <input
                  type="text"
                  value={profileForm.vehicleNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, vehicleNumber: e.target.value })}
                  placeholder="e.g. MH12 AB1234"
                  className="w-full p-3 border rounded-xl outline-none text-sm focus:ring-2 focus:ring-orange-300"
                />
              </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Current Location</label>
                  <input
                    type="text"
                    value={profileForm.currentLocation || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, currentLocation: e.target.value })}
                    placeholder="e.g. Andheri West, Mumbai"
                    className="w-full p-3 border rounded-xl outline-none text-sm focus:ring-2 focus:ring-orange-300"
                  />
                </div>
              {profileMsg && (
                <p className={`text-sm font-medium ${profileMsg.includes("success") ? "text-green-600" : "text-red-500"}`}>{profileMsg}</p>
              )}
              <button
                type="submit"
                disabled={profileLoading}
                className="bg-[#FF5C00] text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-60"
              >
                  {profileLoading ? "Saving..." : existingProfile ? "Update Profile" : "Create Profile"}
              </button>
            </form>
              </>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DeliveryDashboard;

