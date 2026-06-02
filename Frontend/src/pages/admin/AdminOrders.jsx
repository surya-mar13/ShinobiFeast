import { useState, useEffect } from "react";
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

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/admin-api/orders")
      .then((data) => setOrders(data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    const matchStatus = filter === "all" || o.status === filter;
    const matchSearch = !search || o._id.includes(search) || o.user?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">📋 All Orders</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Search by order ID or customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-300 text-sm"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-3 border rounded-xl outline-none text-sm bg-white focus:ring-2 focus:ring-orange-300"
        >
          <option value="all">All Statuses</option>
          {Object.keys(STATUS_COLORS).map((s) => (
            <option key={s} value={s}>{getStatusLabel(s)}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-gray-400 mb-4">Showing {filtered.length} of {orders.length} orders</p>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><p className="text-4xl mb-3">📋</p><p>No orders found.</p></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Order ID</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Customer</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Items</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Amount</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Payment</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Commission</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {filtered.map((o) => (
                <tr key={o._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{o._id.slice(-10)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{o.user?.name || "—"}</p>
                    <p className="text-xs text-gray-400">{o.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{o.items?.length} item(s)</td>
                  <td className="px-4 py-3 font-bold text-gray-800">₹{o.totalAmount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${o.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{o.paymentStatus}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[o.status] || "bg-gray-100 text-gray-600"}`}>{getStatusLabel(o.status)}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">₹{o.platformCommission || 0}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
