import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { useUser } from "../context/UserContext";
import { useCart } from "../context/CartContext";

const linkClass = "hover:text-yellow-300 transition-colors text-sm font-medium";
const activeClass = "text-yellow-300 font-bold underline underline-offset-4";

function NavLinks({ role, onClose = () => {} }) {
  const cls = ({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`;
  return (
    <>
      <NavLink to="/" end className={cls} onClick={onClose}>Home</NavLink>
      <NavLink to="/restaurants" className={cls} onClick={onClose}>Restaurants</NavLink>
      {role === "user" && (
        <>
          <NavLink to="/cart" className={cls} onClick={onClose}>Cart</NavLink>
          <NavLink to="/orders" className={cls} onClick={onClose}>My Orders</NavLink>
        </>
      )}
      {role === "vendor" && (
        <>
          <NavLink to="/vendor" className={cls} onClick={onClose}>Dashboard</NavLink>
          <NavLink to="/vendor/restaurants" className={cls} onClick={onClose}>My Restaurants</NavLink>
          <NavLink to="/vendor/products" className={cls} onClick={onClose}>My Products</NavLink>
          <NavLink to="/vendor/orders" className={cls} onClick={onClose}>Vendor Orders</NavLink>
        </>
      )}
      {role === "admin" && (
        <>
          <NavLink to="/admin" className={cls} onClick={onClose}>Dashboard</NavLink>
          <NavLink to="/admin/users" className={cls} onClick={onClose}>Users</NavLink>
          <NavLink to="/admin/orders" className={cls} onClick={onClose}>All Orders</NavLink>
            <NavLink to="/admin/restaurants" className={cls} onClick={onClose}>Restaurants</NavLink>
            <NavLink to="/admin/delivery" className={cls} onClick={onClose}>Delivery Partners</NavLink>
        </>
      )}
      {role === "deliveryPartner" && (
        <NavLink to="/delivery" className={cls} onClick={onClose}>Delivery Hub</NavLink>
      )}
    </>
  );
}

function Header() {
  const { user } = useUser();
  const { itemCount } = useCart() || {};
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-[#FF5C00] text-white sticky top-0 z-50 shadow-md">
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-3">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="Logo" className="h-10" />
          <span className="text-xl font-bold">ShinobiFest</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-5">
          <NavLinks role={user?.role} />
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {user.role === "user" && (
                <Link to="/cart" className="relative text-xl">
                  🛒
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-white text-[#FF5C00] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">{itemCount}</span>
                  )}
                </Link>
              )}
              <Link to="/profile" className={linkClass}>
                <span className="bg-white text-[#FF5C00] px-3 py-1 rounded-full text-sm font-semibold">{user.name.split(" ")[0]}</span>
              </Link>
              <span className="text-xs bg-orange-700 px-2 py-0.5 rounded-full capitalize">{user.role}</span>
              <Link to="/logout" className="bg-white text-[#FF5C00] px-3 py-1 rounded-full text-sm font-bold hover:bg-yellow-100 transition">Logout</Link>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass}>Log In</Link>
              <Link to="/signup" className="bg-white text-[#FF5C00] px-4 py-1.5 rounded-full text-sm font-bold hover:bg-yellow-100 transition">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-2xl" onClick={() => setOpen(!open)}>
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#d94e00] px-6 py-5 flex flex-col gap-4">
          <NavLinks role={user?.role} onClose={() => setOpen(false)} />
          <hr className="border-orange-400" />
          {user ? (
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold">Hi, {user.name} <span className="text-xs bg-white text-[#FF5C00] px-2 py-0.5 rounded-full ml-1 capitalize">{user.role}</span></span>
              <Link to="/profile" className={linkClass} onClick={() => setOpen(false)}>Profile</Link>
              <Link to="/logout" className="text-sm font-bold" onClick={() => setOpen(false)}>Logout</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/login" className="text-sm font-medium" onClick={() => setOpen(false)}>Log In</Link>
              <Link to="/signup" className="text-sm font-bold" onClick={() => setOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;