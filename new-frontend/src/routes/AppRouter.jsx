import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "../authentification/AuthContext";

// Layouts
import AuthLayout from "../authentification/AuthLayout";
import CheckAuth from "./CheckAuth"; // Your component to protect routes
import ModifyLayout from "../components/modify/ModifyLayout";


// Pages
import Login from "../authentification/Login";
import Register from "../authentification/Register";
import MainPageRefactored from "../pages/MainPageRefactored";
import HarvestLog from "../pages/HarvestLog";
import NotFoundPage from "../pages/NotFoundPage"; // A component for 404 errors
import FinalizeEntry from "../Components/newHarvestEntry/finalizeEntry";
import ModifyValues from "../components/modify/ModifyValues";

import CropSection from "../components/modify/CropSection";
import FieldSection from "../components/modify/FieldSection";
import MeasureUnitSection from "../components/modify/MeasureUnitSection";
import CategorySection from "../components/modify/CategorySection";
import { CategoriesProvider } from "../context/CategoriesProvider";
import AppProviders from "../context/AppProviders";

// Path Constants
export const Path_HarvestLog = "/harvest-log";
export const Path_NewEntry = "/new-entry";
export const Path_Modify = "/modify";

export const Path_Login = "/login";
export const Path_Register = "/register";

export const Term_Crops = "crops";
export const Term_Fields = "fields";
export const Term_MeasureUnits = "measure-units";
export const Term_Categories = "categories";


function AppRouter() {
  return (
    <AuthProvider>
      <Routes>
        {/* 1. Public routes with a shared layout */}
        <Route element={<AuthLayout />}>
          <Route path={Path_Login} element={<Login />} />
          <Route path={Path_Register} element={<Register />} />
        </Route>

        {/* 2. Protected routes that require a logged-in user */}
        <Route element={<CheckAuth />}>
            <Route element={<AppProviders />}>
              <Route path="/" element={<MainPageRefactored />} />
              <Route path={Path_NewEntry} element={<MainPageRefactored />} />
              <Route path={Path_HarvestLog} element={<HarvestLog />} />
              <Route path={`${Path_NewEntry}/:cropName`} element={<FinalizeEntry />} />

              <Route path={Path_Modify} element={<ModifyLayout />}>
                <Route index element={<CropSection />} />
                <Route path={Term_Crops} element={<CropSection />} />
                <Route path={Term_Fields} element={<FieldSection />} />
                <Route path={Term_MeasureUnits} element={<MeasureUnitSection />} />
                <Route path={Term_Categories} element={<CategorySection />} />
              </Route>
          </Route>
        </Route>

        {/* 3. Catch-all route for pages that don't exist */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default AppRouter;
