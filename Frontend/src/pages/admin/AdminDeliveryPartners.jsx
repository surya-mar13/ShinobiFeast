import { useState, useEffect } from "react";
import { api } from "../../utils/api";

function AdminDeliveryPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPartners = async () => {
    try {
      const data = await api.get("/admin-api/deliverypartners");
      setPartners(data.partners || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPartners(); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">🚴 Delivery Partners</h1>
        <button onClick={fetchPartners} className="text-sm text-[#FF5C00] hover:underline font-medium">↻ Refresh</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : partners.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🚴</p>
          <p>No delivery partners registered yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Partner</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Contact</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Vehicle</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Location</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {partners.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{p.user?.name || "—"}</p>
                    <p className="text-xs text-gray-400 font-mono">{p._id}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <p>{p.user?.email || "—"}</p>
                    {p.user?.phone && <p className="text-xs text-gray-400">{p.user.phone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="capitalize font-medium text-gray-700">{p.vehicleType || "—"}</p>
                    {p.vehicleNumber && <p className="text-xs text-gray-400 font-mono">{p.vehicleNumber}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.currentLocation || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.isAvailable ? "🟢 Available" : "⚫ Unavailable"}
                    </span>
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

export default AdminDeliveryPartners;
