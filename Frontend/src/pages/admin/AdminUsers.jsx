import { useState, useEffect } from "react";
import { api } from "../../utils/api";

const ROLE_BADGE = {
  user: "bg-blue-100 text-blue-700",
  vendor: "bg-green-100 text-green-700",
  admin: "bg-red-100 text-red-700",
  deliveryPartner: "bg-purple-100 text-purple-700",
};

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [changingRole, setChangingRole] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const fetchUsers = async () => {
    try {
      const data = await api.get("/admin-api/users");
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleBlock = async (userId) => {
    setToggling(userId);
    try {
      await api.put(`/admin-api/users/${userId}/block`, {});
      await fetchUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setToggling(null);
    }
  };

  const handleChangeRole = async (userId, role) => {
    setChangingRole(userId);
    try {
      await api.put(`/admin-api/users/${userId}/role`, { role });
      await fetchUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setChangingRole(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">👥 Manage Users</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-300 text-sm"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-300 text-sm bg-white"
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="vendor">Vendor</option>
          <option value="admin">Admin</option>
          <option value="deliveryPartner">Delivery Partner</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><p className="text-4xl mb-3">👥</p><p>No users found.</p></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Name</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Email</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Phone</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Role</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                <th className="text-right px-4 py-3 text-gray-600 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600">{u.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${ROLE_BADGE[u.role] || "bg-gray-100 text-gray-600"}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.isBlocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                      {u.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u._id, e.target.value)}
                        disabled={changingRole === u._id}
                        className="text-xs px-2 py-1.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-60"
                      >
                        <option value="user">User</option>
                        <option value="vendor">Vendor</option>
                        <option value="admin">Admin</option>
                        <option value="deliveryPartner">Delivery Partner</option>
                      </select>
                      <button
                        onClick={() => handleToggleBlock(u._id)}
                        disabled={toggling === u._id}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-60 ${u.isBlocked ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}`}
                      >
                        {toggling === u._id ? "..." : u.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-gray-400 mt-3">Showing {filtered.length} of {users.length} users</p>
    </div>
  );
}

export default AdminUsers;
