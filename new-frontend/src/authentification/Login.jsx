import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../reduxStore/Slices/AuthSlice";
import { loginUser, resendVerification, getErrorMessage } from "../service/apiService";
import Spinner from "../components/universal/Spinner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loggedIn = useSelector((state) => state.auth.loggedIn);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendStatus, setResendStatus] = useState("");

  useEffect(() => {
    if (loggedIn) {
      navigate("/");
    }
  }, [loggedIn]);

  const handleLogin = async () => {
    setError("");
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser({ email, password });
      dispatch(loginSuccess({ token: response.token, user: response.user }));
      navigate("/");
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Please verify your email before logging in.");
        setUnverifiedEmail(email);
      } else if (!err.response) {
        setError(getErrorMessage(err));
        setUnverifiedEmail("");
      } else {
        setError("Invalid email or password.");
        setUnverifiedEmail("");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendStatus("Sending...");
    try {
      await resendVerification(unverifiedEmail);
      setResendStatus("Verification email sent! Check your inbox.");
    } catch {
      setResendStatus("Failed to resend. Please try again.");
    }
  };

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <br />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Spinner size="sm" /> Logging in...
            </span>
          ) : "Login"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={() => navigate("/forgot-password", { state: { email } })}>Forgot password?</button>
      {unverifiedEmail && (
        <div>
          <button onClick={handleResend}>Resend verification email</button>
          {resendStatus && <p>{resendStatus}</p>}
        </div>
      )}
    </div>
  );
};

export default Login;
