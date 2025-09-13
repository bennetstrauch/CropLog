import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCrops } from "../service/modifyService";
import { Outlet } from "react-router-dom";

export const CropsContext = createContext(null);

/**
 * CropsProvider - Priority loading for crops data
 *
 * - Fetches crops immediately on mount for fast UI loading
 * - Exposes: { crops, setCrops, cropsMap, loading, reload }
 * - Optimized for quick crop selection in main workflow
 */
export const CropsProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [crops, setCrops] = useState([]);

  // Derived map memoized
  const cropsMap = useMemo(() => Object.fromEntries((crops || []).map((c) => [c.id, c])), [crops]);

  // Fetch crops immediately on mount
  useEffect(() => {
    let mounted = true;
    const fetchCrops = async () => {
      setLoading(true);
      try {
        const cropsData = await getCrops();
        if (!mounted) return;
        setCrops(Array.isArray(cropsData) ? cropsData : []);
      } catch (err) {
        console.error("Failed to fetch crops:", err);
        if (!mounted) return;
        setCrops([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCrops();
    return () => {
      mounted = false;
    };
  }, []); // run once

  const reload = async () => {
    setLoading(true);
    try {
      const cropsData = await getCrops();
      setCrops(Array.isArray(cropsData) ? cropsData : []);
    } catch (err) {
      console.error("Failed to reload crops:", err);
    } finally {
      setLoading(false);
    }
  };

  // Memoize provider value to avoid unnecessary consumer re-renders
  const value = useMemo(
    () => ({
      crops,
      setCrops,
      cropsMap,
      loading,
      reload,
    }),
    [crops, cropsMap, loading]
  );

  return <CropsContext.Provider value={value}>{children ?? <Outlet />}</CropsContext.Provider>;
};

// Hook for consumers
export const useCrops = () => useContext(CropsContext);