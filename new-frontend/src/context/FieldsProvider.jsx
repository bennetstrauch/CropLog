import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getFields } from "../service/modifyService";
import { Outlet } from "react-router-dom";

export const FieldsContext = createContext(null);

/**
 * FieldsProvider - Manages field data
 *
 * - Fetches fields data for harvest field selection
 * - Exposes: { fields, setFields, fieldsMap, loading, reload }
 * - Used primarily for field selection during harvest entry
 */
export const FieldsProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState([]);

  // Derived map memoized for quick field lookups
  const fieldsMap = useMemo(() => Object.fromEntries((fields || []).map((f) => [f.id, f])), [fields]);

  // Fetch fields on mount
  useEffect(() => {
    let mounted = true;
    const fetchFields = async () => {
      setLoading(true);
      try {
        const fieldsData = await getFields();
        if (!mounted) return;
        setFields(Array.isArray(fieldsData) ? fieldsData : []);
      } catch (err) {
        console.error("Failed to fetch fields:", err);
        if (!mounted) return;
        setFields([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchFields();
    return () => {
      mounted = false;
    };
  }, []);

  const reload = async () => {
    setLoading(true);
    try {
      const fieldsData = await getFields();
      setFields(Array.isArray(fieldsData) ? fieldsData : []);
    } catch (err) {
      console.error("Failed to reload fields:", err);
    } finally {
      setLoading(false);
    }
  };

  // Memoize provider value to avoid unnecessary consumer re-renders
  const value = useMemo(
    () => ({
      fields,
      setFields,
      fieldsMap,
      loading,
      reload,
    }),
    [fields, fieldsMap, loading]
  );

  return <FieldsContext.Provider value={value}>{children ?? <Outlet />}</FieldsContext.Provider>;
};

// Hook for consumers
export const useFields = () => useContext(FieldsContext);