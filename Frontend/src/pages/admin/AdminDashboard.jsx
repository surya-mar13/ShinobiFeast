import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { Link } from "react-router-dom";
import { Wallet, Package, Users, Store } from "lucide-react";

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
    { label: "Platform Revenue", value: `₹${stats?.revenue || 0}`, icon: <Wallet size={26} />, color: "bg-emerald-50 text-emerald-700", to: null },
    { label: "Total Orders", value: stats?.totalOrders || 0, icon: <Package size={26} />, color: "bg-sky-50 text-sky-700", to: "/admin/orders" },
    { label: "Total Users", value: stats?.totalUsers || 0, icon: <Users size={26} />, color: "bg-amber-50 text-amber-700", to: "/admin/users" },
    { label: "Total Vendors", value: stats?.totalVendors || 0, icon: <Store size={26} />, color: "bg-orange-50 text-orange-700", to: "/admin/users" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="brand-heading text-2xl sm:text-3xl font-bold text-slate-800 mb-6">QuickBite Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          c.to ? (
            <Link key={c.label} to={c.to} className={`${c.color} rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition border border-white/70`}>
              <span>{c.icon}</span>
              <div><p className="text-sm font-medium opacity-80">{c.label}</p><p className="text-2xl font-bold">{c.value}</p></div>
            </Link>
          ) : (
            <div key={c.label} className={`${c.color} rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-white/70`}>
              <span>{c.icon}</span>
              <div><p className="text-sm font-medium opacity-80">{c.label}</p><p className="text-2xl font-bold">{c.value}</p></div>
            </div>
          )
        ))}
      </div>

      <div className="bg-white border border-orange-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="brand-heading text-lg font-bold text-slate-800">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-orange-600 font-medium hover:underline">View All →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-slate-400 text-sm">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-orange-200">
                <tr className="text-left text-slate-500">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-orange-50/35">
                    <td className="py-3 font-mono text-xs text-slate-400">{o._id.slice(-8)}</td>
                    <td className="py-3 text-slate-700">{o.user?.name || "—"}</td>
                    <td className="py-3 font-semibold text-slate-800">₹{o.totalAmount}</td>
                    <td className="py-3 capitalize">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.status === "delivered" ? "bg-green-100 text-green-700" : o.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{o.status}</span>
                    </td>
                    <td className="py-3 text-slate-400 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
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
