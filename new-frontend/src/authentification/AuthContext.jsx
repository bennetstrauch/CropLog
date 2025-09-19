import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Path_Login, Path_NewEntry } from "../routes/AppRouter";
import { setLogoutCallback } from "../service/authUtils";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("jwt_token"));
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("jwt_token");
    setToken(null);
    navigate(Path_Login); // Navigate to login on logout
  };

  // Register logout callback for API interceptor
  useEffect(() => {
    setLogoutCallback(logout);
  }, [logout]);

  const login = (newToken) => {
    console.log("Login called with token:", newToken);
    localStorage.setItem("jwt_token", newToken);
    setToken(newToken);
    navigate(Path_NewEntry); // Or your main app page
  };

  // The value provided to the context consumers
  const value = {
    isLoggedIn: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};