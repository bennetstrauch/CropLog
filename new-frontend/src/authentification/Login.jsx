import React, { useState } from 'react';
import { z } from 'zod';
import { loginUser } from '../service/apiService';
import { useAuth } from './AuthContext';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../reduxStore/Slices/AuthSlice';
import { useNavigate } from 'react-router-dom';
import { Path_NewEntry } from '../routes/AppRouter';


// Define the schema using Zod
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
});

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();


  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // 1. Validate input with Zod
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    try {
      // 2. Call the centralized API service
      const response = await loginUser({ email, password });
      
      // 3. Use the AuthContext to handle the token and navigation
      if (response.token) {
            dispatch(loginSuccess({ token: response.token, user: response.user })); 
            navigate(Path_NewEntry)
      }
    } catch (err) {
      // 4. Set state to display errors gracefully
      setError('Invalid email or password. Please try again.');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        {/* Conditionally render the error message */}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;