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
          <Link to="/profile" className="sidebar-link">
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
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = getUser();
        if(!user) return;
        const fetchOpts = { cache: "no-store" as RequestCache };
        const [expenseRes, budgetRes, alertRes] = await Promise.all([
          fetch(`http://localhost:5000/api/expenses?userId=${user.id}`, fetchOpts),
          fetch(`http://localhost:5000/api/budgets?userId=${user.id}`, fetchOpts),
          fetch(`http://localhost:5000/api/alerts?userId=${user.id}`, fetchOpts)
        ]);
        
        if (expenseRes.ok && budgetRes.ok && alertRes.ok) {
          const expenseData = await expenseRes.json();
          const budgetData = await budgetRes.json();
          const alertData = await alertRes.json();
          setExpenses(expenseData);
          setBudgets(budgetData);
          setAlerts(alertData);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // Poll every 30 seconds for dynamic updates after adding expenses
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  // Do NOT clamp to 0 — show real value so over-budget is visible
  const remainingBudget = totalBudget - totalExpenses;
  const utilizationPercent = totalBudget === 0 ? 0 : Math.min(100, (totalExpenses/totalBudget)*100);
  const isOverBudget = remainingBudget < 0;

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

  // Dynamically compute totals per unique category from actual expense data
  const categoryTotals: Record<string, number> = expenses.reduce((acc: Record<string, number>, exp) => {
    const cat = exp.category ? exp.category.toLowerCase() : 'others';
    acc[cat] = (acc[cat] || 0) + Number(exp.amount);
    return acc;
  }, {});

  // Color palette for dynamic categories
  const categoryColors: Record<string, string> = {
    food: '#6366F1',
    shopping: '#8B5CF6',
    travel: '#EC4899',
    bills: '#F59E0B',
    entertainment: '#10B981',
    healthcare: '#3B82F6',
    education: '#F97316',
    others: '#94A3B8'
  };
  const getCategoryColor = (cat: string, idx: number) => {
    const fallbacks = ['#6366F1','#8B5CF6','#EC4899','#F59E0B','#10B981','#3B82F6','#F97316','#94A3B8'];
    return categoryColors[cat] || fallbacks[idx % fallbacks.length];
  };

  // Only include categories that have expenses > 0
  const activeCategories = Object.entries(categoryTotals).filter(([, amt]) => amt > 0);

  const C = 502.65; // Circumference for r=80
  let offsetAccumulator = 0;

  const [tooltipData, setTooltipData] = useState<{show: boolean, name: string, amount: number, x: number, y: number}>({ show: false, name: '', amount: 0, x: 0, y: 0 });

  const getDonutProps = (amount: number, categoryName: string) => {
    if (totalExpenses === 0) return {};
    const val = (amount / totalExpenses) * C;
    const props = {
      strokeDasharray: `${val} ${C}`,
      strokeDashoffset: -offsetAccumulator,
      onMouseEnter: (e: React.MouseEvent) => {
        setTooltipData({
          show: true,
          name: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
          amount,
          x: e.clientX,
          y: e.clientY - 30
        });
      },
      onMouseMove: (e: React.MouseEvent) => {
        setTooltipData(prev => ({
          ...prev,
          x: e.clientX,
          y: e.clientY - 30
        }));
      },
      onMouseLeave: () => setTooltipData(prev => ({ ...prev, show: false }))
    };
    offsetAccumulator += val;
    return props;
  };

  // Pre-compute donut segment props for each active category
  const segmentProps = activeCategories.map(([cat, amt]) => ({
    cat,
    amt,
    color: getCategoryColor(cat, activeCategories.findIndex(([c]) => c === cat)),
    props: getDonutProps(amt, cat)
  }));

  // Dynamic Line Chart (Last 7 Days)
  const last7DaysData = expenses.reduce((acc: number[], exp) => {
    const today = new Date();
    const expDate = new Date(exp.date || exp.createdAt);
    const diffTime = today.getTime() - expDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (diffDays >= 0 && diffDays <= 7) {
      let dayIdx = expDate.getDay() - 1; // Mon=0, Sun=6
      if (dayIdx === -1) dayIdx = 6;
      acc[dayIdx] = (acc[dayIdx] || 0) + exp.amount;
    }
    return acc;
  }, [0, 0, 0, 0, 0, 0, 0]);

  const maxSpending = Math.max(...last7DaysData, 1);
  const getPathData = (data: number[]) => {
    let path = "";
    let areaPath = "";
    for (let i = 0; i < 7; i++) {
       const x = i * 100;
       const y = 200 - (data[i] / maxSpending) * 150;
       if (i === 0) {
           path += `M 0 ${y}`;
           areaPath += `M 0 ${y}`;
       } else {
           const prevX = (i - 1) * 100;
           const prevY = 200 - (data[i - 1] / maxSpending) * 150;
           const cp1X = prevX + 50;
           const cp2X = x - 50;
           path += ` C ${cp1X} ${prevY}, ${cp2X} ${y}, ${x} ${y}`;
           areaPath += ` C ${cp1X} ${prevY}, ${cp2X} ${y}, ${x} ${y}`;
       }
    }
    areaPath += ` L 600 250 L 0 250 Z`;
    return { path, areaPath };
  };

  const { path: linePath, areaPath } = getPathData(last7DaysData);

  if(loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <>
      {tooltipData.show && (
        <div style={{
          position: 'fixed',
          top: tooltipData.y,
          left: tooltipData.x,
          transform: 'translate(-50%, -100%)',
          backgroundColor: '#1f2937',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          pointerEvents: 'none',
          zIndex: 1000,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        }}>
          <div style={{ fontWeight: 600 }}>{tooltipData.name}</div>
          <div>₹{tooltipData.amount}</div>
        </div>
      )}
      {/* Stats Grid */}
      <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className={`stat-icon-wrapper ${isOverBudget ? 'red' : 'blue'}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="stat-label">Total Balance (Remaining)</span>
              </div>
              <p className="stat-value" style={{ color: isOverBudget ? '#ef4444' : undefined }}>
                {isOverBudget ? '-' : ''}₹{Math.abs(remainingBudget).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>

              <div className="stat-footer">
                {isOverBudget ? (
                  <span className="stat-change negative" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 4V12M4 8L8 12L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Over Budget
                  </span>
                ) : (
                  <span className="stat-change positive">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 12V4M4 8L8 4L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Calculated Output
                  </span>
                )}
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
              <p className="stat-value">₹{totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>

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
              <p className="stat-value">₹{totalBudget.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>

              <div className="stat-footer">
                <div className="mini-progress" style={{ flex: 1, marginRight: '8px' }}>
                  <div className="mini-progress-bar" style={{ width: `${utilizationPercent}%` }}></div>
                </div>
                <span className="stat-period">Budget Used: {utilizationPercent.toFixed(0)}%</span>
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
                  <path d={areaPath}
                    fill="url(#area-gradient)" opacity="0.3" />

                  {/* Line */}
                  <path d={linePath}
                    stroke="url(#line-gradient)"
                    strokeWidth="3"
                    fill="none" />

                  {/* Data points */}
                  {last7DaysData.map((amount, i) => (
                    <circle key={i} cx={i * 100} cy={200 - (amount / maxSpending) * 150} r="5" fill="#6366f1" />
                  ))}

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

            <div className="card">
              <div className="card-header-section">
                <div>
                  <h3 className="card-title">Category Distribution</h3>
                  <p className="card-subtitle">All time breakdown</p>
                </div>
              </div>
              <div className="category-chart" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', marginTop: '1rem', marginBottom: '0.5rem' }}>
                {/* Donut chart centred */}
                <div className="donut-chart" style={{ width: '180px', height: '180px', flexShrink: 0 }}>
                  <svg viewBox="0 0 200 200" style={{ overflow: 'visible', width: '100%', height: '100%' }}>
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#EEF2FF" strokeWidth="40" />
                    {totalExpenses > 0 && segmentProps.map(({ cat, color, props }) => (
                      <circle key={cat} cx="100" cy="100" r="80" fill="none" stroke={color} strokeWidth="40"
                        {...props} transform="rotate(-90 100 100)" style={{ transition: 'stroke-dashoffset 0.5s ease', cursor: 'pointer' }} />
                    ))}
                    <text x="100" y="95" textAnchor="middle" fontSize="22" fontWeight="700" fill="#1f2937">₹{totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</text>
                    <text x="100" y="115" textAnchor="middle" fontSize="12" fill="#9ca3af">Total Spent</text>

                  </svg>
                </div>
                {/* Legend below chart — only when expenses exist */}
                {expenses.length > 0 && activeCategories.length > 0 && (
                  <div className="category-legend" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.5rem 1.5rem',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#f9fafb',
                    borderRadius: '0.5rem'
                  }}>
                    {activeCategories.map(([cat, amt], idx) => (
                      <div className="legend-item" key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                        <span className="legend-dot" style={{ background: getCategoryColor(cat, idx), flexShrink: 0 }}></span>
                        <span className="legend-label" style={{ textTransform: 'capitalize', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat}</span>
                        <span className="legend-value" style={{ flexShrink: 0 }}>₹{amt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>

                      </div>
                    ))}
                  </div>
                )}
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
                        <td className="amount">₹{exp.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>

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
                {alerts.length > 0 ? alerts.slice(0, 8).map((alert) => (
                  <div key={alert._id} className={`alert-item ${alert.threshold === 100 || alert.type === 'limit_reached' ? 'danger' : 'warning'}`}>
                    <div className={`alert-icon-circle ${alert.threshold === 100 || alert.type === 'limit_reached' ? 'danger' : 'warning'}`}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 6V10M10 14H10.01M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="alert-content-small">
                      <p className="alert-title-small">{alert.message}</p>
                      <p className="alert-text-small">{new Date(alert.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                )) : (
                  <div style={{textAlign: "center", padding: "1rem", color: "#6B7280"}}>No recent budget alerts.</div>
                )}

              </div>
            </div>
          </div>
    </>
  );
}

export function DashboardTransactions() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const user = getUser();
        if (!user) return;
        const res = await fetch(`http://localhost:5000/api/expenses?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setExpenses(data);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

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

  if (loading) {
    return <div>Loading transactions...</div>;
  }

  return (
    <div className="dashboard-grid-3">
      <div className="card col-span-2">
        <div className="card-header-section">
          <h3 className="card-title">All Transactions</h3>
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
              {expenses.length > 0 ? expenses.map((exp) => (
                <tr key={exp._id}>
                  <td>
                    <div className="transaction-desc">
                      <span className="transaction-emoji">{getEmoji(exp.category)}</span>
                      <span>{exp.description || 'No Description'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`category-badge ${getCategoryTheme(exp.category)}`}>{exp.category}</span>
                  </td>
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
