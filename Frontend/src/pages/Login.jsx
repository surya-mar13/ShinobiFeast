import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { BASE_URL } from "../utils/api";
import logo from "../assets/logo.png";

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
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#FF5C00] to-white/10 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 max-w-sm w-full border border-orange-100 flex flex-col items-center">
        {/* Branding header */}
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Logo" className="h-16 mb-2" />
          <h2 className="text-2xl font-black text-[#FF5C00]">ShinobiFeast</h2>
          <p className="text-orange-400 text-xs mt-1 font-medium">Log in to order delicious meals</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
          {/* Email field */}
          <input
            type="email"
            placeholder="Email"
            required
            {...register("email")}
            className="w-full px-4 py-3 border border-orange-200 rounded-xl outline-none text-orange-955 bg-orange-50/20 focus:bg-white focus:border-[#FF5C00] focus:ring-2 focus:ring-orange-100 transition-all placeholder-orange-300 text-sm"
          />

          {/* Password field */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              {...register("password")}
              className="w-full pl-4 pr-12 py-3 border border-orange-200 rounded-xl outline-none text-orange-955 bg-orange-50/20 focus:bg-white focus:border-[#FF5C00] focus:ring-2 focus:ring-orange-100 transition-all placeholder-orange-300 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-bold text-orange-400 hover:text-[#FF5C00] transition-colors"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-orange-50 border border-[#FF5C00] rounded-xl p-3 text-center text-xs font-semibold text-[#FF5C00]">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF5C00] hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          {/* Register Link */}
          <p className="text-center text-xs text-orange-400 font-medium pt-2">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#FF5C00] font-bold hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;