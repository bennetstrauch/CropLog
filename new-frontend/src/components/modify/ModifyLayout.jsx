import React from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

const ModifyLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div>
      <div className="navbar">
        <button
          className={isActive("crops") ? "active" : ""}
          onClick={() => navigate("/modify/crops")}
        >
          Crops
        </button>
        <button
          className={isActive("fields") ? "active" : ""}
          onClick={() => navigate("/modify/fields")}
        >
          Fields
        </button>
        <button
          className={isActive("measure-units") ? "active" : ""}
          onClick={() => navigate("/modify/measure-units")}
        >
          Measure Units
        </button>
        <button
          className={isActive("categories") ? "active" : ""}
          onClick={() => navigate("/modify/categories")}
        >
          Categories
        </button>
      </div>

      <div className="turquoiseBorder_Div">
        <Outlet />
      </div>
    </div>
  );
};

export default ModifyLayout;
