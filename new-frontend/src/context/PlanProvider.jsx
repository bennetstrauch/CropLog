import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getPlanInfo } from "../service/apiService";

const PlanContext = createContext(null);

export const usePlan = () => {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used within PlanProvider");
  return ctx;
};

export const PlanProvider = ({ children }) => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const reloadPlan = useCallback(async () => {
    try {
      const data = await getPlanInfo();
      setPlan(data);
    } catch (err) {
      console.error("Failed to fetch plan info:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadPlan();
  }, [reloadPlan]);

  const isOverLimit =
    plan?.plan === "FREE" &&
    (plan.currentCounts?.crops > plan.limits?.maxCrops ||
      plan.currentCounts?.fields > plan.limits?.maxFields ||
      plan.currentCounts?.measureUnits > plan.limits?.maxMeasureUnits);

  const overage = plan
    ? {
        crops: Math.max(0, (plan.currentCounts?.crops ?? 0) - (plan.limits?.maxCrops ?? Infinity)),
        fields: Math.max(0, (plan.currentCounts?.fields ?? 0) - (plan.limits?.maxFields ?? Infinity)),
        measureUnits: Math.max(0, (plan.currentCounts?.measureUnits ?? 0) - (plan.limits?.maxMeasureUnits ?? Infinity)),
      }
    : { crops: 0, fields: 0, measureUnits: 0 };

  const gracePeriodEndsAt = plan?.gracePeriodEndsAt ? new Date(plan.gracePeriodEndsAt) : null;
  const isBlocking = isOverLimit && gracePeriodEndsAt != null && Date.now() > gracePeriodEndsAt.getTime();
  const daysRemaining = gracePeriodEndsAt
    ? Math.max(0, Math.ceil((gracePeriodEndsAt.getTime() - Date.now()) / 86400000))
    : null;

  return (
    <PlanContext.Provider
      value={{ plan, loading, isOverLimit, overage, isBlocking, gracePeriodEndsAt, daysRemaining, reloadPlan }}
    >
      {children}
    </PlanContext.Provider>
  );
};
