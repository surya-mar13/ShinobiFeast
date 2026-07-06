import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { House, Store, ShoppingBag, ClipboardList, LayoutDashboard, UserRound, LogOut, LogIn, UserPlus, Bike, Users, Package, UtensilsCrossed, Menu, X } from "lucide-react";
import logo from "../assets/quickbite-logo.svg";
import { useUser } from "../context/UserContext";
import { useCart } from "../context/CartContext";

const linkClass = "inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-orange-600 transition-colors";
const activeClass = "text-orange-600";

function NavLinks({ role, onClose = () => {} }) {
  const cls = ({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`;
  return (
    <>
      <NavLink to="/" end className={cls} onClick={onClose}><House size={16} />Home</NavLink>
      <NavLink to="/restaurants" className={cls} onClick={onClose}><Store size={16} />Restaurants</NavLink>
      {role === "user" && (
        <>
          <NavLink to="/cart" className={cls} onClick={onClose}><ShoppingBag size={16} />Cart</NavLink>
          <NavLink to="/orders" className={cls} onClick={onClose}><ClipboardList size={16} />My Orders</NavLink>
        </>
      )}
      {role === "vendor" && (
        <>
          <NavLink to="/vendor" className={cls} onClick={onClose}><LayoutDashboard size={16} />Dashboard</NavLink>
          <NavLink to="/vendor/restaurants" className={cls} onClick={onClose}><Store size={16} />My Restaurants</NavLink>
          <NavLink to="/vendor/products" className={cls} onClick={onClose}><UtensilsCrossed size={16} />My Products</NavLink>
          <NavLink to="/vendor/orders" className={cls} onClick={onClose}><Package size={16} />Vendor Orders</NavLink>
        </>
      )}
      {role === "admin" && (
        <>
          <NavLink to="/admin" className={cls} onClick={onClose}><LayoutDashboard size={16} />Dashboard</NavLink>
          <NavLink to="/admin/users" className={cls} onClick={onClose}><Users size={16} />Users</NavLink>
          <NavLink to="/admin/orders" className={cls} onClick={onClose}><Package size={16} />All Orders</NavLink>
          <NavLink to="/admin/restaurants" className={cls} onClick={onClose}><Store size={16} />Restaurants</NavLink>
          <NavLink to="/admin/delivery" className={cls} onClick={onClose}><Bike size={16} />Delivery Partners</NavLink>
        </>
      )}
      {role === "deliveryPartner" && (
        <NavLink to="/delivery" className={cls} onClick={onClose}><Bike size={16} />Delivery Hub</NavLink>
      )}
    </>
  );
}

function Header() {
  const { user } = useUser();
  const { itemCount } = useCart() || {};
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-orange-200/70 bg-white/90 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-3.5">

        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src={logo} alt="QuickBite Logo" className="h-10 w-10" />
          <div>
            <span className="brand-heading text-xl leading-none qb-brand-text">QuickBite</span>
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500">Eat Fast, Live Fresh</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-5">
          <NavLinks role={user?.role} />
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {user.role === "user" && (
                <Link to="/cart" className="relative rounded-full bg-amber-50 p-2.5 text-orange-600 hover:bg-amber-100 transition" aria-label="Cart">
                  <ShoppingBag size={18} />
                  {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">{itemCount}</span>
                  )}
                </Link>
              )}
              <Link to="/profile" className={linkClass}>
                <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-semibold"><UserRound size={14} />{user.name.split(" ")[0]}</span>
              </Link>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full capitalize">{user.role}</span>
              <Link to="/logout" className="qb-btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"><LogOut size={14} />Logout</Link>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass}><LogIn size={16} />Log In</Link>
              <Link to="/signup" className="qb-btn-primary inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold"><UserPlus size={16} />Sign Up</Link>
            </>
          )}
        </div>

        <button className="md:hidden rounded-lg p-1.5 text-slate-700" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-orange-200 bg-white px-6 py-5 flex flex-col gap-4">
          <NavLinks role={user?.role} onClose={() => setOpen(false)} />
          <hr className="border-orange-200" />
          {user ? (
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold text-slate-700">Hi, {user.name} <span className="text-xs bg-amber-100 text-orange-600 px-2 py-0.5 rounded-full ml-1 capitalize">{user.role}</span></span>
              <Link to="/profile" className={linkClass} onClick={() => setOpen(false)}>Profile</Link>
              <Link to="/logout" className="text-sm font-bold text-orange-600" onClick={() => setOpen(false)}>Logout</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/login" className="text-sm font-medium text-slate-700" onClick={() => setOpen(false)}>Log In</Link>
              <Link to="/signup" className="text-sm font-bold text-orange-600" onClick={() => setOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;