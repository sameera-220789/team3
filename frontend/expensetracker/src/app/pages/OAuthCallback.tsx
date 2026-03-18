import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userData = params.get("user");

    if (token && userData) {
      try {
        // Store in localStorage (matching existing login logic)
        localStorage.setItem("token", token);
        localStorage.setItem("role", "user");
        localStorage.setItem("user", userData);

        // Success redirect
        navigate("/dashboard");
      } catch (err) {
        console.error("Error parsing OAuth user data:", err);
        navigate("/login?error=auth_failed");
      }
    } else {
      // Missing params
      navigate("/login?error=auth_failed");
    }
  }, [location, navigate]);

  return (
    <div className="auth-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-container" style={{ textAlign: 'center', padding: '40px' }}>
        <div className="logo-compact" style={{ marginBottom: '20px', margin: '0 auto' }}>
          <svg width="64" height="64" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="url(#gradient-callback)" />
            <path d="M20 10L28 20L20 30L12 20L20 10Z" fill="white" opacity="0.9" />
            <defs>
              <linearGradient id="gradient-callback" x1="0" y1="0" x2="40" y2="40">
                <stop offset="0%" style={{ stopColor: "#6366f1" }} />
                <stop offset="100%" style={{ stopColor: "#8b5cf6" }} />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h2 className="auth-title">Authenticating...</h2>
        <p className="auth-subtitle">Finalizing your secure login, please wait.</p>
        <div className="loading-spinner" style={{ 
          marginTop: '30px',
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #6366f1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '30px auto 0'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
