import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, resendVerification, getErrorMessage } from '../service/apiService';
import Spinner from '../components/universal/Spinner';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerUser({ name, email, password });
      setRegistered(true);
    } catch (err) {
      if (err?.response?.status === 400 && err?.response?.data?.message === 'Email already registered') {
        setError('This email is already registered. Try logging in instead.');
      } else {
        setError(getErrorMessage(err));
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendStatus('Sending...');
    try {
      await resendVerification(email);
      setResendStatus('Verification email sent! Check your inbox.');
    } catch {
      setResendStatus('Failed to resend. Please try again.');
    }
  };

  if (registered) {
    return (
      <div>
        <h2>Check your inbox</h2>
        <p>We sent a verification link to <strong>{email}</strong>.</p>
        <p>Click the link in the email to activate your account, then log in.</p>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>The email can take up to a minute to arrive. In the meantime you can already head to login.</p>
        <button onClick={handleResend}>Resend verification email</button>
        {resendStatus && <p>{resendStatus}</p>}
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  return (
    <div>      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input className="auth-input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
        <input className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input className="auth-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" minLength="6" required />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
              <Spinner size="sm" /> Registering...
            </span>
          ) : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
