import React, { useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import GoBackButton from "../universal/GoBackButton";
import { usePlan } from "../../context/PlanProvider";
import PlanOverageModal from "../plan/PlanOverageModal";

const ModifyLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOverLimit, isBlocking, daysRemaining, loading } = usePlan();
  const [modalOpen, setModalOpen] = useState(false);

  const isActive = (path) => location.pathname.includes(path);

  const showBanner = !loading && isOverLimit && !isBlocking;

  return (
    <div>
      <div className="navbar">
        <GoBackButton toMainPage={true} />
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

      {showBanner && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-amber-800">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>
              Free plan limit exceeded — please resolve within{" "}
              {daysRemaining != null && daysRemaining > 0
                ? `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}.`
                : "the deadline."}
            </span>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex-shrink-0 text-amber-700 font-medium hover:text-amber-900 underline transition-colors"
          >
            Resolve Now →
          </button>
        </div>
      )}

      {modalOpen && (
        <PlanOverageModal blocking={false} initialOpen={true} onClose={() => setModalOpen(false)} />
      )}

      <div className="">
        <Outlet />
      </div>
    </div>
  );
};

export default ModifyLayout;
