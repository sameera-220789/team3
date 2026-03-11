import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <nav className="navbar">
        <div className="container nav-container">
          <div className="logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="8" fill="url(#gradient1)" />
              <path d="M20 10L28 20L20 30L12 20L20 10Z" fill="white" opacity="0.9" />
              <defs>
                <linearGradient id="gradient1" x1="0" y1="0" x2="40" y2="40">
                  <stop offset="0%" style={{ stopColor: "#6366f1" }} />
                  <stop offset="100%" style={{ stopColor: "#8b5cf6" }} />
                </linearGradient>
              </defs>
            </svg>
            <span className="logo-text">ExpenseFlow</span>
          </div>
          <ul className="nav-links">
            <li>
              <a href="#features" className="nav-link">
                Features
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="nav-link">
                How It Works
              </a>
            </li>
            <li>
              <a href="#pricing" className="nav-link">
                Pricing
              </a>
            </li>
            <li>
              <Link to="/login" className="nav-link">
                User Login
              </Link>
            </li>
            <li>
              <Link to="/admin-login" className="nav-link">
                Admin Login
              </Link>
            </li>
            <li>
              <Link to="/signup" className="btn btn-primary">
                Get Started
              </Link>
            </li>
          </ul>
          <button className="mobile-menu-btn">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-bg"></div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              <span>Trusted by 50,000+ users worldwide</span>
            </div>
            <h1 className="hero-title">
              Take Control of Your
              <span className="gradient-text">Financial Future</span>
            </h1>
            <p className="hero-description">
              Smart expense tracking meets intelligent budgeting. Get real-time insights, automated alerts, and comprehensive reports to make better financial decisions.
            </p>
            <div className="hero-cta">
              <Link to="/signup" className="btn btn-large btn-primary">
                Start Free Trial
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a href="#how-it-works" className="btn btn-large btn-secondary">
                Watch Demo
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M8 5.5L14 10L8 14.5V5.5Z" fill="currentColor" />
                </svg>
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">₹50M+</span>
                <span className="stat-label">Money Tracked</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">2.5M+</span>
                <span className="stat-label">Transactions</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">98%</span>
                <span className="stat-label">Satisfaction Rate</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="dashboard-preview">
              <div className="preview-card card-1">
                <div className="card-header">
                  <span className="card-icon">💰</span>
                  <span className="card-label">Total Balance</span>
                </div>
                <div className="card-amount">₹45,280</div>
                <div className="card-change positive">+12.5% from last month</div>
              </div>
              <div className="preview-card card-2">
                <div className="card-header">
                  <span className="card-icon">📊</span>
                  <span className="card-label">Monthly Expenses</span>
                </div>
                <div className="mini-chart">
                  <div className="chart-bar" style={{ height: "60%" }}></div>
                  <div className="chart-bar" style={{ height: "80%" }}></div>
                  <div className="chart-bar" style={{ height: "50%" }}></div>
                  <div className="chart-bar" style={{ height: "90%" }}></div>
                  <div className="chart-bar" style={{ height: "70%" }}></div>
                </div>
              </div>
              <div className="preview-card card-3">
                <div className="alert-badge">⚠️ Budget Alert</div>
                <p className="alert-text">You've exceeded your Food budget by ₹500</p>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-gradient-orb orb-1"></div>
        <div className="hero-gradient-orb orb-2"></div>
      </section>

      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">POWERFUL FEATURES</span>
            <h2 className="section-title">Everything You Need to Manage Money</h2>
            <p className="section-description">
              Comprehensive tools designed for modern financial management
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#EEF2FF" />
                  <path d="M16 10V22M10 16H22" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="feature-title">Quick Expense Entry</h3>
              <p className="feature-description">
                Add expenses in seconds with smart categorization and recurring transaction support
              </p>
              <Link to="/add-expense" className="feature-link">
                Learn more →
              </Link>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#F0FDF4" />
                  <circle cx="16" cy="16" r="6" stroke="#10B981" strokeWidth="2.5" />
                  <path d="M16 13V16L18 18" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="feature-title">Smart Budgeting</h3>
              <p className="feature-description">
                Set monthly budgets per category with intelligent tracking and predictive analytics
              </p>
              <Link to="/budget" className="feature-link">
                Learn more →
              </Link>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#FFF7ED" />
                  <path d="M16 10L20 14L16 18M16 14H24M12 22H8" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="feature-title">Real-Time Alerts</h3>
              <p className="feature-description">
                Get instant notifications when you approach or exceed your budget limits
              </p>
              <a href="#" className="feature-link">
                Learn more →
              </a>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#FEF2F2" />
                  <rect x="10" y="10" width="12" height="12" rx="2" stroke="#EF4444" strokeWidth="2.5" />
                  <path d="M14 14L18 18M18 14L14 18" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="feature-title">Visual Analytics</h3>
              <p className="feature-description">
                Beautiful charts and graphs that reveal spending patterns and trends
              </p>
              <Link to="/dashboard" className="feature-link">
                Learn more →
              </Link>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#F5F3FF" />
                  <path d="M12 12H20M12 16H20M12 20H16" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="feature-title">Export Reports</h3>
              <p className="feature-description">
                Download detailed financial reports in PDF or CSV format for tax filing
              </p>
              <a href="#" className="feature-link">
                Learn more →
              </a>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#ECFEFF" />
                  <circle cx="16" cy="12" r="3" stroke="#06B6D4" strokeWidth="2.5" />
                  <path d="M10 24V22C10 19.7909 11.7909 18 14 18H18C20.2091 18 22 19.7909 22 22V24" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="feature-title">Admin Control</h3>
              <p className="feature-description">
                Complete system monitoring with user management and fraud detection
              </p>
              <Link to="/admin" className="feature-link">
                Learn more →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">SIMPLE PROCESS</span>
            <h2 className="section-title">Get Started in 3 Easy Steps</h2>
          </div>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">01</div>
              <div className="step-content">
                <h3 className="step-title">Create Your Account</h3>
                <p className="step-description">
                  Sign up in 30 seconds with email or social login. No credit card required for trial.
                </p>
              </div>
              <div className="step-visual">
                <div className="visual-box">
                  <div className="form-field"></div>
                  <div className="form-field"></div>
                  <div className="form-button"></div>
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">02</div>
              <div className="step-content">
                <h3 className="step-title">Set Your Budget</h3>
                <p className="step-description">
                  Define monthly budgets for different categories like food, travel, and entertainment.
                </p>
              </div>
              <div className="step-visual">
                <div className="visual-box">
                  <div className="budget-bar" style={{ width: "70%" }}></div>
                  <div className="budget-bar" style={{ width: "85%" }}></div>
                  <div className="budget-bar" style={{ width: "50%" }}></div>
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">03</div>
              <div className="step-content">
                <h3 className="step-title">Track & Optimize</h3>
                <p className="step-description">
                  Add expenses daily and watch your financial insights grow with intelligent analytics.
                </p>
              </div>
              <div className="step-visual">
                <div className="visual-box">
                  <div className="chart-visual">
                    <div className="chart-line"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="pricing">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">PRICING PLANS</span>
            <h2 className="section-title">Choose Your Perfect Plan</h2>
            <p className="section-description">
              Transparent pricing with no hidden fees
            </p>
          </div>
          <div className="pricing-cards">
            <div className="pricing-card">
              <div className="plan-header">
                <h3 className="plan-name">Free</h3>
                <div className="plan-price">
                  <span className="price-currency">₹</span>
                  <span className="price-amount">0</span>
                  <span className="price-period">/month</span>
                </div>
                <p className="plan-description">Perfect for getting started</p>
              </div>
              <ul className="plan-features">
                <li className="feature-item">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7 10L9 12L13 8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>Up to 50 transactions/month</span>
                </li>
                <li className="feature-item">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7 10L9 12L13 8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>Basic expense tracking</span>
                </li>
                <li className="feature-item">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7 10L9 12L13 8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>3 budget categories</span>
                </li>
                <li className="feature-item disabled">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7 7L13 13M13 7L7 13" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>Export reports</span>
                </li>
              </ul>
              <Link to="/signup" className="btn btn-outline btn-block">Get Started</Link>
            </div>
            <div className="pricing-card featured">
              <div className="popular-badge">MOST POPULAR</div>
              <div className="plan-header">
                <h3 className="plan-name">Pro</h3>
                <div className="plan-price">
                  <span className="price-currency">₹</span>
                  <span className="price-amount">299</span>
                  <span className="price-period">/month</span>
                </div>
                <p className="plan-description">For serious money managers</p>
              </div>
              <ul className="plan-features">
                <li className="feature-item">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7 10L9 12L13 8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>Unlimited transactions</span>
                </li>
                <li className="feature-item">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7 10L9 12L13 8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>Advanced analytics & charts</span>
                </li>
                <li className="feature-item">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7 10L9 12L13 8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>Unlimited budget categories</span>
                </li>
                <li className="feature-item">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7 10L9 12L13 8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>PDF & CSV exports</span>
                </li>
                <li className="feature-item">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7 10L9 12L13 8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>Priority support</span>
                </li>
              </ul>
              <Link to="/signup" className="btn btn-primary btn-block">Start Free Trial</Link>
            </div>
            <div className="pricing-card">
              <div className="plan-header">
                <h3 className="plan-name">Enterprise</h3>
                <div className="plan-price">
                  <span className="price-amount custom">Custom</span>
                </div>
                <p className="plan-description">For teams and organizations</p>
              </div>
              <ul className="plan-features">
                <li className="feature-item">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7 10L9 12L13 8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>Everything in Pro</span>
                </li>
                <li className="feature-item">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7 10L9 12L13 8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>Multi-user accounts</span>
                </li>
                <li className="feature-item">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7 10L9 12L13 8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>Admin dashboard</span>
                </li>
                <li className="feature-item">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7 10L9 12L13 8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>API access</span>
                </li>
              </ul>
              <a href="#" className="btn btn-outline btn-block">Contact Sales</a>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Take Control?</h2>
            <p className="cta-description">
              Join thousands of users who have transformed their financial lives with ExpenseFlow
            </p>
            <Link to="/signup" className="btn btn-large btn-white">
              Get Started - It's Free
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="logo">
                <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="8" fill="url(#gradient2)" />
                  <path d="M20 10L28 20L20 30L12 20L20 10Z" fill="white" opacity="0.9" />
                  <defs>
                    <linearGradient id="gradient2" x1="0" y1="0" x2="40" y2="40">
                      <stop offset="0%" style={{ stopColor: "#6366f1" }} />
                      <stop offset="100%" style={{ stopColor: "#8b5cf6" }} />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="logo-text">ExpenseFlow</span>
              </div>
              <p className="footer-tagline">
                Making financial management simple and intelligent for everyone.
              </p>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">Product</h4>
              <ul className="footer-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><a href="#">Mobile App</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">Company</h4>
              <ul className="footer-links">
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">Legal</h4>
              <ul className="footer-links">
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 ExpenseFlow. All rights reserved.</p>
            <div className="social-links">
              <a href="#" className="social-link">Twitter</a>
              <a href="#" className="social-link">LinkedIn</a>
              <a href="#" className="social-link">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
