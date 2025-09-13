import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getFields, getMeasureUnits } from "../service/modifyService";
import { Outlet } from "react-router-dom";

export const FieldsUnitsContext = createContext(null);

/**
 * FieldsUnitsProvider - Background loading for fields and measure units
 *
 * - Fetches fields and measure units in background (non-blocking)
 * - Exposes: { fields, setFields, measureUnits, setMeasureUnits,
 *               fieldsMap, measureUnitsMap, loading, reload }
 *
 * NOTE: This provider loads data in background after crops are loaded.
 * Components can gracefully handle missing data with fallbacks.
 */
export const FieldsUnitsProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState([]);
  const [measureUnits, setMeasureUnits] = useState([]);

  // Derived maps memoized
  const fieldsMap = useMemo(() => Object.fromEntries((fields || []).map((f) => [f.id, f])), [fields]);
  const measureUnitsMap = useMemo(
    () => Object.fromEntries((measureUnits || []).map((m) => [m.id, m])),
    [measureUnits]
  );

  // Fetch fields and measure units (background loading)
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Load fields and measure units in parallel but separately from crops
        const [fieldsData, measureUnitsData] = await Promise.all([
          getFields(),
          getMeasureUnits(),
        ]);
        if (!mounted) return;
        setFields(Array.isArray(fieldsData) ? fieldsData : []);
        setMeasureUnits(Array.isArray(measureUnitsData) ? measureUnitsData : []);
      } catch (err) {
        console.error("Failed to fetch fields/measureUnits:", err);
        if (!mounted) return;
        setFields([]);
        setMeasureUnits([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, []); // run once

  const reload = async () => {
    setLoading(true);
    try {
      const [fieldsData, measureUnitsData] = await Promise.all([
        getFields(),
        getMeasureUnits(),
      ]);
      setFields(Array.isArray(fieldsData) ? fieldsData : []);
      setMeasureUnits(Array.isArray(measureUnitsData) ? measureUnitsData : []);
    } catch (err) {
      console.error("Failed to reload data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Memoize provider value to avoid unnecessary consumer re-renders
  const value = useMemo(
    () => ({
      fields,
      setFields,
      measureUnits,
      setMeasureUnits,
      fieldsMap,
      measureUnitsMap,
      loading,
      reload,
    }),
    [fields, measureUnits, fieldsMap, measureUnitsMap, loading]
  );

  return <FieldsUnitsContext.Provider value={value}>{children ?? <Outlet />}</FieldsUnitsContext.Provider>;
};

// Hook for consumers
export const useFieldsUnits = () => useContext(FieldsUnitsContext);
