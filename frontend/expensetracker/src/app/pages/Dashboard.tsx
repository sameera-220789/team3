import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getUser } from "../utils/api";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const getPageTitle = () => {
    if (location.pathname.startsWith("/dashboard/transactions")) {
      return "Transactions";
    }
    if (location.pathname.startsWith("/dashboard/reports")) {
      return "Reports";
    }
    return `Welcome back, ${user?.firstName || 'User'}! 👋`;
  };

  const getPageSubtitle = () => {
    if (location.pathname.startsWith("/dashboard/transactions")) {
      return "Review your recent spending activity";
    }
    if (location.pathname.startsWith("/dashboard/reports")) {
      return "High-level summaries and insights";
    }
    return "Here's what's happening with your finances today";
  };

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="8" fill="url(#gradient-sidebar3)" />
              <path d="M20 10L28 20L20 30L12 20L20 10Z" fill="white" opacity="0.9" />
              <defs>
                <linearGradient id="gradient-sidebar3" x1="0" y1="0" x2="40" y2="40">
                  <stop offset="0%" style={{ stopColor: "#6366f1" }} />
                  <stop offset="100%" style={{ stopColor: "#8b5cf6" }} />
                </linearGradient>
              </defs>
            </svg>
            <span className="logo-text">ExpenseFlow</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 7L10 3L17 7V17C17 17.5304 16.7893 18.0391 16.4142 18.4142C16.0391 18.7893 15.5304 19 15 19H5C4.46957 19 3.96086 18.7893 3.58579 18.4142C3.21071 18.0391 3 17.5304 3 17V7Z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Dashboard</span>
          </NavLink>
          <Link to="/add-expense" className="sidebar-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 5V15M5 10H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Add Expense</span>
          </Link>
          <Link to="/budget" className="sidebar-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 6V10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Budgets</span>
          </Link>
          <NavLink
            to="/dashboard/transactions"
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 8H17" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Transactions</span>
          </NavLink>
          <NavLink
            to="/dashboard/reports"
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 4H17V16H3V4Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 8L12 12M12 8L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Reports</span>
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <Link to="/admin" className="sidebar-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 11C12.2091 11 14 9.20914 14 7C14 4.79086 12.2091 3 10 3C7.79086 3 6 4.79086 6 7C6 9.20914 7.79086 11 10 11Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 17V16C3 14.3431 4.34315 13 6 13H14C15.6569 13 17 14.3431 17 16V17" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Profile</span>
          </Link>
          <button className="sidebar-link logout-btn" onClick={() => { localStorage.clear(); navigate('/login'); }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M13 3H15C15.5304 3 16.0391 3.21071 16.4142 3.58579C16.7893 3.96086 17 4.46957 17 5V15C17 15.5304 16.7893 16.0391 16.4142 16.4142C16.0391 16.7893 15.5304 17 15 17H13M7 13L3 10M3 10L7 7M3 10H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="budget-page-header">
          <div className="budget-header-left">
            <h1 className="budget-page-title">{getPageTitle()}</h1>
            <p className="budget-page-subtitle">{getPageSubtitle()}</p>
          </div>
          <div className="budget-header-right">
            <button className="btn btn-secondary">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 3L17 3V13L10 17L3 13V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Export Report
            </button>
            <Link to="/add-expense" className="btn btn-primary">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 5V15M5 10H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Add Expense
            </Link>
            <div className="user-panel">
              <div className="user-avatar">{user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}</div>
              <div className="user-info">
                <p className="user-name">{user?.firstName} {user?.lastName}</p>
                <p className="user-role">Personal Account</p>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export function DashboardOverview() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = getUser();
        if(!user) return;
        const [expenseRes, budgetRes] = await Promise.all([
          fetch(`http://localhost:5000/api/expenses?userId=${user.id}`),
          fetch(`http://localhost:5000/api/budgets?userId=${user.id}`)
        ]);
        
        if (expenseRes.ok && budgetRes.ok) {
          const expenseData = await expenseRes.json();
          const budgetData = await budgetRes.json();
          setExpenses(expenseData);
          setBudgets(budgetData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const remainingBudget = totalBudget - totalExpenses;

  const getEmoji = (category: string) => {
    switch (category) {
      case 'food': return '🍔';
      case 'travel': return '🚕';
      case 'shopping': return '🛍️';
      case 'bills': return '📄';
      case 'entertainment': return '🎬';
      case 'healthcare': return '🏥';
      case 'education': return '📚';
      default: return '💼';
    }
  };

  const getCategoryTheme = (category: string) => {
    switch(category) {
      case 'food': return 'food';
      case 'travel': return 'travel';
      case 'shopping': return 'shopping';
      case 'bills': return 'bills';
      case 'entertainment': return 'entertainment';
      default: return 'other';
    }
  };

  if(loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <>
      {/* Stats Grid */}
      <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-wrapper blue">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="stat-label">Total Balance (Remaining)</span>
              </div>
              <p className="stat-value">₹{remainingBudget}</p>
              <div className="stat-footer">
                <span className="stat-change positive">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 12V4M4 8L8 4L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Calculated Output
                </span>
                <span className="stat-period">from budgets</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-wrapper red">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M16 8L12 4L8 8M12 4V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M3 20H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="stat-label">Total Expenses</span>
              </div>
              <p className="stat-value">₹{totalExpenses}</p>
              <div className="stat-footer">
                <span className="stat-change negative">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 4V12M4 8L8 12L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  All time
                </span>
                <span className="stat-period"></span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-wrapper green">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M19 9L12 3L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <rect x="5" y="9" width="14" height="12" rx="1" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <span className="stat-label">Total Allocated Budgets</span>
              </div>
              <p className="stat-value">₹{totalBudget}</p>
              <div className="stat-footer">
                <div className="mini-progress">
                  <div className="mini-progress-bar" style={{ width: `${Math.min(100, (totalExpenses/totalBudget)*100)}%` }}></div>
                </div>
                <span className="stat-period">Budget Utilization</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-wrapper purple">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="stat-label">Transactions</span>
              </div>
              <p className="stat-value">{expenses.length}</p>
              <div className="stat-footer">
                <span className="stat-change neutral">
                  Total
                </span>
              </div>
            </div>
      </div>

      {/* Charts Section */}
      <div className="dashboard-grid">
        {/* Spending Overview Chart */}
        <div className="card chart-card">
              <div className="card-header-section">
                <div>
                  <h3 className="card-title">Spending Overview</h3>
                  <p className="card-subtitle">Monthly spending trend</p>
                </div>
                <select className="chart-filter">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
              </div>
              <div className="chart-container">
                <svg className="line-chart" viewBox="0 0 600 250">
                  {/* Grid lines */}
                  <line x1="0" y1="50" x2="600" y2="50" stroke="#f3f4f6" strokeWidth="1" />
                  <line x1="0" y1="100" x2="600" y2="100" stroke="#f3f4f6" strokeWidth="1" />
                  <line x1="0" y1="150" x2="600" y2="150" stroke="#f3f4f6" strokeWidth="1" />
                  <line x1="0" y1="200" x2="600" y2="200" stroke="#f3f4f6" strokeWidth="1" />

                  {/* Area fill */}
                  <path d="M 0 180 Q 100 160, 150 140 T 300 100 T 450 120 T 600 80 L 600 250 L 0 250 Z"
                    fill="url(#area-gradient)" opacity="0.3" />

                  {/* Line */}
                  <path d="M 0 180 Q 100 160, 150 140 T 300 100 T 450 120 T 600 80"
                    stroke="url(#line-gradient)"
                    strokeWidth="3"
                    fill="none" />

                  {/* Data points */}
                  <circle cx="0" cy="180" r="5" fill="#6366f1" />
                  <circle cx="150" cy="140" r="5" fill="#6366f1" />
                  <circle cx="300" cy="100" r="5" fill="#6366f1" />
                  <circle cx="450" cy="120" r="5" fill="#6366f1" />
                  <circle cx="600" cy="80" r="5" fill="#6366f1" />

                  <defs>
                    <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" style={{ stopColor: "#6366f1" }} />
                      <stop offset="100%" style={{ stopColor: "#ffffff" }} />
                    </linearGradient>
                    <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{ stopColor: "#6366f1" }} />
                      <stop offset="100%" style={{ stopColor: "#8b5cf6" }} />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="chart-labels">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="card">
              <div className="card-header-section">
                <div>
                  <h3 className="card-title">Category Distribution</h3>
                  <p className="card-subtitle">This month's breakdown</p>
                </div>
              </div>
              <div className="category-chart">
                <div className="donut-chart">
                  <svg viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#EEF2FF" strokeWidth="40" />
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#6366F1" strokeWidth="40"
                      strokeDasharray="251.2 251.2" strokeDashoffset="62.8" transform="rotate(-90 100 100)" />
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#8B5CF6" strokeWidth="40"
                      strokeDasharray="150.72 401.92" strokeDashoffset="-188.4" transform="rotate(-90 100 100)" />
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#EC4899" strokeWidth="40"
                      strokeDasharray="100.48 452.16" strokeDashoffset="-339.12" transform="rotate(-90 100 100)" />
                    <text x="100" y="95" textAnchor="middle" fontSize="24" fontWeight="700" fill="#1f2937">₹32,450</text>
                    <text x="100" y="115" textAnchor="middle" fontSize="12" fill="#9ca3af">Total Spent</text>
                  </svg>
                </div>
                <div className="category-legend">
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: "#6366F1" }}></span>
                    <span className="legend-label">Food</span>
                    <span className="legend-value">₹8,240</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: "#8B5CF6" }}></span>
                    <span className="legend-label">Shopping</span>
                    <span className="legend-value">₹10,840</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: "#EC4899" }}></span>
                    <span className="legend-label">Travel</span>
                    <span className="legend-value">₹5,670</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: "#F59E0B" }}></span>
                    <span className="legend-label">Others</span>
                    <span className="legend-value">₹7,700</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions & Budget Alerts */}
          <div className="dashboard-grid-3">
            <div className="card col-span-2">
              <div className="card-header-section">
                <h3 className="card-title">Recent Transactions</h3>
                <Link to="/dashboard/transactions" className="view-all-link">View all</Link>
              </div>
              <div className="transactions-table">
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Payment</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.length > 0 ? expenses.slice(0, 5).map((exp) => (
                      <tr key={exp._id}>
                        <td>
                          <div className="transaction-desc">
                            <span className="transaction-emoji">{getEmoji(exp.category)}</span>
                            <span>{exp.description || 'No Description'}</span>
                          </div>
                        </td>
                        <td><span className={`category-badge ${getCategoryTheme(exp.category)}`}>{exp.category}</span></td>
                        <td>{new Date(exp.date || exp.createdAt).toLocaleDateString()}</td>
                        <td>{exp.paymentMethod || 'Cash'}</td>
                        <td className="amount">₹{exp.amount}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} style={{textAlign: "center"}}>No expenses recorded yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-header-section">
                <h3 className="card-title">Budget Alerts</h3>
              </div>
              <div className="alerts-list">
                <div className="alert-item danger">
                  <div className="alert-icon-circle danger">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 6V10M10 14H10.01M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="alert-content-small">
                    <p className="alert-title-small">Bills Budget Exceeded</p>
                    <p className="alert-text-small">₹200 over limit</p>
                  </div>
                </div>
                <div className="alert-item warning">
                  <div className="alert-icon-circle warning">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 6V10M10 14H10.01M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="alert-content-small">
                    <p className="alert-title-small">Shopping Near Limit</p>
                    <p className="alert-text-small">90% of budget used</p>
                  </div>
                </div>
                <div className="alert-item success">
                  <div className="alert-icon-circle success">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M6 10L9 13L14 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="alert-content-small">
                    <p className="alert-title-small">Food Budget On Track</p>
                    <p className="alert-text-small">82% used with 15 days left</p>
                  </div>
                </div>
                <div className="alert-item info">
                  <div className="alert-icon-circle info">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 11V15M10 7H10.01M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="alert-content-small">
                    <p className="alert-title-small">Recurring Bill Due</p>
                    <p className="alert-text-small">Netflix - Mar 15</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
    </>
  );
}

