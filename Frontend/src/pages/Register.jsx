import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/api";

const Register = () => {

  const { register, handleSubmit, watch } = useForm();
  const role = watch("role");
  const navigate = useNavigate();
 
  const onSubmit = async (data) => {
    try {
      const response = await fetch(
        `${BASE_URL}/common-api/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Registration successful");
       

        // redirect to login
        navigate("/login");
      } 
      else {
        alert(result.message || "Registration failed");
      }

    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 sm:p-8 rounded-xl shadow-md w-full max-w-sm space-y-4"
      >

        <h2 className="text-2xl font-bold text-center text-orange-500">
          Register
        </h2>

        <input
          type="text"
          placeholder="Full Name"
          {...register("name")}
          className="w-full p-3 border rounded-lg"
        />

        <input
          type="email"
          placeholder="Email"
          {...register("email")}
          className="w-full p-3 border rounded-lg"
        />

        <input
          type="text"
          placeholder="Phone Number"
          {...register("phone")}
          className="w-full p-3 border rounded-lg"
        />

        <input
          type="password"
          placeholder="Password"
          {...register("password")}
          className="w-full p-3 border rounded-lg"
        />

        <select
          {...register("role")}
          className="w-full p-3 border rounded-lg"
        >
          <option value="user">User</option>
          <option value="vendor">Vendor</option>
          <option value="deliveryPartner">Delivery Partner</option>
        </select>

        {role === "deliveryPartner" && (
          <>
            <select
              {...register("vehicleType")}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Vehicle Type</option>
              <option value="bike">Bike</option>
              <option value="scooter">Scooter</option>
              <option value="cycle">Cycle</option>
            </select>

            <input
              type="text"
              placeholder="Vehicle Number"
              {...register("vehicleNumber")}
              className="w-full p-3 border rounded-lg"
            />
          </>
        )}

        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600"
        >
          Register
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-500">
            Login
          </Link>
        </p>

      </form>

    </div>
  );
};

export default Register;