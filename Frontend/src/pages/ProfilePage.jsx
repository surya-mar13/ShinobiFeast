import { useRef, useState } from "react";
import { useUser } from "../context/UserContext";
import { Link } from "react-router-dom";
import { api, BASE_URL } from "../utils/api";
import LocationInput from "../components/LocationInput";
const ROLE_CONFIG = {
  user: {
    color: "bg-blue-100 text-blue-700",
    links: [
      { to: "/orders", label: "📦 My Orders" },
      { to: "/cart", label: "🛒 My Cart" },
      { to: "/restaurants", label: "🍽️ Browse Restaurants" },
    ],
  },
  vendor: {
    color: "bg-green-100 text-green-700",
    links: [
      { to: "/vendor", label: "📊 Vendor Dashboard" },
      { to: "/vendor/restaurants", label: "🏪 My Restaurants" },
      { to: "/vendor/products", label: "🍕 My Products" },
      { to: "/vendor/orders", label: "📋 Vendor Orders" },
    ],
  },
  admin: {
    color: "bg-red-100 text-red-700",
    links: [
      { to: "/admin", label: "📊 Admin Dashboard" },
      { to: "/admin/users", label: "👥 Manage Users" },
      { to: "/admin/orders", label: "📋 All Orders" },
    ],
  },
  deliveryPartner: {
    color: "bg-purple-100 text-purple-700",
    links: [{ to: "/delivery", label: "🚴 Delivery Hub" }],
  },
};

