import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../service/apiService';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await registerUser({ name, email, password });
      setRegistered(true);
    } catch (err) {
      const message = err?.response?.data?.message;
      if (err?.response?.status === 400 && message === 'Email already registered') {
        setError('This email is already registered. Try logging in instead.');
      } else {
        setError('Registration failed. Please try again.');
      }
      console.error(err);
    }
  };

  if (registered) {
    return (
      <div>
        <h2>Check your inbox</h2>
        <p>We sent a verification link to <strong>{email}</strong>.</p>
        <p>Click the link in the email to activate your account, then log in.</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength="6" required />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
