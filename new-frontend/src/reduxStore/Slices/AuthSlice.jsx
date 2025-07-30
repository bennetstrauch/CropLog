import { createSlice } from "@reduxjs/toolkit";
import { useNavigate } from "react-router-dom";

// Check for the token in localStorage to define the initial state
const token = localStorage.getItem('jwt_token');

const initialState = {
  // The user is logged in if a token exists.
  loggedIn: !!token, 
  token: token,
  // You could also store user info here
  user: null, 
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action to handle successful login
    loginSuccess: (state, action) => {
      const { token, user } = action.payload;
      localStorage.setItem('jwt_token', token);
      state.loggedIn = true;
      state.token = token;
      state.user = user; // Optionally store user details
    },
    // Action to handle logout
    logout: (state) => {
      localStorage.removeItem('jwt_token');
      state.loggedIn = false;
      state.token = null;
      state.user = null;
    },
  },
});

// Export the actions
export const { loginSuccess, logout } = authSlice.actions;

export default authSlice;