function ProfilePage() {
  const { user, setUser } = useUser();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState({ text: "", ok: false });

  const [profileForm, setProfileForm] = useState({ address: user?.address || "", location: user?.location || "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: "", ok: false });
  const [geoLoading, setGeoLoading] = useState(false);
  const [addressType, setAddressType] = useState("home");
  const [otherLabel, setOtherLabel] = useState("");

  if (!user) return null;

  const config = ROLE_CONFIG[user.role] || ROLE_CONFIG.user;
  const initials = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadErr("");
    try {
      const data = await api.upload("/upload-api/avatar", file);
      setUser({ ...user, avatar: data.url });
    } catch (err) {
      setUploadErr(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ text: "", ok: false });
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwMsg({ text: "New passwords do not match.", ok: false });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwMsg({ text: "New password must be at least 6 characters.", ok: false });
      return;
    }
    setPwLoading(true);
    try {
      const data = await api.put("/common-api/change-password", {
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg({ text: data.message || "Password changed successfully!", ok: true });
      setPwForm({ oldPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      setPwMsg({ text: err.message, ok: false });
    } finally {
      setPwLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: "", ok: false });
    setProfileLoading(true);
    try {
      const data = await api.put("/common-api/update-profile", {
        address: profileForm.address,
        location: profileForm.location,
      });
      setUser({ ...user, address: data.user.address, location: data.user.location });
      setProfileMsg({ text: "Profile updated successfully!", ok: true });
    } catch (err) {
      setProfileMsg({ text: err.message, ok: false });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setProfileMsg({ text: "Geolocation is not supported by your browser.", ok: false });
      return;
    }
    setGeoLoading(true);
    setProfileMsg({ text: "", ok: false });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const fullAddress = data.display_name || "";
          const city =
            addr.city || addr.town || addr.village || addr.suburb || addr.county || "";
          const state = addr.state || "";
          const locationStr = [city, state].filter(Boolean).join(", ");
          setProfileForm((prev) => ({
            ...prev,
            address: fullAddress,
            location: locationStr,
          }));
          setProfileMsg({ text: "Location detected! Review and save.", ok: true });
        } catch {
          setProfileMsg({ text: "Could not fetch address. Please enter manually.", ok: false });
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === 1) {
          setProfileMsg({ text: "Location permission denied. Please allow access and try again.", ok: false });
        } else {
          setProfileMsg({ text: "Unable to detect location. Please enter manually.", ok: false });
        }
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-xl mx-auto">

        {/* Avatar & Name */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#FF5C00] text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                {initials}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <span className="text-white text-xs font-semibold">{uploading ? "..." : "📷"}</span>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          {uploadErr && <p className="text-red-500 text-xs mt-1">{uploadErr}</p>}
          <p className="text-xs text-gray-400 mt-1">Click photo to change</p>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">{user.name}</h1>
          <span className={`mt-1 px-3 py-1 rounded-full text-sm font-semibold capitalize ${config.color}`}>{user.role}</span>
        </div>

        {/* Details Card */}
        <div className="bg-white border rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Account Details</h2>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Full Name</span>
              <span className="font-medium text-gray-800">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-800">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phone</span>
              <span className="font-medium text-gray-800">{user.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Role</span>
              <span className={`font-semibold capitalize px-2 py-0.5 rounded-full text-xs ${config.color}`}>{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Member Since</span>
              <span className="font-medium text-gray-800">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
            {user.address && (
              <div className="flex justify-between">
                <span className="text-gray-500">Address</span>
                <span className="font-medium text-gray-800 text-right max-w-[60%]">{user.address}</span>
              </div>
            )}
            {user.location && (
              <div className="flex justify-between">
                <span className="text-gray-500">Location</span>
                <span className="font-medium text-gray-800">{user.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white border rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Links</h2>
          <div className="flex flex-col gap-2">
            {config.links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-orange-50 hover:text-[#FF5C00] transition text-sm font-medium text-gray-700"
              >
                {l.label}
                <span className="text-gray-400">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white border rounded-2xl shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">📍 Address & Location</h2>
          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-3">
            {/* Address type selector */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Save As</label>
              <div className="flex gap-2">
                {[{ id: "home", icon: "🏠", label: "Home" }, { id: "work", icon: "💼", label: "Work" }, { id: "other", icon: "📌", label: "Other" }].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setAddressType(t.id)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-xs font-semibold transition ${
                      addressType === t.id
                        ? "border-[#FF5C00] bg-orange-50 text-[#FF5C00]"
                        : "border-gray-200 text-gray-500 hover:border-orange-200"
                    }`}
                  >
                    <span className="text-lg">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
              {addressType === "other" && (
                <input
                  type="text"
                  value={otherLabel}
                  onChange={(e) => setOtherLabel(e.target.value)}
                  placeholder="Enter a name (e.g. Parents, Gym…)"
                  className="mt-2 w-full p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
                />
              )}
            </div>
            {/* Detect location button */}
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={geoLoading}
              className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-orange-300 text-[#FF5C00] py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-50 transition disabled:opacity-60"
            >
              {geoLoading ? (
                <>
                  <span className="animate-spin text-base">⏳</span> Detecting location...
                </>
              ) : (
                <>
                  <span className="text-base">📡</span> Detect my location automatically
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 -mt-1 text-center">or fill in manually below</p>            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Delivery Address</label>
              <textarea
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                placeholder="Enter your full address..."
                rows={3}
                className="w-full p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">City / Area</label>
              <LocationInput
                value={profileForm.location}
                onChange={(val) => setProfileForm({ ...profileForm, location: val })}
                placeholder="e.g. Mumbai, Andheri West"
                inputClassName="w-full p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            {profileMsg.text && (
              <p className={`text-sm font-medium ${profileMsg.ok ? "text-green-600" : "text-red-500"}`}>{profileMsg.text}</p>
            )}
            <button
              type="submit"
              disabled={profileLoading}
              className="w-full bg-[#FF5C00] text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-60 text-sm"
            >
              {profileLoading ? "Saving..." : "Save Address"}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white border rounded-2xl shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">�🔒 Change Password</h2>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="Current password"
              value={pwForm.oldPassword}
              onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })}
              className="w-full p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
            />
            <input
              type="password"
              placeholder="New password (min 6 chars)"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              className="w-full p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              className="w-full p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
            />
            {pwMsg.text && (
              <p className={`text-sm font-medium ${pwMsg.ok ? "text-green-600" : "text-red-500"}`}>{pwMsg.text}</p>
            )}
            <button
              type="submit"
              disabled={pwLoading}
              className="w-full bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-900 transition disabled:opacity-60 text-sm"
            >
              {pwLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Logout */}
        <div className="mt-6 text-center">
          <Link
            to="/logout"
            className="inline-block bg-red-50 text-red-500 border border-red-200 px-8 py-2.5 rounded-full font-semibold hover:bg-red-100 transition"
          >
            Logout
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
