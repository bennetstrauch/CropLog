import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../reduxStore/Slices/AuthSlice";
import { loginUser, registerUser } from "../service/apiService";

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
  const [activeSection, setActiveSection] = useState("login");
  const [error, setError] = useState("");

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

    try {
      const response = await loginUser({ email, password });
      dispatch(loginSuccess({ token: response.token, user: response.user }));
      navigate("/");
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  const handleRegister = async () => {
    setError("");
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    try {
      await registerUser({ email, password });
      alert("Registration successful!");
      setActiveSection("login");
    } catch (err) {
      setError("Failed to register. Try again.");
    }
  };

  const renderInput = () => (
    <div>
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
    </div>
  );

  const renderNavBar = () => (
    <div className="navbar">
      <button onClick={() => setActiveSection("login")}>Login</button>
      <button onClick={() => setActiveSection("register")}>Register</button>
    </div>
  );

  return (
    <div>
      {renderNavBar()}
      <br />
      <div className="turquoiseBorder_Div">
        {activeSection === "login" && (
          <div>
            {renderInput()}
            <br />
            <button onClick={handleLogin}>Login</button>
          </div>
        )}
        {activeSection === "register" && (
          <div>
            {renderInput()}
            <br />
            <button onClick={handleRegister}>Register</button>
          </div>
        )}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
};

export default Login;
