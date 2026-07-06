import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { BASE_URL } from "../utils/api";
import logo from "../assets/quickbite-logo.svg";

const Login = () => {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();

  const getUser = async () => {
    const response = await fetch(
      `${BASE_URL}/common-api/profile`,
      {
        method: "GET",
        credentials: "include"
      }
    );

    const data = await response.json();
    return data;
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${BASE_URL}/common-api/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",  
          body: JSON.stringify(data)
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log(result);
        const userData = await getUser();
        setUser(userData.user);
        navigate("/");
      } else {
        setError(result.message || "Login failed");
      }
    } catch (error) {
      console.error(error);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[radial-gradient(circle_at_0%_0%,#ffe3d1_0%,transparent_28%),radial-gradient(circle_at_100%_100%,#ffe8d8_0%,transparent_30%),#fff9f4] px-4">
      <div className="bg-white shadow-2xl rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-orange-200 flex flex-col items-center">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="QuickBite Logo" className="h-16 mb-2" />
          <h2 className="brand-heading text-3xl font-black qb-brand-text">QuickBite</h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">Log in to order delicious meals</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
          <input
            type="email"
            placeholder="Email"
            required
            {...register("email")}
            className="w-full px-4 py-3 border border-orange-200 rounded-xl outline-none text-slate-800 bg-orange-50/20 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all placeholder-slate-400 text-sm"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              {...register("password")}
              className="w-full pl-4 pr-12 py-3 border border-orange-200 rounded-xl outline-none text-slate-800 bg-orange-50/20 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all placeholder-slate-400 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && (
            <div className="bg-orange-50 border border-orange-500 rounded-xl p-3 text-center text-xs font-semibold text-orange-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full qb-btn-primary text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          <p className="text-center text-xs text-slate-500 font-medium pt-2">
            Don't have an account?{" "}
            <Link to="/signup" className="text-orange-600 font-bold hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;