// src/context/AppProviders.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { CropsFieldsProvider } from "./CropsFieldsProvider";
import { CategoriesProvider } from "./CategoriesProvider";

export default function AppProviders({ children }) {
  // if children exists (manually composed) render them, otherwise render an Outlet
  return (
    <CropsFieldsProvider>
      <CategoriesProvider>{children ?? <Outlet />}</CategoriesProvider>
    </CropsFieldsProvider>
  );
}
