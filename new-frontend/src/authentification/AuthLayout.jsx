import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const AuthLayout = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="navbar">
        <button onClick={() => navigate("/login")}>Login</button>
        <button onClick={() => navigate("/register")}>Register</button>
      </div>
      <br />
      <div className="turquoiseBorder_Div">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
