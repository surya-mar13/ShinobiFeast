import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";

const CATEGORIES = ["veg", "non-veg"];
const VARIETIES = ["north-indian", "south-indian", "chinese", "italian"];

function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [variety, setVariety] = useState("");

  const fetchRestaurants = useCallback(async (p = 1, reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 12 });
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (variety) params.set("variety", variety);
      const data = await api.get(`/common-api/restaurants?${params.toString()}`);
      if (reset || p === 1) {
        setRestaurants(data.restaurants);
      } else {
        setRestaurants((prev) => [...prev, ...data.restaurants]);
      }
      setHasMore(data.restaurants.length === 12);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, variety]);

  useEffect(() => {
    setPage(1);
    fetchRestaurants(1, true);
  }, [search, category, variety]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchRestaurants(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">All Restaurants</h1>
      <p className="text-gray-500 mb-4 text-sm">Browse and discover the best places near you</p>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="🔍 Search restaurants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-300 text-sm"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-3 border rounded-xl outline-none text-sm bg-white focus:ring-2 focus:ring-orange-300"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <select
          value={variety}
          onChange={(e) => setVariety(e.target.value)}
          className="p-3 border rounded-xl outline-none text-sm bg-white focus:ring-2 focus:ring-orange-300"
        >
          <option value="">All Cuisines</option>
          {VARIETIES.map((v) => (
            <option key={v} value={v} className="capitalize">{v.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</option>
          ))}
        </select>
        {(search || category || variety) && (
          <button
            onClick={() => { setSearch(""); setCategory(""); setVariety(""); }}
            className="px-4 py-3 border rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition whitespace-nowrap"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {loading && restaurants.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <p className="text-center text-gray-400 mt-20 text-lg">No restaurants found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {restaurants.map((r) => (
            <Link
              key={r._id}
              to={`/restaurant/${r._id}`}
              className="border rounded-xl overflow-hidden shadow hover:shadow-lg transition group bg-white"
            >
              <div className="h-44 bg-gray-100 overflow-hidden">
                <img
                  src={r.image || "https://via.placeholder.com/400x200?text=Restaurant"}
                  alt={r.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3">
                <h3 className="font-bold text-gray-800 truncate">{r.name}</h3>
                <p className="text-gray-500 text-sm truncate">📍 {r.location}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-yellow-500 text-sm font-semibold">⭐ {r.rating?.toFixed(1) || "New"}</span>
                  <span className="text-xs text-gray-400">{r.totalReviews} reviews</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {r.category?.map((c) => (
                    <span key={c} className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full capitalize">{c}</span>
                  ))}
                  {r.variety?.slice(0, 2).map((v) => (
                    <span key={v} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">{v}</span>
                  ))}
                </div>
                {r.offer && <p className="text-green-600 text-xs font-semibold mt-2">🎉 {r.offer}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}

      {hasMore && !loading && (
        <div className="text-center mt-10">
          <button
            onClick={loadMore}
            className="bg-[#FF5C00] text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition"
          >
            Load More
          </button>
        </div>
      )}
      {loading && restaurants.length > 0 && (
        <p className="text-center mt-6 text-gray-400 animate-pulse">Loading more...</p>
      )}
    </div>
  );
}

export default RestaurantsPage;
