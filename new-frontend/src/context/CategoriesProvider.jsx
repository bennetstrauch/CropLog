// src/context/CategoriesProvider.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCategories } from "../service/modifyService";
import { Outlet } from "react-router-dom";

export const CategoriesContext = createContext();

export const CategoriesProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getCategories();
        if (!mounted) return;
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load categories:", err);
        if (mounted) setCategories([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const categoriesMap = useMemo(
    () => Object.fromEntries((categories || []).map((c) => [c.id, c])),
    [categories]
  );

  const value = useMemo(
    () => ({ categories, setCategories, categoriesMap, loading }),
    [categories, categoriesMap, loading]
  );

  return (
    <CategoriesContext.Provider value={value}>
      {children ?? <Outlet />}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => useContext(CategoriesContext);
