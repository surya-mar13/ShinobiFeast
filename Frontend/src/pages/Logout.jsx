import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { BASE_URL } from "../utils/api";

function Logout() {

  const navigate = useNavigate();
  const { setUser } = useUser();

  useEffect(() => {

    const logoutUser = async () => {

      try {

        await fetch(`${BASE_URL}/common-api/logout`, {
          method: "POST",
          credentials: "include"
        });

        // remove user from context
        setUser(null);

        // redirect to home
        navigate("/");

      } catch (error) {
        console.log(error);
      }

    };

    logoutUser();

  }, [navigate, setUser]);

  return (
    <div className="flex justify-center items-center h-screen">
      <h2 className="text-xl font-semibold">Logging out...</h2>
    </div>
  );
}

export default Logout;