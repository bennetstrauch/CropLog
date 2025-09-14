import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMeasureUnits } from "../service/modifyService";
import { Outlet } from "react-router-dom";

export const MeasureUnitsContext = createContext(null);

/**
 * MeasureUnitsProvider - Manages measure unit data
 *
 * - Fetches measure units for crop management and display
 * - Exposes: { measureUnits, setMeasureUnits, measureUnitsMap, loading, reload }
 * - Used primarily for crop forms and harvest display units
 */
export const MeasureUnitsProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [measureUnits, setMeasureUnits] = useState([]);

  // Derived map memoized for quick measure unit lookups
  const measureUnitsMap = useMemo(
    () => Object.fromEntries((measureUnits || []).map((m) => [m.id, m])),
    [measureUnits]
  );

  // Fetch measure units on mount
  useEffect(() => {
    let mounted = true;
    const fetchMeasureUnits = async () => {
      setLoading(true);
      try {
        const measureUnitsData = await getMeasureUnits();
        if (!mounted) return;
        setMeasureUnits(Array.isArray(measureUnitsData) ? measureUnitsData : []);
      } catch (err) {
        console.error("Failed to fetch measure units:", err);
        if (!mounted) return;
        setMeasureUnits([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchMeasureUnits();
    return () => {
      mounted = false;
    };
  }, []);

  const reload = async () => {
    setLoading(true);
    try {
      const measureUnitsData = await getMeasureUnits();
      setMeasureUnits(Array.isArray(measureUnitsData) ? measureUnitsData : []);
    } catch (err) {
      console.error("Failed to reload measure units:", err);
    } finally {
      setLoading(false);
    }
  };

  // Memoize provider value to avoid unnecessary consumer re-renders
  const value = useMemo(
    () => ({
      measureUnits,
      setMeasureUnits,
      measureUnitsMap,
      loading,
      reload,
    }),
    [measureUnits, measureUnitsMap, loading]
  );

  return <MeasureUnitsContext.Provider value={value}>{children ?? <Outlet />}</MeasureUnitsContext.Provider>;
};

// Hook for consumers
export const useMeasureUnits = () => useContext(MeasureUnitsContext);