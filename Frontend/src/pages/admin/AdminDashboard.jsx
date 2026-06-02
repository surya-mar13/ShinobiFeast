import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [revenue, orders, users, vendors] = await Promise.all([
          api.get("/admin-api/revenue"),
          api.get("/admin-api/orders"),
          api.get("/admin-api/users"),
          api.get("/admin-api/vendors"),
        ]);
        setStats({
          revenue: revenue.totalRevenue || 0,
          totalOrders: orders.orders?.length || 0,
          totalUsers: users.users?.length || 0,
          totalVendors: vendors.vendors?.length || 0,
        });
        setRecentOrders((orders.orders || []).slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return <div className="flex justify-center items-center h-64"><span className="animate-pulse text-gray-400 text-lg">Loading dashboard...</span></div>;

  const cards = [
    { label: "Platform Revenue", value: `₹${stats?.revenue || 0}`, icon: "💰", color: "bg-green-50 text-green-700", to: null },
    { label: "Total Orders", value: stats?.totalOrders || 0, icon: "📦", color: "bg-blue-50 text-blue-700", to: "/admin/orders" },
    { label: "Total Users", value: stats?.totalUsers || 0, icon: "👥", color: "bg-purple-50 text-purple-700", to: "/admin/users" },
    { label: "Total Vendors", value: stats?.totalVendors || 0, icon: "🏪", color: "bg-orange-50 text-orange-700", to: "/admin/users" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">⚙️ Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          c.to ? (
            <Link key={c.label} to={c.to} className={`${c.color} rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition`}>
              <span className="text-3xl">{c.icon}</span>
              <div><p className="text-sm font-medium opacity-80">{c.label}</p><p className="text-2xl font-bold">{c.value}</p></div>
            </Link>
          ) : (
            <div key={c.label} className={`${c.color} rounded-2xl p-5 flex items-center gap-4 shadow-sm`}>
              <span className="text-3xl">{c.icon}</span>
              <div><p className="text-sm font-medium opacity-80">{c.label}</p><p className="text-2xl font-bold">{c.value}</p></div>
            </div>
          )
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white border rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-[#FF5C00] font-medium hover:underline">View All →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-gray-400 text-sm">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left text-gray-500">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50">
                    <td className="py-3 font-mono text-xs text-gray-400">{o._id.slice(-8)}</td>
                    <td className="py-3 text-gray-700">{o.user?.name || "—"}</td>
                    <td className="py-3 font-semibold text-gray-800">₹{o.totalAmount}</td>
                    <td className="py-3 capitalize">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.status === "delivered" ? "bg-green-100 text-green-700" : o.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{o.status}</span>
                    </td>
                    <td className="py-3 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
