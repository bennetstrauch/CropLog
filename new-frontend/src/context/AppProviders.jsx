// src/context/AppProviders.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { CropsProvider } from "./CropsProvider";
import { FieldsUnitsProvider } from "./FieldsUnitsProvider";
import { CategoriesProvider } from "./CategoriesProvider";

export default function AppProviders({ children }) {
  // Priority loading: Crops first, then fields/units and categories in background
  return (
    <CropsProvider>
      <FieldsUnitsProvider>
        <CategoriesProvider>{children ?? <Outlet />}</CategoriesProvider>
      </FieldsUnitsProvider>
    </CropsProvider>
  );
}
