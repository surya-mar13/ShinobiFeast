import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../context/UserContext";
import { BASE_URL } from "../utils/api";

const Login = () => {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

    } 
    else {
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
    <div className="flex justify-center items-center min-h-screen px-4">

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 w-full max-w-sm"
      >

        <input
          type="email"
          placeholder="Email"
          {...register("email")}
          className="w-full p-3 border rounded-lg"
        />

        <input
          type="password"
          placeholder="Password"
          {...register("password")}
          className="w-full p-3 border rounded-lg"
        />

        {loading && <p className="text-center text-blue-500 font-semibold">Logging in...</p>}

        {error && <p className="text-center text-red-500 font-semibold">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-orange-500 font-semibold">
            Register
          </Link>
        </p>

      </form>

    </div>
  );
};

export default Login;