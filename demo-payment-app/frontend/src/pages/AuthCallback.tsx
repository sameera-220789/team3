import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userStr = params.get('user');

    if (token) {
      sessionStorage.setItem('token', token);
    }
    if (userStr) {
      sessionStorage.setItem('user', userStr);
    }

    // Navigating back
    navigate('/', { replace: true });
  }, [location, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F9FAFB' }}>
      <h2 style={{ color: '#111827' }}>Authenticating...</h2>
    </div>
  );
}
