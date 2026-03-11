import { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    localStorage.setItem("role", "admin");
    navigate("/admin");
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Form */}
        <div className="auth-form-section">
          <div className="auth-form-wrapper">
            <Link to="/" className="back-link">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M12.5 15L7.5 10L12.5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Back to Home
            </Link>

            <div className="auth-header">
              <div className="logo-compact">
                <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
                  <rect
                    width="40"
                    height="40"
                    rx="8"
                    fill="url(#gradient-admin-login)"
                  />
                  <path
                    d="M20 10L28 20L20 30L12 20L20 10Z"
                    fill="white"
                    opacity="0.9"
                  />
                  <defs>
                    <linearGradient
                      id="gradient-admin-login"
                      x1="0"
                      y1="0"
                      x2="40"
                      y2="40"
                    >
                      <stop offset="0%" style={{ stopColor: "#6366f1" }} />
                      <stop offset="100%" style={{ stopColor: "#8b5cf6" }} />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h1 className="auth-title">Admin Login</h1>
              <p className="auth-subtitle">
                Sign in to access the admin console
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="admin-email" className="form-label">
                  Admin Email
                </label>
                <div className="input-wrapper">
                  <svg
                    className="input-icon"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M3 6L10 11L17 6M4 4H16C16.5523 4 17 4.44772 17 5V15C17 15.5523 16.5523 16 16 16H4C3.44772 16 3 15.5523 3 15V5C3 4.44772 3.44772 4 4 4Z"
                      stroke="#9CA3AF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    type="email"
                    id="admin-email"
                    className="form-input"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="admin-password" className="form-label">
                  Password
                </label>
                <div className="input-wrapper">
                  <svg
                    className="input-icon"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M5 10V7C5 4.79086 6.79086 3 9 3H11C13.2091 3 15 4.79086 15 7V10M7 10H13C14.1046 10 15 10.8954 15 12V15C15 16.1046 14.1046 17 13 17H7C5.89543 17 5 16.1046 5 15V12C5 10.8954 5.89543 10 7 10Z"
                      stroke="#9CA3AF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    type="password"
                    id="admin-password"
                    className="form-input"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="form-options">
                <span className="checkbox-text">Admin access only</span>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-large"
              >
                Sign In as Admin
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M7.5 15L12.5 10L7.5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <p className="auth-footer-text">
                Need a regular user account?{" "}
                <Link to="/login" className="auth-link">
                  Go to user login
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="auth-visual-section signup-visual">
          <div className="visual-content signup-benefits">
            <div className="visual-pattern"></div>
            <h2 className="benefits-title">Secure Admin Access</h2>
            <div className="benefit-list">
              <div className="benefit-item">
                <div className="benefit-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M10 2L3 5V9C3 13.4183 5.68629 17.4183 10 19C14.3137 17.4183 17 13.4183 17 9V5L10 2Z"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M7.5 9.5L9 11L12.5 7.5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="benefit-content">
                  <h4>Restricted Admin Controls</h4>
                  <p>Only admins can access system monitoring and user actions.</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M4 9L8 13L16 5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="benefit-content">
                  <h4>Separate User View</h4>
                  <p>End users see only their personal dashboard and budgets.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

