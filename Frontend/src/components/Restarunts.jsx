import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/api";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop&q=80";

function StarRating({ rating }) {
  const r = Math.round((rating || 0) * 2) / 2;
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`text-sm ${s <= r ? "text-yellow-400" : s - 0.5 === r ? "text-yellow-300" : "text-gray-300"}`}
        >★</span>
      ))}
      <span className="ml-1 text-xs font-semibold text-gray-600">{rating ? rating.toFixed(1) : "New"}</span>
    </span>
  );
}

function Restarunts() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await fetch(`${BASE_URL}/common-api/restaurants?limit=20&sort=rating`);
        const data = await res.json();
        setRestaurants(data.restaurants || []);
      } catch (err) {
        console.error("Failed to fetch restaurants", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  return (
    <div className="pb-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Discover best restaurants on Dineout
        </h2>
        <button
          onClick={() => navigate("/restaurants")}
          className="text-sm font-semibold text-[#FF5C00] hover:underline flex items-center gap-1"
        >
          See all &rsaquo;
        </button>
      </div>

      {loading ? (
        <div className="flex gap-5 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="min-w-[220px] rounded-2xl overflow-hidden bg-gray-100 animate-pulse shrink-0">
              <div className="w-full h-40 bg-gray-200" />
              <div className="p-3 flex flex-col gap-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-gray-400 gap-3">
          <span className="text-5xl">🏪</span>
          <p className="text-base font-medium">No restaurants found</p>
        </div>
      ) : (
        <div
          className="flex gap-5 overflow-x-auto pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {restaurants.map((res) => (
            <div
              key={res._id}
              onClick={() => navigate(`/restaurant/${res._id}`)}
              className="min-w-[220px] max-w-[220px] shrink-0 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={res.image || FALLBACK_IMG}
                  alt={res.name}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.target.src = FALLBACK_IMG; }}
                />
                {/* Offer badge */}
                {res.offer && (
                  <span className="absolute bottom-2 left-2 text-[11px] bg-[#FF5C00] text-white font-bold px-2 py-0.5 rounded-full shadow">
                    {res.offer}
                  </span>
                )}
                {/* Veg/non-veg tags */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {res.category?.includes("veg") && (
                    <span className="text-[9px] bg-green-600 text-white font-bold px-1.5 py-0.5 rounded">VEG</span>
                  )}
                  {res.category?.includes("non-veg") && (
                    <span className="text-[9px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded">NON-VEG</span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-bold text-sm text-gray-900 truncate">{res.name}</h3>
                <StarRating rating={res.rating} />
                {res.totalReviews > 0 && (
                  <p className="text-[10px] text-gray-400 mt-0.5">{res.totalReviews} reviews</p>
                )}
                <p className="text-xs text-gray-500 mt-1 truncate">📍 {res.location}</p>
                {res.variety?.length > 0 && (
                  <p className="text-[11px] text-gray-400 mt-1 truncate capitalize">
                    {res.variety.slice(0, 3).join(" · ")}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Restarunts;
