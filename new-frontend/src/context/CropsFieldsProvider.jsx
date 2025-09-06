import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCrops, getFields, getMeasureUnits } from "../service/modifyService";
import { Outlet } from "react-router-dom";

export const CropsFieldsContext = createContext(null);

/**
 * CropsFieldsProvider
 *
 * - Fetches crops, fields and measure units on mount
 * - Exposes: { crops, setCrops, fields, setFields, measureUnits, setMeasureUnits,
 *               cropsMap, fieldsMap, measureUnitsMap, loading, reload }
 *
 * NOTE: This provider does NOT short-circuit rendering while loading.
 * Consumers can use `loading` to show spinners if desired.
 */
export const CropsFieldsProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);

  const [crops, setCrops] = useState([]);
  const [fields, setFields] = useState([]);
  const [measureUnits, setMeasureUnits] = useState([]);

  // Derived maps memoized
  const cropsMap = useMemo(() => Object.fromEntries((crops || []).map((c) => [c.id, c])), [crops]);
  const fieldsMap = useMemo(() => Object.fromEntries((fields || []).map((f) => [f.id, f])), [fields]);
  const measureUnitsMap = useMemo(
    () => Object.fromEntries((measureUnits || []).map((m) => [m.id, m])),
    [measureUnits]
  );

  // Fetch on mount
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cropsData, fieldsData, measureUnitsData] = await Promise.all([
          getCrops(),
          getFields(),
          getMeasureUnits(),
        ]);
        if (!mounted) return;
        setCrops(Array.isArray(cropsData) ? cropsData : []);
        setFields(Array.isArray(fieldsData) ? fieldsData : []);
        setMeasureUnits(Array.isArray(measureUnitsData) ? measureUnitsData : []);
        // Log the fetched raw payloads (not state)
        console.log("Crops fetched:", cropsData);
        console.log("Fields fetched:", fieldsData);
        console.log("Measure units fetched:", measureUnitsData);
      } catch (err) {
        console.error("Failed to fetch crops/fields/measureUnits:", err);
        if (!mounted) return;
        setCrops([]);
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
      const [cropsData, fieldsData, measureUnitsData] = await Promise.all([
        getCrops(),
        getFields(),
        getMeasureUnits(),
      ]);
      setCrops(Array.isArray(cropsData) ? cropsData : []);
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
      crops,
      setCrops,
      fields,
      setFields,
      measureUnits,
      setMeasureUnits,
      cropsMap,
      fieldsMap,
      measureUnitsMap,
      loading,
      reload,
    }),
    [crops, fields, measureUnits, cropsMap, fieldsMap, measureUnitsMap, loading]
  );

  return <CropsFieldsContext.Provider value={value}>{children ?? <Outlet />}</CropsFieldsContext.Provider>;
};

// Hook for consumers
export const ProvideCropsAndFieldsContext = () => useContext(CropsFieldsContext);
