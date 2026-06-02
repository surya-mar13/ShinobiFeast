import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/api";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";

// Category image map (Unsplash) — keyed on lowercase substring of category name
const CATEGORY_IMAGES = {
  burger:   "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80",
  pizza:    "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&auto=format&fit=crop&q=80",
  biryani:  "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80",
  chicken:  "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&auto=format&fit=crop&q=80",
  mutton:   "https://images.unsplash.com/photo-1529694157872-4e0c0f3b238b?w=300&auto=format&fit=crop&q=80",
  snack:    "https://images.unsplash.com/photo-1573080496219-bb964701c2b8?w=300&auto=format&fit=crop&q=80",
  salad:    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop&q=80",
  tiffin:   "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&auto=format&fit=crop&q=80",
  default:  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&auto=format&fit=crop&q=80",
};

// Fixed category list
const DEFAULT_CATEGORIES = [
  "Chicken", "Mutton", "Salads", "Pizza", "Burgers", "Tiffins", "Snacks", "Biryani",
];

function getCategoryImage(cat = "") {
  const lower = cat.toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_IMAGES)) {
    if (lower.includes(key)) return url;
  }
  return CATEGORY_IMAGES.default;
}

function FoodItems() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { addToCart } = useCart();

  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);

  // Product detail modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMsg, setCartMsg] = useState("");

  // Use fixed category list
  useEffect(() => {
    setCategories(DEFAULT_CATEGORIES);
    setCatLoading(false);
  }, []);

  // Fetch products when active category changes
  // Clicking "Chicken" also includes "Chicken Biryani" products
  const fetchProducts = useCallback(async (category) => {
    setProducts([]);   // clear stale results immediately
    setLoading(true);
    try {
      if (category === "All") {
        const res = await fetch(`${BASE_URL}/common-api/products?limit=50`);
        const data = await res.json();
        setProducts(data.products || []);
      } else if (category === "Chicken") {
        const [r1, r2] = await Promise.all([
          fetch(`${BASE_URL}/common-api/products?category=Chicken&limit=50`),
          fetch(`${BASE_URL}/common-api/products?category=Chicken%20Biryani&limit=50`),
        ]);
        const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
        const merged = [...(d1.products || []), ...(d2.products || [])];
        // deduplicate by _id
        const seen = new Set();
        setProducts(merged.filter((p) => seen.has(p._id) ? false : seen.add(p._id)));
      } else {
        const res = await fetch(`${BASE_URL}/common-api/products?category=${encodeURIComponent(category)}&limit=50`);
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error("Failed to fetch products", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeCategory !== null) {
      fetchProducts(activeCategory);
    }
  }, [activeCategory, fetchProducts]);

  const openModal = (product) => {
    setSelectedProduct(product);
    setQty(1);
    setCartMsg("");
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setCartMsg("");
  };

  const handleAddToCart = async () => {
    if (!user || user.role !== "user") {
      navigate("/login");
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(selectedProduct._id, qty);
      setCartMsg("Added to cart!");
    } catch {
      setCartMsg("Failed to add. Try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  // Star rating renderer
  const renderStars = (rating) => {
    const r = Math.round(rating * 2) / 2;
    return [1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={s <= r ? "text-yellow-400" : s - 0.5 === r ? "text-yellow-300" : "text-gray-300"}>★</span>
    ));
  };

  return (
    <div className="pt-8 pb-16">
      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative">
              {selectedProduct.imageUrl ? (
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-full h-56 object-cover"
                />
              ) : (
                <div className="w-full h-56 bg-orange-50 overflow-hidden">
                  <img
                    src={getCategoryImage(selectedProduct.category)}
                    alt={selectedProduct.category}
                    className="w-full h-full object-cover opacity-70"
                  />
                </div>
              )}
              {/* Close btn */}
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-600 hover:bg-white text-lg"
              >
                ✕
              </button>
              {/* Veg/non-veg */}
              <span className={`absolute top-3 left-3 w-5 h-5 rounded-sm border-2 flex items-center justify-center bg-white/90 ${selectedProduct.isVeg ? "border-green-600" : "border-red-500"}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${selectedProduct.isVeg ? "bg-green-600" : "bg-red-500"}`} />
              </span>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col gap-3 overflow-y-auto">
              {/* Name + category */}
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-bold text-gray-900 leading-tight">{selectedProduct.name}</h2>
                <span className="text-[11px] bg-orange-50 text-orange-500 font-bold px-2 py-0.5 rounded-full capitalize shrink-0">
                  {selectedProduct.category}
                </span>
              </div>

              {/* Rating (from restaurant) */}
              {selectedProduct.restaurant?.rating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex text-base leading-none">{renderStars(selectedProduct.restaurant.rating)}</div>
                  <span className="text-sm font-semibold text-gray-700">{selectedProduct.restaurant.rating.toFixed(1)}</span>
                  {selectedProduct.restaurant.totalReviews > 0 && (
                    <span className="text-xs text-gray-400">({selectedProduct.restaurant.totalReviews} reviews)</span>
                  )}
                </div>
              )}

              {/* Description */}
              {selectedProduct.description && (
                <p className="text-sm text-gray-600 leading-relaxed">{selectedProduct.description}</p>
              )}

              {/* Restaurant */}
              {selectedProduct.restaurant?.name && (
                <button
                  onClick={() => { closeModal(); navigate(`/restaurant/${selectedProduct.restaurant._id}`); }}
                  className="flex items-center gap-2 text-left group w-fit"
                >
                  <span className="text-sm">🏪</span>
                  <span className="text-sm font-semibold text-[#FF5C00] group-hover:underline transition-colors">
                    {selectedProduct.restaurant.name}
                  </span>
                  {selectedProduct.restaurant.location && (
                    <span className="text-xs text-gray-400">· 📍 {selectedProduct.restaurant.location.split(",")[0]}</span>
                  )}
                </button>
              )}

              {/* Divider */}
              <div className="h-px bg-gray-100" />

              {/* Price + qty + add to cart */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-xl font-extrabold text-[#FF5C00]">₹{selectedProduct.price}</span>

                {/* Qty stepper */}
                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-[#FF5C00] font-bold text-lg"
                  >−</button>
                  <span className="w-5 text-center font-bold text-gray-800">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-[#FF5C00] font-bold text-lg"
                  >+</button>
                </div>
              </div>

              {/* Cart message */}
              {cartMsg && (
                <p className={`text-sm font-medium text-center ${cartMsg.includes("Failed") ? "text-red-500" : "text-green-600"}`}>
                  {cartMsg}
                </p>
              )}

              {/* Add to cart button */}
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="w-full py-3 rounded-xl bg-[#FF5C00] text-white font-bold text-base hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-60"
              >
                {addingToCart ? "Adding…" : user?.role === "user" ? `Add to Cart · ₹${selectedProduct.price * qty}` : "Login to Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">What's on your mind?</h2>
        <button
          onClick={() => setActiveCategory("All")}
          className="text-sm font-semibold text-[#FF5C00] hover:underline flex items-center gap-1"
        >
          See all &rsaquo;
        </button>
      </div>

      {/* Category scroll row */}
      {catLoading ? (
        <div className="flex gap-6 overflow-x-auto pb-4 mb-6" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-3 w-14 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="flex gap-6 overflow-x-auto pb-4 mb-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex flex-col items-center gap-2 group focus:outline-none shrink-0"
            >
              <div
                className={`w-20 h-20 rounded-full overflow-hidden border-4 transition-all duration-200 shadow-sm group-hover:scale-105 group-hover:shadow-md ${
                  activeCategory === cat
                    ? "border-[#FF5C00] scale-105 shadow-md"
                    : "border-transparent"
                }`}
              >
                <img
                  src={getCategoryImage(cat)}
                  alt={cat}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = CATEGORY_IMAGES.default; }}
                />
              </div>
              <span
                className={`text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeCategory === cat ? "text-[#FF5C00]" : "text-gray-700 group-hover:text-[#FF5C00]"
                }`}
              >
                {cat}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Divider shown when products are displayed */}
      {activeCategory && (
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-lg font-bold text-gray-800 whitespace-nowrap">
            {activeCategory === "All" ? "All Products" : activeCategory}
          </h3>
          <div className="flex-1 h-px bg-gray-200" />
          <button
            onClick={() => setActiveCategory(null)}
            className="text-sm text-gray-400 hover:text-gray-600 whitespace-nowrap"
          >
            ✕ Close
          </button>
        </div>
      )}

      {/* Products grid */}
      {activeCategory === null ? null : loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-gray-100 animate-pulse">
              <div className="w-full h-36 bg-gray-200" />
              <div className="p-3 flex flex-col gap-2">
                <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-gray-400 gap-3">
          <span className="text-5xl">🍽️</span>
          <p className="text-base font-medium">No items found in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <div
              key={product._id}
              onClick={() => openModal(product)}
              className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group flex flex-col cursor-pointer"
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-40 bg-orange-50 flex items-center justify-center overflow-hidden">
                    <img
                      src={getCategoryImage(product.category)}
                      alt={product.category}
                      className="w-full h-full object-cover opacity-60"
                    />
                  </div>
                )}
                {/* Veg / Non-veg dot */}
                <span className={`absolute top-2 right-2 w-4 h-4 rounded-sm border-2 flex items-center justify-center ${product.isVeg ? "border-green-600" : "border-red-500"}`}>
                  <span className={`w-2 h-2 rounded-full ${product.isVeg ? "bg-green-600" : "bg-red-500"}`} />
                </span>
                {/* Category pill */}
                <span className="absolute top-2 left-2 text-[10px] bg-white/90 backdrop-blur-sm text-orange-500 font-bold px-2 py-0.5 rounded-full capitalize shadow-sm">
                  {product.category}
                </span>
              </div>

              {/* Details */}
              <div className="p-3 flex flex-col flex-1">
                <h3 className="font-bold text-sm text-gray-800 truncate">{product.name}</h3>

                {/* Clickable restaurant name */}
                {product.restaurant?.name && (
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/restaurant/${product.restaurant._id}`); }}
                    className="mt-1 text-left flex items-center gap-1 group/rest w-full"
                    title={`View all items from ${product.restaurant.name}`}
                  >
                    <span className="text-[11px]">🏪</span>
                    <span className="text-[11px] font-semibold text-[#FF5C00] group-hover/rest:underline group-hover/rest:text-orange-600 truncate transition-colors">
                      {product.restaurant.name}
                    </span>
                    <span className="text-[10px] text-gray-400 group-hover/rest:text-orange-400 transition-colors ml-auto shrink-0">›</span>
                  </button>
                )}

                {/* Description */}
                {product.description && (
                  <p className="text-[11px] text-gray-500 mt-1.5 line-clamp-2 leading-relaxed flex-1">{product.description}</p>
                )}

                {/* Price + location */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                  <span className="text-sm font-extrabold text-[#FF5C00]">₹{product.price}</span>
                  {product.restaurant?.location && (
                    <span className="text-[10px] font-medium text-gray-400 truncate max-w-[50%] text-right">
                      📍 {product.restaurant.location.split(",")[0]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FoodItems;
