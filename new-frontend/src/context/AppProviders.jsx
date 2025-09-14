// src/context/AppProviders.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { CropsProvider } from "./CropsProvider";
import { FieldsProvider } from "./FieldsProvider";
import { MeasureUnitsProvider } from "./MeasureUnitsProvider";
import { CategoriesProvider } from "./CategoriesProvider";

export default function AppProviders({ children }) {
  // Priority loading: Crops first, then fields, measure units, and categories load independently in background
  return (
    <CropsProvider>
      <FieldsProvider>
        <MeasureUnitsProvider>
          <CategoriesProvider>{children ?? <Outlet />}</CategoriesProvider>
        </MeasureUnitsProvider>
      </FieldsProvider>
    </CropsProvider>
  );
}
