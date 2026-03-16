import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { forgotPassword } from "../service/apiService";

const emailSchema = z.string().email("Please enter a valid email.");

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email ?? "");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setError("");
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    try {
      await forgotPassword(email);
    } catch (err) {
      // Intentionally show success regardless to avoid email enumeration,
      // but log internally so issues are visible during development.
      console.warn('Forgot password request failed:', err?.response?.status, err?.message);
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div>
        <h2>Check your email</h2>
        <p>If that address is registered, you'll receive a reset link shortly.</p>
        <button onClick={() => navigate("/login")}>Back to Login</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Forgot password?</h2>
      <p>Enter your email and we'll send you a reset link.</p>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <br />
        <button type="submit">Send reset link</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <br />
      <button onClick={() => navigate("/login")}>Back to Login</button>
    </div>
  );
};

export default ForgotPassword;
