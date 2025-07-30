import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "../authentification/AuthContext";
import { CropsFieldsProvider } from "../context/CropsFieldsProvider";

// Layouts
import AuthLayout from "../authentification/AuthLayout";
import CheckAuth from "./CheckAuth"; // Your component to protect routes

// Pages
import Login from "../authentification/Login";
import Register from "../authentification/Register";
import MainPage from "../pages/MainPage";
import FinalizeEntry from "../components/newHarvestEntry/FinalizeEntry";
import HarvestLog from "../pages/HarvestLog";
import NotFoundPage from "../pages/NotFoundPage"; // A component for 404 errors

// Path Constants
export const Path_HarvestLog = "/harvest-log";
export const Path_NewEntry = "/new-entry";
export const Path_Login = "/login";
export const Path_Register = "/register";

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
          <Route element={<CropsFieldsProvider />}>
            <Route path="/" element={<MainPage />} />
            <Route path={Path_NewEntry} element={<MainPage />} />
            <Route path={Path_HarvestLog} element={<HarvestLog />} />
            <Route
              path={`${Path_NewEntry}/:cropName`}
              element={<FinalizeEntry />}
            />
          </Route>
        </Route>

        {/* 3. Catch-all route for pages that don't exist */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default AppRouter;