export function DashboardTransactions() {
  return (
    <div className="dashboard-grid-3">
      <div className="card col-span-2">
        <div className="card-header-section">
          <h3 className="card-title">Recent Transactions</h3>
          <a href="#" className="view-all-link">
            View all
          </a>
        </div>
        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="transaction-desc">
                    <span className="transaction-emoji">🍔</span>
                    <span>Dinner at Olive Garden</span>
                  </div>
                </td>
                <td>
                  <span className="category-badge food">Food</span>
                </td>
                <td>Mar 9, 2026</td>
                <td>Credit Card</td>
                <td className="amount">₹850</td>
              </tr>
              <tr>
                <td>
                  <div className="transaction-desc">
                    <span className="transaction-emoji">🚕</span>
                    <span>Uber to Airport</span>
                  </div>
                </td>
                <td>
                  <span className="category-badge travel">Travel</span>
                </td>
                <td>Mar 8, 2026</td>
                <td>UPI</td>
                <td className="amount">₹420</td>
              </tr>
              <tr>
                <td>
                  <div className="transaction-desc">
                    <span className="transaction-emoji">🛍️</span>
                    <span>Amazon Shopping</span>
                  </div>
                </td>
                <td>
                  <span className="category-badge shopping">Shopping</span>
                </td>
                <td>Mar 8, 2026</td>
                <td>Debit Card</td>
                <td className="amount">₹2,340</td>
              </tr>
              <tr>
                <td>
                  <div className="transaction-desc">
                    <span className="transaction-emoji">📄</span>
                    <span>Electricity Bill</span>
                  </div>
                </td>
                <td>
                  <span className="category-badge bills">Bills</span>
                </td>
                <td>Mar 7, 2026</td>
                <td>Net Banking</td>
                <td className="amount">₹1,890</td>
              </tr>
              <tr>
                <td>
                  <div className="transaction-desc">
                    <span className="transaction-emoji">🎬</span>
                    <span>Movie Tickets</span>
                  </div>
                </td>
                <td>
                  <span className="category-badge entertainment">Entertainment</span>
                </td>
                <td>Mar 6, 2026</td>
                <td>UPI</td>
                <td className="amount">₹600</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function DashboardReports() {
  return (
    <div className="dashboard-grid-3">
      <div className="card">
        <div className="card-header-section">
          <h3 className="card-title">Budget Alerts</h3>
        </div>
        <div className="alerts-list">
          <div className="alert-item danger">
            <div className="alert-icon-circle danger">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 6V10M10 14H10.01M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="alert-content-small">
              <p className="alert-title-small">Bills Budget Exceeded</p>
              <p className="alert-text-small">₹200 over limit</p>
            </div>
          </div>
          <div className="alert-item warning">
            <div className="alert-icon-circle warning">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 6V10M10 14H10.01M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="alert-content-small">
              <p className="alert-title-small">Shopping Near Limit</p>
              <p className="alert-text-small">90% of budget used</p>
            </div>
          </div>
          <div className="alert-item success">
            <div className="alert-icon-circle success">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M6 10L9 13L14 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="alert-content-small">
              <p className="alert-title-small">Food Budget On Track</p>
              <p className="alert-text-small">
                82% used with 15 days left
              </p>
            </div>
          </div>
          <div className="alert-item info">
            <div className="alert-icon-circle info">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 11V15M10 7H10.01M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="alert-content-small">
              <p className="alert-title-small">Recurring Bill Due</p>
              <p className="alert-text-small">Netflix - Mar 15</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
