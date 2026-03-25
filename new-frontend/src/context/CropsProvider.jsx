import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getCrops } from "../service/modifyService";
import { Outlet } from "react-router-dom";

export const CropsContext = createContext(null);

export const CropsProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [crops, setCrops] = useState([]);
  const [error, setError] = useState(false);

  const cropsMap = useMemo(() => Object.fromEntries((crops || []).map((c) => [c.id, c])), [crops]);

  const doFetch = useCallback(async () => {
    try {
      const cropsData = await getCrops();
      setCrops(Array.isArray(cropsData) ? cropsData : []);
      setError(false);
    } catch (err) {
      console.error("Failed to fetch crops:", err);
      setCrops([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    doFetch();
  }, [doFetch]);

  // Auto-retry every 5 seconds when in error state
  useEffect(() => {
    if (!error) return;
    const id = setInterval(doFetch, 5000);
    return () => clearInterval(id);
  }, [error, doFetch]);

  const reload = async () => {
    setLoading(true);
    await doFetch();
  };

  const value = useMemo(
    () => ({ crops, setCrops, cropsMap, loading, error, reload }),
    [crops, cropsMap, loading, error]
  );

  return <CropsContext.Provider value={value}>{children ?? <Outlet />}</CropsContext.Provider>;
};

export const useCrops = () => useContext(CropsContext);
