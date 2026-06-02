import { useState, useEffect, useRef } from "react";
import { api } from "../../utils/api";

const EMPTY_FORM = { name: "", description: "", price: "", category: "", restaurant: "", isVeg: false };

const FOOD_CATEGORIES = [
  "Biryani", "Chicken", "Mutton", "Beef", "Pork", "Seafood",
  "Pizza", "Burger", "Pasta", "Noodles", "Sushi", "Tacos", "Burrito",
  "Dosa", "Idli", "Rice", "Bread", "Sandwich", "Wrap",
  "Soup", "Salad", "Bowl", "Snack", "Veg",
  "Dessert", "Ice Cream", "Bakery", "Coffee", "Drink",
];

function VendorProducts() {
  const [products, setProducts] = useState([]);
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

  const fetchData = async () => {
    try {
      const [p, r] = await Promise.all([api.get("/vendor-api/myproducts"), api.get("/vendor-api/myrestaurants")]);
      setProducts(p.products || []);
      setRestaurants(r.restaurants || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: "", type: "" });
    try {
      const payload = { ...form, price: Number(form.price) };
      let savedId = editId;
      if (editId) {
        await api.put(`/product-api/updateproduct/${editId}`, payload);
      } else {
        const res = await api.post("/product-api/addproduct", payload);
        savedId = res.product._id;
      }
      // Upload image if one was selected
      if (imageFile && savedId) {
        await api.upload(`/upload-api/product/${savedId}`, imageFile);
      }
      setMsg({ text: editId ? "Product updated!" : "Product added!", type: "success" });
      setForm(EMPTY_FORM);
      setEditId(null);
      setShowForm(false);
      setImageFile(null);
      setImagePreview("");
      await fetchData();
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

  const handleEdit = (p) => {
     setForm({ name: p.name, description: p.description, price: p.price, category: p.category, restaurant: p.restaurant?._id || p.restaurant, isVeg: p.isVeg || false });
    setEditId(p._id);
    setImageFile(null);
    setImagePreview(p.imageUrl || "");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/product-api/deleteproduct/${id}`);
      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">🍕 My Products</h1>
        <button
          onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); }}
          className="bg-[#FF5C00] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-orange-600 transition"
        >
          + Add Product
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border-2 border-orange-200 rounded-2xl p-6 mb-8 shadow">
          <h2 className="font-bold text-lg text-gray-700 mb-4">{editId ? "Edit Product" : "New Product"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product Name" className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-orange-300 text-sm" />
            <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price (₹)" className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-orange-300 text-sm" />
            <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-orange-300 text-sm text-gray-700">
              <option value="">Select Category</option>
              {FOOD_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {/* Image upload */}
            <div className="flex items-center gap-3">
              {imagePreview && <img src={imagePreview} alt="preview" className="w-12 h-12 rounded-lg object-cover border shrink-0" />}
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Product Image</label>
                <input ref={imgRef} type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-[#FF5C00] hover:file:bg-orange-100 cursor-pointer" />
              </div>
            </div>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-orange-300 text-sm sm:col-span-2 resize-none" />
            <select required value={form.restaurant} onChange={(e) => setForm({ ...form, restaurant: e.target.value })} className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-orange-300 text-sm sm:col-span-2">
              <option value="">Select Restaurant</option>
              {restaurants.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
              <label className="flex items-center gap-3 cursor-pointer sm:col-span-2">
                <span className="text-sm font-medium text-gray-600">Veg Item</span>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isVeg: !form.isVeg })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isVeg ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.isVeg ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${form.isVeg ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {form.isVeg ? "🟢 Veg" : "🔴 Non-Veg"}
                </span>
              </label>
          </div>
          {msg.text && <p className={`text-sm mt-3 ${msg.type === "success" ? "text-green-600" : "text-red-500"}`}>{msg.text}</p>}
          <div className="flex gap-3 mt-5">
            <button type="submit" disabled={saving} className="bg-[#FF5C00] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-orange-600 transition disabled:opacity-60">
              {saving ? "Saving..." : editId ? "Update" : "Add"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); setImageFile(null); setImagePreview(""); }} className="border px-6 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><p className="text-4xl mb-3">🍕</p><p>No products yet.</p></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Product</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Category</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Price</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Restaurant</th>
                <th className="text-right px-4 py-3 text-gray-600 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.imageUrl || "https://via.placeholder.com/40"} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-152">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-600">{p.category}</td>
                  <td className="px-4 py-3 font-semibold text-[#FF5C00]">₹{p.price}</td>
                  <td className="px-4 py-3 text-gray-600">{p.restaurant?.name || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleEdit(p)} className="text-xs border border-orange-400 text-orange-500 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition">Edit</button>
                      <button onClick={() => handleDelete(p._id)} className="text-xs border border-red-300 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default VendorProducts;
