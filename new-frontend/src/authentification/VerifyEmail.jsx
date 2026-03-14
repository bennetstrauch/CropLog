import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../service/apiService';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setErrorMessage('No verification token found.');
      return;
    }

    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setErrorMessage(
          err.response?.data?.message || 'The verification link is invalid or has expired.'
        );
      });
  }, []);

  if (status === 'loading') {
    return (
      <div>
        <p>Verifying your email...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div>
        <h2>Email verified!</h2>
        <p>Your account is now active. You can log in.</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Verification failed</h2>
      <p style={{ color: 'red' }}>{errorMessage}</p>
      <button onClick={() => navigate('/login')}>Go to Login</button>
    </div>
  );
};

export default VerifyEmail;
