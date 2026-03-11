import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Successful login
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", "user");
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        // Login failed
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again later.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Form */}
        <div className="auth-form-section">
          <div className="auth-form-wrapper">
            <Link to="/" className="back-link">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Back to Home
            </Link>

            <div className="auth-header">
              <div className="logo-compact">
                <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="8" fill="url(#gradient-login)" />
                  <path d="M20 10L28 20L20 30L12 20L20 10Z" fill="white" opacity="0.9" />
                  <defs>
                    <linearGradient id="gradient-login" x1="0" y1="0" x2="40" y2="40">
                      <stop offset="0%" style={{ stopColor: "#6366f1" }} />
                      <stop offset="100%" style={{ stopColor: "#8b5cf6" }} />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h1 className="auth-title">Welcome Back</h1>
              <p className="auth-subtitle">Sign in to continue to your dashboard</p>
            </div>

            <form className="auth-form" id="loginForm" onSubmit={handleSubmit}>
              {error && (
                <div style={{ 
                  backgroundColor: "#fee2e2", 
                  color: "#b91c1c", 
                  padding: "0.75rem", 
                  borderRadius: "0.5rem", 
                  marginBottom: "1rem", 
                  fontSize: "0.875rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem"
                }}>
                  <span>{error}</span>
                  {error === "User account not found. Please sign up first." && (
                    <Link 
                      to="/signup" 
                      style={{ 
                        color: "#991b1b", 
                        fontWeight: "600", 
                        textDecoration: "underline",
                        display: "inline-block",
                        marginTop: "0.25rem"
                      }}
                    >
                      Create an account now
                    </Link>
                  )}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 6L10 11L17 6M4 4H16C16.5523 4 17 4.44772 17 5V15C17 15.5523 16.5523 16 16 16H4C3.44772 16 3 15.5523 3 15V5C3 4.44772 3.44772 4 4 4Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input 
                    type="email" 
                    id="email" 
                    className="form-input" 
                    placeholder="you@example.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 10V7C5 4.79086 6.79086 3 9 3H11C13.2091 3 15 4.79086 15 7V10M7 10H13C14.1046 10 15 10.8954 15 12V15C15 16.1046 14.1046 17 13 17H7C5.89543 17 5 16.1046 5 15V12C5 10.8954 5.89543 10 7 10Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input 
                    type="password" 
                    id="password" 
                    className="form-input" 
                    placeholder="••••••••" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" className="password-toggle" id="togglePassword">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 7C8.34315 7 7 8.34315 7 10C7 11.6569 8.34315 13 10 13C11.6569 13 13 11.6569 13 10C13 8.34315 11.6569 7 10 7Z" stroke="#9CA3AF" strokeWidth="1.5" />
                      <path d="M2 10C2 10 5 4 10 4C15 4 18 10 18 10C18 10 15 16 10 16C5 16 2 10 2 10Z" stroke="#9CA3AF" strokeWidth="1.5" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" className="checkbox-input" />
                  <span className="checkbox-text">Remember me</span>
                </label>
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-large"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
                {!isLoading && (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M7.5 15L12.5 10L7.5 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>

              <div className="divider">
                <span>or continue with</span>
              </div>

              <div className="social-auth-buttons">
                <button type="button" className="btn btn-social">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M18.17 8.36H10v3.64h4.58c-.42 2.06-2.12 3.64-4.58 3.64-2.76 0-5-2.24-5-5s2.24-5 5-5c1.26 0 2.4.48 3.28 1.26l2.65-2.65C14.46 2.82 12.34 2 10 2 5.59 2 2 5.59 2 10s3.59 8 8 8c4.42 0 8-3.18 8-8 0-.54-.06-1.06-.17-1.64z" fill="#4285F4" />
                  </svg>
                  Google
                </button>
                <button type="button" className="btn btn-social">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2c-4.4 0-8 3.6-8 8 0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0018 10c0-4.4-3.6-8-8-8z" fill="#000" />
                  </svg>
                  GitHub
                </button>
              </div>

              <p className="auth-footer-text">
                Don't have an account?
                <Link to="/signup" className="auth-link">Sign up for free</Link>
              </p>
              <p className="auth-footer-text" style={{ marginTop: "0.5rem" }}>
                Admin user?
                <Link to="/admin-login" className="auth-link">
                  Go to admin login
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="auth-visual-section">
          <div className="visual-content">
            <div className="visual-pattern"></div>
            <div className="visual-stats-card">
              <div className="stats-header">
                <h3>Your Financial Overview</h3>
                <span className="stats-badge">Live</span>
              </div>
              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-icon green">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="stat-info">
                    <p className="stat-label">Total Savings</p>
                    <p className="stat-value">₹1,24,560</p>
                    <p className="stat-change positive">+18.2%</p>
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-icon purple">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="stat-info">
                    <p className="stat-label">This Month</p>
                    <p className="stat-value">₹28,340</p>
                    <p className="stat-change negative">-5.4%</p>
                  </div>
                </div>
              </div>
              <div className="mini-chart-container">
                <svg className="expense-chart" viewBox="0 0 300 100">
                  <path d="M 0 80 Q 30 60, 60 65 T 120 55 T 180 45 T 240 50 T 300 40"
                    stroke="url(#chart-gradient)"
                    strokeWidth="3"
                    fill="none" />
                  <defs>
                    <linearGradient id="chart-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{ stopColor: "#6366f1", stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: "#8b5cf6", stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "ExpenseFlow transformed how I manage my finances. The insights are incredible!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">AS</div>
                <div className="author-info">
                  <p className="author-name">Arjun Singh</p>
                  <p className="author-role">Freelance Designer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
