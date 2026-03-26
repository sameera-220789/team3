import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../utils/config";

export default function Signup() {
  const navigate = useNavigate();

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currency, setCurrency] = useState("INR");

  // Status State
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          currency,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Account created successfully! Redirecting...");
        // Clear form
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setCurrency("INR");

        // Redirect to login after 2 seconds
        setTimeout(() => {
           navigate("/login");
        }, 2000);
      } else {
        setError(data.message || "Something went wrong during signup.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Failed to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Visual */}
        <div className="auth-visual-section signup-visual">
          <div className="visual-content">
            <div className="visual-pattern"></div>
            <div className="signup-benefits">
              <h2 className="benefits-title">Join 50,000+ Smart Savers</h2>
              <div className="benefit-list">
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="benefit-content">
                    <h4>Automatic Categorization</h4>
                    <p>AI-powered expense sorting saves you hours</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="benefit-content">
                    <h4>Real-Time Insights</h4>
                    <p>Beautiful charts updated instantly</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="benefit-content">
                    <h4>Smart Budget Alerts</h4>
                    <p>Never overspend with proactive notifications</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="benefit-content">
                    <h4>Bank-Level Security</h4>
                    <p>256-bit encryption keeps your data safe</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="trust-badges">
              <div className="trust-badge">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L3 6V10C3 14.55 6.84 18.74 10 19C13.16 18.74 17 14.55 17 10V6L10 2Z" fill="#10B981" />
                </svg>
                <span>SSL Secured</span>
              </div>
              <div className="trust-badge">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L3 6V10C3 14.55 6.84 18.74 10 19C13.16 18.74 17 14.55 17 10V6L10 2Z" fill="#10B981" />
                </svg>
                <span>GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
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
                                <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" rx="12" fill="url(#expense-logo-bg-auth)" />
                  <path d="M12 28L18 20L22 24L28 14" stroke="url(#expense-logo-line-auth)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="28" cy="14" r="3" fill="#ffffff" />
                  <path d="M12 14L12 28L28 28" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <defs>
                    <linearGradient id="expense-logo-bg-auth" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#4F46E5" />
                      <stop offset="50%" stopColor="#7C3AED" />
                      <stop offset="100%" stopColor="#DB2777" />
                    </linearGradient>
                    <linearGradient id="expense-logo-line-auth" x1="12" y1="28" x2="28" y2="14" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#A78BFA" />
                      <stop offset="100%" stopColor="#FDF4FF" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h1 className="auth-title">Create Your Account</h1>
              <p className="auth-subtitle">Start your journey to financial freedom</p>
            </div>

            <form className="auth-form" id="signupForm" onSubmit={handleSignup}>
              {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px' }}>
                  {error}
                </div>
              )}
              {success && (
                <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px' }}>
                  {success}
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">First Name</label>
                  <input type="text" id="firstName" className="form-input" placeholder="John" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">Last Name</label>
                  <input type="text" id="lastName" className="form-input" placeholder="Doe" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 6L10 11L17 6M4 4H16C16.5523 4 17 4.44772 17 5V15C17 15.5523 16.5523 16 16 16H4C3.44772 16 3 15.5523 3 15V5C3 4.44772 3.44772 4 4 4Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input type="email" id="email" className="form-input" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 10V7C5 4.79086 6.79086 3 9 3H11C13.2091 3 15 4.79086 15 7V10M7 10H13C14.1046 10 15 10.8954 15 12V15C15 16.1046 14.1046 17 13 17H7C5.89543 17 5 16.1046 5 15V12C5 10.8954 5.89543 10 7 10Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input type="password" id="password" className="form-input" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="password-strength">
                  <div className="strength-bar">
                    <div className="strength-fill"></div>
                  </div>
                  <p className="strength-text">Use 8+ characters with mix of letters & numbers</p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="currency" className="form-label">Primary Currency</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="#9CA3AF" strokeWidth="1.5" />
                    <path d="M10 6V14M13 8H9C8.44772 8 8 8.44772 8 9C8 9.55228 8.44772 10 9 10H11C11.5523 10 12 10.4477 12 11C12 11.5523 11.5523 12 11 12H8" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <select id="currency" className="form-input form-select" required value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="INR">₹ INR - Indian Rupee</option>
                    <option value="USD">$ USD - US Dollar</option>
                    <option value="EUR">€ EUR - Euro</option>
                    <option value="GBP">£ GBP - British Pound</option>
                  </select>
                </div>
              </div>

              <label className="checkbox-label agreement">
                <input type="checkbox" className="checkbox-input" required />
                <span className="checkbox-text">
                  I agree to the <a href="#" className="inline-link">Terms of Service</a> and <a href="#" className="inline-link">Privacy Policy</a>
                </span>
              </label>

              <button type="submit" className="btn btn-primary btn-block btn-large" disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
                {!loading && (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </button>

              <div className="divider">
                <span>or sign up with</span>
              </div>

              <div className="social-auth-buttons">
                <button 
                  type="button" 
                  className="btn btn-social"
                  onClick={() => {
                    setLoading(true);
                    window.location.href = `${API_BASE_URL}/auth/google`;
                  }}
                  disabled={loading}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M18.17 8.36H10v3.64h4.58c-.42 2.06-2.12 3.64-4.58 3.64-2.76 0-5-2.24-5-5s2.24-5 5-5c1.26 0 2.4.48 3.28 1.26l2.65-2.65C14.46 2.82 12.34 2 10 2 5.59 2 2 5.59 2 10s3.59 8 8 8c4.42 0 8-3.18 8-8 0-.54-.06-1.06-.17-1.64z" fill="#4285F4" />
                  </svg>
                  Google
                </button>
              </div>

              <p className="auth-footer-text">
                Already have an account?
                <Link to="/login" className="auth-link">Sign in</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
