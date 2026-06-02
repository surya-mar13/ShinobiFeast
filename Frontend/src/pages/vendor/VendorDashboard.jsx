import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { Link } from "react-router-dom";

function StatCard({ label, value, icon, color }) {
  return (
    <div className={`${color} rounded-2xl p-5 flex items-center gap-4 shadow-sm`}>
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-sm font-medium opacity-80">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function VendorDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [r, p, o, rev] = await Promise.all([
          api.get("/vendor-api/myrestaurants"),
          api.get("/vendor-api/myproducts"),
          api.get("/order-api/vendor"),
          api.get("/vendor-api/revenue"),
        ]);
        setRestaurants(r.restaurants || []);
        setProducts(p.products || []);
        setOrders(o.orders || []);
        setRevenue(rev);
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

  const pendingOrders = orders.filter((o) => ["pending", "accepted", "preparing"].includes(o.status)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">🏪 Vendor Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="My Restaurants" value={restaurants.length} icon="🏪" color="bg-orange-50 text-orange-700" />
        <StatCard label="My Products" value={products.length} icon="🍕" color="bg-blue-50 text-blue-700" />
        <StatCard label="Total Orders" value={orders.length} icon="📦" color="bg-green-50 text-green-700" />
        <StatCard label="Pending Orders" value={pendingOrders} icon="⏳" color="bg-yellow-50 text-yellow-700" />
      </div>

      {/* Revenue */}
      {revenue && (
          <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-2xl p-6 mb-8 shadow">
          <h2 className="text-lg font-semibold mb-2">Revenue Overview</h2>
          <div className="flex flex-col sm:flex-row gap-6">
            <div>
              <p className="text-sm opacity-80">Total Earnings</p>
              <p className="text-3xl font-bold">₹{revenue.totalEarnings || 0}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Total Orders</p>
              <p className="text-3xl font-bold">{revenue.totalOrders || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { to: "/vendor/restaurants", label: "Manage Restaurants", icon: "🏪", desc: "Add, edit or delete your restaurants" },
          { to: "/vendor/products", label: "Manage Products", icon: "🍕", desc: "Add or update menu items" },
          { to: "/vendor/orders", label: "View Orders", icon: "📋", desc: "See and manage incoming orders" },
          { to: "/profile", label: "My Profile", icon: "👤", desc: "View your account details" },
        ].map((l) => (
          <Link key={l.to} to={l.to} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition hover:border-orange-300 group">
            <span className="text-3xl mb-2 block">{l.icon}</span>
            <h3 className="font-bold text-gray-800 group-hover:text-[#FF5C00] transition">{l.label}</h3>
            <p className="text-gray-400 text-xs mt-1">{l.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default VendorDashboard;
