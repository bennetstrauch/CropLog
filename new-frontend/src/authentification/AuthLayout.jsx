import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="auth-container">
      {/* Shared navigation for Login and Register */}
      {/* <nav className="auth-nav">
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/register">Register</NavLink>
      </nav> */}

      <main>
        {/* The Login or Register component will be rendered here */}
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;