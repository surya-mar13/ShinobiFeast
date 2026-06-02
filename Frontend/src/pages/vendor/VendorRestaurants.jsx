import { useState, useEffect, useRef } from "react";
import { api } from "../../utils/api";

const EMPTY_FORM = {
  name: "", location: "", offer: "", category: [], variety: [], coupons: []
};

const EMPTY_COUPON = { code: "", discountType: "percent", discountValue: "", minOrder: "" };

const CATEGORIES = ["veg", "non-veg"];
const VARIETIES = ["north-indian", "south-indian", "chinese", "italian", "american", "japanese", "mexican", "fast-food", "desserts", "seafood", "street-food", "cafe", "bbq", "vegan", "pan-asian", "multi-cuisine"];

function VendorRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const imgRef = useRef(null);
  const [newCoupon, setNewCoupon] = useState(EMPTY_COUPON);

  const fetch = async () => {
    try {
      const data = await api.get("/vendor-api/myrestaurants");
      setRestaurants(data.restaurants || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleToggle = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: "", type: "" });
    try {
      let savedId = editId;
      if (editId) {
        await api.put(`/restraunt-api/updaterestaurant/${editId}`, form);
      } else {
        const res = await api.post("/restraunt-api/registerrestaurant", form);
        savedId = res.restaurant._id;
      }
      // Upload image if one was selected
      if (imageFile && savedId) {
        await api.upload(`/upload-api/restaurant/${savedId}`, imageFile);
      }
      setMsg({ text: editId ? "Restaurant updated!" : "Restaurant created!", type: "success" });
      setForm(EMPTY_FORM);
      setEditId(null);
      setShowForm(false);
      setImageFile(null);
      setImagePreview("");
      await fetch();
    } catch (err) {
      setMsg({ text: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const addCoupon = () => {
    const code = newCoupon.code.trim().toUpperCase();
    if (!code || !newCoupon.discountValue) return;
    setForm(prev => ({
      ...prev,
      coupons: [...prev.coupons, {
        code,
        discountType: newCoupon.discountType,
        discountValue: Number(newCoupon.discountValue),
        minOrder: Number(newCoupon.minOrder) || 0,
      }],
    }));
    setNewCoupon(EMPTY_COUPON);
  };

  const removeCoupon = (idx) => {
    setForm(prev => ({ ...prev, coupons: prev.coupons.filter((_, i) => i !== idx) }));
  };

  const handleEdit = (r) => {
     setForm({ name: r.name, location: r.location, offer: r.offer || "", category: r.category || [], variety: r.variety || [], coupons: r.coupons || [] });
    setEditId(r._id);
    setImageFile(null);
    setImagePreview(r.image || "");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this restaurant and all its products?")) return;
    try {
      await api.delete(`/restraunt-api/deleterestaurant/${id}`);
      await fetch();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">🏪 My Restaurants</h1>
        <button
          onClick={() => { setForm(EMPTY_FORM); setEditId(null); setImageFile(null); setImagePreview(""); setShowForm(true); }}
          className="bg-[#FF5C00] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-orange-600 transition"
        >
          + Add Restaurant
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border-2 border-orange-200 rounded-2xl p-6 mb-8 shadow"
        >
          <h2 className="font-bold text-lg text-gray-700 mb-4">{editId ? "Edit Restaurant" : "New Restaurant"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Restaurant Name" className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-orange-300 text-sm" />
            <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-orange-300 text-sm" />
              <input value={form.offer} onChange={(e) => setForm({ ...form, offer: e.target.value })} placeholder="Offer text (e.g. 20% off on first order)" className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-orange-300 text-sm sm:col-span-2" />
            {/* Image upload */}
            <div className="flex items-center gap-3">
              {imagePreview && <img src={imagePreview} alt="preview" className="w-12 h-12 rounded-lg object-cover border shrink-0" />}
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Restaurant Image</label>
                <input ref={imgRef} type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-[#FF5C00] hover:file:bg-orange-100 cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Category</p>
            <div className="flex gap-3 flex-wrap">
              {CATEGORIES.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.category.includes(c)} onChange={() => handleToggle("category", c)} className="accent-orange-500" />
                  <span className="capitalize">{c}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Variety</p>
            <div className="flex gap-3 flex-wrap">
              {VARIETIES.map((v) => (
                <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.variety.includes(v)} onChange={() => handleToggle("variety", v)} className="accent-orange-500" />
                  <span className="capitalize">{v.replace("-", " ")}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Coupon Manager */}
          <div className="mt-5">
            <p className="text-sm font-medium text-gray-600 mb-2">🎟️ Coupons</p>
            {form.coupons.length > 0 && (
              <div className="flex flex-col gap-2 mb-3">
                {form.coupons.map((c, i) => (
                  <div key={i} className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-sm">
                    <span className="font-bold text-orange-700 tracking-wide font-mono">{c.code}</span>
                    <span className="text-gray-600">
                      {c.discountType === "percent" ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
                      {c.minOrder > 0 && <span className="text-gray-400 ml-1">(min ₹{c.minOrder})</span>}
                    </span>
                    <button type="button" onClick={() => removeCoupon(i)} className="text-red-400 hover:text-red-600 font-bold ml-2">✕</button>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <input value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} placeholder="CODE" className="p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-orange-300 text-sm font-mono uppercase" />
              <select value={newCoupon.discountType} onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })} className="p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-orange-300 text-sm">
                <option value="percent">% Off</option>
                <option value="flat">₹ Flat Off</option>
              </select>
              <input type="number" min="1" value={newCoupon.discountValue} onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })} placeholder={newCoupon.discountType === "percent" ? "e.g. 20" : "e.g. 100"} className="p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-orange-300 text-sm" />
              <input type="number" min="0" value={newCoupon.minOrder} onChange={(e) => setNewCoupon({ ...newCoupon, minOrder: e.target.value })} placeholder="Min order ₹" className="p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-orange-300 text-sm" />
            </div>
            <button type="button" onClick={addCoupon} disabled={!newCoupon.code.trim() || !newCoupon.discountValue} className="mt-2 text-sm font-semibold text-[#FF5C00] border border-orange-300 px-4 py-1.5 rounded-lg hover:bg-orange-50 transition disabled:opacity-40">
              + Add Coupon
            </button>
          </div>

          {msg.text && <p className={`text-sm mt-3 ${msg.type === "success" ? "text-green-600" : "text-red-500"}`}>{msg.text}</p>}

          <div className="flex gap-3 mt-5">
            <button type="submit" disabled={saving} className="bg-[#FF5C00] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-orange-600 transition disabled:opacity-60">
              {saving ? "Saving..." : editId ? "Update" : "Create"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); setImageFile(null); setImagePreview(""); }} className="border px-6 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <div key={i} className="h-52 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🏪</p>
          <p>No restaurants yet. Add your first restaurant!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {restaurants.map((r) => (
            <div key={r._id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
              <img
                src={r.image || "https://via.placeholder.com/400x160?text=Restaurant"}
                alt={r.name}
                className="w-full h-36 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-gray-800">{r.name}</h3>
                <p className="text-gray-500 text-sm">📍 {r.location}</p>
                <div className="flex gap-1 flex-wrap mt-2">
                  {r.category?.map((c) => <span key={c} className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full capitalize">{c}</span>)}
                  {r.variety?.map((v) => <span key={v} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">{v}</span>)}
                </div>
                {r.coupons?.length > 0 && (
                  <p className="text-xs text-green-600 font-semibold mt-1.5">🎟️ {r.coupons.length} coupon{r.coupons.length > 1 ? "s" : ""} active</p>
                )}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleEdit(r)} className="flex-1 text-sm border border-orange-400 text-orange-500 py-1.5 rounded-lg hover:bg-orange-50 transition font-medium">Edit</button>
                  <button onClick={() => handleDelete(r._id)} className="flex-1 text-sm border border-red-300 text-red-500 py-1.5 rounded-lg hover:bg-red-50 transition font-medium">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VendorRestaurants;
