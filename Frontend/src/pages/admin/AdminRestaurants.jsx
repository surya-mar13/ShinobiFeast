import { useState, useEffect } from "react";
import { api } from "../../utils/api";

function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  const fetchRestaurants = async () => {
    try {
      const data = await api.get("/admin-api/restaurants");
      setRestaurants(data.restaurants || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRestaurants(); }, []);

  const handleToggle = async (id) => {
    setToggling(id);
    try {
      const data = await api.put(`/admin-api/restaurants/${id}/toggle`, {});
      setRestaurants((prev) =>
        prev.map((r) => r._id === id ? { ...r, isOpen: data.restaurant.isOpen } : r)
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">🏪 All Restaurants</h1>
        <button onClick={fetchRestaurants} className="text-sm text-[#FF5C00] hover:underline font-medium">↻ Refresh</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🏪</p>
          <p>No restaurants found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Restaurant</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Location</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Owner</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Rating</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                <th className="text-right px-4 py-3 text-gray-600 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {restaurants.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={r.image || "https://via.placeholder.com/40?text=🏪"}
                        alt={r.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div>
                        <p className="font-medium text-gray-800">{r.name}</p>
                        {r.offer && <p className="text-xs text-orange-500">🎉 {r.offer}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">📍 {r.location}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.owner?.name || "—"}
                    {r.owner?.email && <p className="text-xs text-gray-400">{r.owner.email}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-yellow-600">⭐ {r.rating?.toFixed(1) || "—"}</span>
                    {r.totalReviews > 0 && <p className="text-xs text-gray-400">{r.totalReviews} reviews</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {r.isOpen ? "🟢 Open" : "🔴 Closed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleToggle(r._id)}
                      disabled={toggling === r._id}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition disabled:opacity-60 ${r.isOpen ? "border-red-300 text-red-500 hover:bg-red-50" : "border-green-400 text-green-600 hover:bg-green-50"}`}
                    >
                      {toggling === r._id ? "..." : r.isOpen ? "Close" : "Open"}
                    </button>
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

export default AdminRestaurants;
