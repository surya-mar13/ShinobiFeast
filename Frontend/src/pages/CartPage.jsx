import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../utils/api";
import LocationInput from "../components/LocationInput";

const METHODS = [
  { id: "COD",  label: "Cash on Delivery", icon: "💵" },
  { id: "CARD", label: "Credit / Debit Card", icon: "💳" },
  { id: "UPI",  label: "UPI",               icon: "📱" },
];

const STEPS = [
  { id: 1, label: "Cart" },
  { id: 2, label: "Address" },
  { id: 3, label: "Payment" },
];

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center mb-8 gap-0">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
              currentStep > s.id
                ? "bg-green-500 border-green-500 text-white"
                : currentStep === s.id
                ? "bg-[#FF5C00] border-[#FF5C00] text-white"
                : "bg-white border-gray-300 text-gray-400"
            }`}>
              {currentStep > s.id ? "✓" : s.id}
            </div>
            <span className={`text-xs mt-1 font-medium ${currentStep === s.id ? "text-[#FF5C00]" : currentStep > s.id ? "text-green-600" : "text-gray-400"}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-16 sm:w-24 h-0.5 mb-4 mx-1 transition-all ${currentStep > s.id ? "bg-green-400" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function CartPage() {
  const { cart, loading, updateQuantity, removeFromCart, fetchCart } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  // Step 2 — Address
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || "");
  const [locationStr, setLocationStr] = useState(user?.location || "");
  const [addressType, setAddressType] = useState("home");
  const [otherLabel, setOtherLabel] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoMsg, setGeoMsg] = useState("");

  // Step 3 — Payment
  const [method, setMethod]               = useState("COD");
  const [codPreference, setCodPreference] = useState("cash");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [msg, setMsg]                     = useState({ text: "", ok: false });

  // Coupon
  const [couponInput, setCouponInput]       = useState("");
  const [couponLoading, setCouponLoading]   = useState(false);
  const [couponMsg, setCouponMsg]           = useState("");
  const [appliedCoupon, setAppliedCoupon]   = useState(null);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponMsg("");
    setAppliedCoupon(null);
    try {
      const cartItems = cart?.items || [];
      const restaurantIds = [...new Set(
        cartItems.map(i => i.product?.restaurant?._id || i.product?.restaurant).filter(Boolean)
      )];
      const sub = cartItems.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
      const data = await api.post("/common-api/validate-coupon", { code, restaurantIds, subtotal: sub });
      setAppliedCoupon(data.coupon);
      setCouponMsg(`✅ ${data.message} — saving ₹${data.coupon.discount}`);
    } catch (err) {
      setCouponMsg(`❌ ${err.message}`);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => { setAppliedCoupon(null); setCouponInput(""); setCouponMsg(""); };

  // ── Geolocation detect ────────────────────────────────────────────────────
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoMsg("Geolocation not supported by your browser.");
      return;
    }
    setGeoLoading(true);
    setGeoMsg("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || "";
          const state = addr.state || "";
          setDeliveryAddress(data.display_name || "");
          setLocationStr([city, state].filter(Boolean).join(", "));
          setGeoMsg("✅ Location detected — review and continue.");
        } catch {
          setGeoMsg("Could not fetch address. Please enter manually.");
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        setGeoLoading(false);
        setGeoMsg(err.code === 1 ? "Location permission denied." : "Unable to detect location.");
      },
      { timeout: 10000 }
    );
  };

  // ── Place order ────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setCheckoutLoading(true);
    setMsg({ text: "", ok: false });
    const typeLabel = addressType === "other" ? (otherLabel.trim() || "Other") : addressType === "home" ? "Home" : "Work";
    const fullAddress = [typeLabel, deliveryAddress, locationStr].filter(Boolean).join(", ");
    try {
      const orderData = await api.post("/order-api/checkout", { deliveryAddress: fullAddress, couponCode: appliedCoupon?.code || "" });
      const orderId = orderData?.order?._id;
      if (!orderId) throw new Error("Unable to create order");

      if (method === "COD") {
        await api.post("/payment-api/pay", { orderId, method: "COD", codPreference });
        setMsg({ text: "Order placed! Pay on delivery.", ok: true });
        setAppliedCoupon(null); setCouponInput(""); setCouponMsg("");
        await fetchCart();
        setTimeout(() => navigate("/orders"), 1800);
        return;
      }

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) throw new Error("Razorpay key is missing. Add VITE_RAZORPAY_KEY_ID in Frontend/.env and restart frontend.");

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Failed to load Razorpay SDK. Check your internet connection.");

      const { razorpayOrder } = await api.post("/payment-api/create-order", { orderId });

      await new Promise((resolve, reject) => {
        const options = {
          key: razorpayKey,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          order_id: razorpayOrder.id,
          name: "ShinobiFeast",
          description: `Order #${orderId}`,
          theme: { color: "#FF5C00" },
          handler: async (response) => {
            try {
              await api.post("/payment-api/verify", {
                razorpay_order_id:  response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                orderId,
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

      setMsg({ text: "Payment successful! Order confirmed.", ok: true });
      setAppliedCoupon(null); setCouponInput(""); setCouponMsg("");
      await fetchCart();
      setTimeout(() => navigate("/orders"), 1800);
    } catch (err) {
      setMsg({ text: err.message, ok: false });
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading)
    return <div className="flex justify-center items-center h-64"><span className="animate-pulse text-gray-400 text-lg">Loading cart...</span></div>;

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);
  const discountAmount = appliedCoupon?.discount || 0;
  const total = Math.max(0, subtotal - discountAmount);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">🛒 Checkout</h1>

      {items.length === 0 && step === 1 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <span className="text-6xl">🛒</span>
          <p className="text-gray-500 text-lg">Your cart is empty</p>
          <Link to="/restaurants" className="bg-[#FF5C00] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-orange-600 transition">
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <>
          <StepIndicator currentStep={step} />

          {/* ── STEP 1: CART ─────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              {items.map((item) => {
                const p = item.product;
                return (
                  <div key={item._id} className="bg-white border rounded-xl p-4 shadow-sm flex gap-4 items-center">
                    <img
                      src={p?.imageUrl || "https://via.placeholder.com/80x80?text=Food"}
                      alt={p?.name}
                      className="w-16 h-16 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{p?.name}</h3>
                      <p className="text-gray-500 text-xs truncate">{p?.description}</p>
                      <p className="text-[#FF5C00] font-bold mt-1">₹{p?.price}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <button onClick={() => item.quantity > 1 ? updateQuantity(p._id, item.quantity - 1) : removeFromCart(p._id)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-lg font-bold">−</button>
                        <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(p._id, item.quantity + 1)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-lg font-bold">+</button>
                      </div>
                      <button onClick={() => removeFromCart(p._id)} className="text-red-400 hover:text-red-600 text-xs font-medium">Remove</button>
                    </div>
                  </div>
                );
              })}

              {/* Coupon code */}
              <div className="bg-white border rounded-xl px-4 py-4 shadow-sm">
                <p className="text-sm font-semibold text-gray-700 mb-2">🎟️ Have a coupon?</p>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div>
                      <span className="font-bold text-green-700 tracking-wide font-mono">{appliedCoupon.code}</span>
                      <span className="text-xs text-green-600 ml-2">from {appliedCoupon.restaurantName}</span>
                      <p className="text-green-700 font-semibold text-sm">−₹{appliedCoupon.discount} saved!</p>
                    </div>
                    <button onClick={removeCoupon} className="text-red-400 hover:text-red-600 font-bold text-lg">✕</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      placeholder="Enter coupon code"
                      className="flex-1 p-2.5 border rounded-lg text-sm font-mono uppercase outline-none focus:ring-2 focus:ring-orange-300"
                    />
                    <button onClick={handleApplyCoupon} disabled={couponLoading || !couponInput.trim()} className="px-4 py-2.5 bg-[#FF5C00] text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition disabled:opacity-60">
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                )}
                {couponMsg && <p className={`text-xs mt-1.5 font-medium ${couponMsg.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>{couponMsg}</p>}
              </div>

              {/* Subtotal / discount / total */}
              <div className="bg-white border rounded-xl px-5 py-4 shadow-sm flex flex-col gap-1.5 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>�️ Coupon ({appliedCoupon?.code})</span>
                    <span>−₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-2 mt-1">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-[#FF5C00] text-white py-3.5 rounded-xl font-bold hover:bg-orange-600 transition text-base"
              >
                Proceed to Address →
              </button>
              <Link to="/restaurants" className="block text-center text-[#FF5C00] text-sm font-medium hover:underline">
                ← Continue Shopping
              </Link>
            </div>
          )}

          {/* ── STEP 2: ADDRESS & LOCATION ───────────────────────────────── */}
          {step === 2 && (
            <div className="bg-white border rounded-2xl shadow-sm p-6 flex flex-col gap-4">
              <h2 className="text-lg font-bold text-gray-800">📍 Delivery Address</h2>

              {/* Geo-detect button */}
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={geoLoading}
                className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-orange-300 text-[#FF5C00] py-3 rounded-xl text-sm font-semibold hover:bg-orange-50 transition disabled:opacity-60"
              >
                {geoLoading ? (
                  <><span className="animate-spin">⏳</span> Detecting location...</>
                ) : (
                  <><span>📡</span> Detect my location automatically</>
                )}
              </button>
              {geoMsg && (
                <p className={`text-xs font-medium -mt-2 ${geoMsg.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>{geoMsg}</p>
              )}

              <p className="text-xs text-gray-400 text-center -mt-2">— or enter manually —</p>

              {/* Address type */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Save As</label>
                <div className="flex gap-2">
                  {[{ id: "home", icon: "🏠", label: "Home" }, { id: "work", icon: "💼", label: "Work" }, { id: "other", icon: "📌", label: "Other" }].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setAddressType(t.id)}
                      className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-xs font-semibold transition ${
                        addressType === t.id
                          ? "border-[#FF5C00] bg-orange-50 text-[#FF5C00]"
                          : "border-gray-200 text-gray-500 hover:border-orange-200"
                      }`}
                    >
                      <span className="text-lg">{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
                {addressType === "other" && (
                  <input
                    type="text"
                    value={otherLabel}
                    onChange={(e) => setOtherLabel(e.target.value)}
                    placeholder="Enter a name (e.g. Parents, Gym…)"
                    className="mt-2 w-full p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Full Address</label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="House / Flat no., Street, Landmark..."
                  rows={3}
                  className="w-full p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">City / Area</label>
                <LocationInput
                  value={locationStr}
                  onChange={(val) => setLocationStr(val)}
                  placeholder="e.g. Mumbai, Andheri West"
                  inputClassName="w-full p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition text-sm"
                >
                  ← Back
                </button>
                <button
                  onClick={() => {
                    if (!deliveryAddress.trim()) {
                      setGeoMsg("Please enter your delivery address.");
                      return;
                    }
                    if (addressType === "other" && !otherLabel.trim()) {
                      setGeoMsg("Please enter a name for your 'Other' address.");
                      return;
                    }
                    setGeoMsg("");
                    setStep(3);
                  }}
                  className="flex-1 bg-[#FF5C00] text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition text-sm"
                >
                  Continue to Payment →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: PAYMENT ──────────────────────────────────────────── */}
          {step === 3 && (
            <div className="bg-white border rounded-2xl shadow-sm p-6 flex flex-col gap-5">
              <h2 className="text-lg font-bold text-gray-800">💳 Payment</h2>

              {/* Mini order summary */}
              <div className="bg-gray-50 rounded-xl px-4 py-3 flex flex-col gap-1.5 text-sm text-gray-600">
                {items.map((item) => (
                  <div key={item._id} className="flex justify-between">
                    <span className="truncate mr-2">{item.product?.name} × {item.quantity}</span>
                    <span className="font-medium text-gray-700">₹{(item.product?.price || 0) * item.quantity}</span>
                  </div>
                ))}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>�️ Coupon ({appliedCoupon?.code})</span>
                    <span>−₹{discountAmount}</span>
                  </div>
                )}
                <div className="border-t mt-2 pt-2 flex justify-between font-bold text-gray-800">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              {/* Delivery address summary */}
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-base mt-0.5">📍</span>
                <div>
                  <span className="font-semibold text-[#FF5C00] mr-1">
                    {addressType === "home" ? "🏠 Home" : addressType === "work" ? "💼 Work" : `📌 ${otherLabel || "Other"}`}
                  </span>
                  <span className="leading-snug">{[deliveryAddress, locationStr].filter(Boolean).join(", ")}</span>
                </div>
              </div>

              {/* Payment method */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Payment Method</p>
                <div className="flex flex-col gap-2">
                  {METHODS.map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${
                        method === m.id ? "border-[#FF5C00] bg-orange-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input type="radio" name="paymentMethod" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="accent-[#FF5C00]" />
                      <span className="text-lg">{m.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{m.label}</span>
                    </label>
                  ))}
                </div>

                {/* COD sub-preference */}
                {method === "COD" && (
                  <div className="mt-3 border rounded-xl p-3 bg-gray-50 flex flex-col gap-2">
                    <p className="text-xs font-semibold text-gray-500">How will you pay at the door?</p>
                    {[
                      { id: "cash", label: "Cash", icon: "💵" },
                      { id: "upi",  label: "UPI (agent shows QR)", icon: "📱" },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3 p-2.5 border rounded-lg cursor-pointer transition ${
                          codPreference === opt.id ? "border-[#FF5C00] bg-orange-50" : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input type="radio" name="codPref" value={opt.id} checked={codPreference === opt.id} onChange={() => setCodPreference(opt.id)} className="accent-[#FF5C00]" />
                        <span>{opt.icon}</span>
                        <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {method !== "COD" && (
                  <p className="text-xs text-gray-400 mt-3">🔒 Card / UPI details are entered securely in the Razorpay popup — never stored by us.</p>
                )}
              </div>

              {msg.text && (
                <p className={`text-sm font-medium ${msg.ok ? "text-green-600" : "text-red-500"}`}>{msg.text}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setMsg({ text: "", ok: false }); setStep(2); }}
                  disabled={checkoutLoading}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition text-sm disabled:opacity-60"
                >
                  ← Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={checkoutLoading}
                  className="flex-1 bg-[#FF5C00] text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-60 text-sm"
                >
                  {checkoutLoading
                    ? "Processing..."
                    : method === "COD"
                    ? "Place Order (COD)"
                    : `Pay ₹${total} via Razorpay`}                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CartPage;
