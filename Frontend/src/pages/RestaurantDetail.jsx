import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { useUser } from "../context/UserContext";
import { useCart } from "../context/CartContext";

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange && onChange(s)}
          className={`text-2xl transition ${s <= value ? "text-yellow-400" : "text-gray-300"} ${onChange ? "hover:text-yellow-400 cursor-pointer" : "cursor-default"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function RestaurantDetail() {
  const { id } = useParams();
  const { user } = useUser();
  const { addToCart } = useCart() || {};
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [adding, setAdding] = useState(null);

  // Review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [rData, pData, revData] = await Promise.all([
          api.get(`/common-api/restaurants/${id}`),
          api.get(`/common-api/restaurants/${id}/products`),
          api.get(`/review-api/restaurants/${id}/reviews`),
        ]);
        setRestaurant(rData.restaurant || null);
        setProducts(pData.products || []);
        setReviews(revData.reviews || []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [id]);

  const handleAddToCart = async (productId) => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "user") return;
    setAdding(productId);
    try {
      await addToCart(productId, 1);
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(null);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewMsg("");
    try {
      await api.post(`/review-api/restaurants/${id}/reviews`, { rating, comment });
      setReviewMsg("Review submitted!");
      const revData = await api.get(`/review-api/restaurants/${id}/reviews`);
      setReviews(revData.reviews || []);
      setComment("");
      setRating(5);
    } catch (err) {
      setReviewMsg(err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await api.delete(`/review-api/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (!restaurant)
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-gray-400 animate-pulse text-lg">Loading restaurant...</span>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Restaurant Header */}
      <div className="bg-white rounded-2xl shadow overflow-hidden mb-8">
        {restaurant.image && (
          <img src={restaurant.image} alt={restaurant.name} className="w-full h-48 sm:h-64 object-cover" />
        )}
        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{restaurant.name}</h1>
              <p className="text-gray-500 mt-1">📍 {restaurant.location}</p>
            </div>
            <div className="flex flex-col gap-1 items-start sm:items-end">
              <span className="text-yellow-500 font-bold text-lg">⭐ {restaurant.rating?.toFixed(1) || "New"}</span>
              <span className="text-gray-400 text-sm">{restaurant.totalReviews} reviews</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {restaurant.category?.map((c) => (
              <span key={c} className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm capitalize font-medium">{c}</span>
            ))}
            {restaurant.variety?.map((v) => (
              <span key={v} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm capitalize">{v}</span>
            ))}
          </div>
          {restaurant.coupons?.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">🎟️ Available Coupons</p>
              <div className="flex flex-wrap gap-2">
                {restaurant.coupons.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 bg-green-50 border border-dashed border-green-400 rounded-xl px-4 py-2.5">
                    <span className="font-extrabold text-green-700 tracking-widest text-sm font-mono">{c.code}</span>
                    <span className="text-xs text-gray-500">—</span>
                    <span className="text-sm font-semibold text-green-800">
                      {c.discountType === "percent" ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
                    </span>
                    {c.minOrder > 0 && <span className="text-xs text-gray-400">on orders above ₹{c.minOrder}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Menu</h2>
      {products.length === 0 ? (
        <p className="text-gray-400 mb-10">No menu items yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-12">
          {products.map((p) => (
            <div key={p._id} className="bg-white border rounded-xl overflow-hidden shadow hover:shadow-md transition">
              <img
                src={p.imageUrl || "https://via.placeholder.com/300x160?text=Food"}
                alt={p.name}
                className="w-full h-36 object-cover"
              />
              <div className="p-3">
                <h3 className="font-bold text-gray-800">{p.name}</h3>
                <p className="text-gray-500 text-xs mt-1 line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[#FF5C00] font-bold">₹{p.price}</span>
                  <span className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-0.5 rounded-full">{p.category}</span>
                </div>
                {user?.role === "user" && (
                  <button
                    onClick={() => handleAddToCart(p._id)}
                    disabled={adding === p._id}
                    className="w-full mt-3 bg-[#FF5C00] text-white py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-60"
                  >
                    {adding === p._id ? "Adding..." : "Add to Cart"}
                  </button>
                )}
                {!user && (
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full mt-3 border-2 border-[#FF5C00] text-[#FF5C00] py-2 rounded-lg text-sm font-semibold hover:bg-orange-50 transition"
                  >
                    Login to Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviews */}
      <div className="border-t pt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Customer Reviews ({reviews.length})</h2>

        {/* Add Review */}
        {user?.role === "user" && (
          <form onSubmit={handleReviewSubmit} className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Write a Review</h3>
            <StarRating value={rating} onChange={setRating} />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
              className="w-full mt-3 p-3 border rounded-lg outline-none resize-none text-sm focus:ring-2 focus:ring-orange-300"
              required
            />
            {reviewMsg && <p className={`text-sm mt-1 ${reviewMsg.includes("!") ? "text-green-600" : "text-red-500"}`}>{reviewMsg}</p>}
            <button
              type="submit"
              disabled={reviewLoading}
              className="mt-3 bg-[#FF5C00] text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-orange-600 transition disabled:opacity-60"
            >
              {reviewLoading ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-400">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((r) => (
              <div key={r._id} className="bg-white border rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-semibold text-gray-700">{r.user?.name || "User"}</span>
                    <StarRating value={r.rating} />
                  </div>
                  {user?._id === r.user?._id && (
                    <button
                      onClick={() => handleDeleteReview(r._id)}
                      className="text-red-400 hover:text-red-600 text-sm font-medium"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-gray-600 mt-2 text-sm">{r.comment}</p>
                <p className="text-gray-400 text-xs mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default RestaurantDetail;
