import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { z } from "zod";
import { resetPassword, getErrorMessage } from "../service/apiService";
import Spinner from "../components/universal/Spinner";

const passwordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success'

  if (!token) {
    return (
      <div>
        <h2>Invalid reset link</h2>
        <p style={{ color: "red" }}>No reset token found. Please request a new link.</p>
        <button onClick={() => navigate("/forgot-password")}>Request new link</button>
      </div>
    );
  }

  const handleSubmit = async () => {
    setError("");
    const result = passwordSchema.safeParse({ newPassword, confirmPassword });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setStatus("loading");
    try {
      await resetPassword(token, newPassword);
      setStatus("success");
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus("idle");
    }
  };

  if (status === "success") {
    return (
      <div>
        <h2>Password updated!</h2>
        <p>Your password has been changed. You can now log in.</p>
        <button onClick={() => navigate("/login")}>Go to Login</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Set a new password</h2>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          className="auth-input"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
        />
        <input
          className="auth-input"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? (
            <span style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
              <Spinner size="sm" /> Saving...
            </span>
          ) : "Set new password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
