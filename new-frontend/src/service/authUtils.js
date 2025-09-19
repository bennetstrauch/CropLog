// authUtils.js - Centralized auth utilities

let logoutCallback = null;

// Function to set the logout callback from AuthContext
export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

// Function to trigger logout (used by API interceptor)
export const triggerLogout = () => {
  if (logoutCallback) {
    logoutCallback();
  } else {
    // Fallback: clear localStorage and reload page
    localStorage.removeItem("jwt_token");
    window.location.href = "/login";
  }
};