import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { getUser } from "../utils/api";
import { ThemeToggle } from "../components/ThemeToggle";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line
} from 'recharts';
import { API_BASE_URL } from "../utils/config";
import { SpendingCalendar } from "../components/SpendingCalendar";
import { getEmoji } from "../utils/formatters";
import { FinancialHealthScore } from "../components/FinancialHealthScore";

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

const getCategoryTheme = (category: string) => {
  switch(category?.toLowerCase()) {
    case 'food': return 'food';
    case 'travel': return 'travel';
    case 'shopping': return 'shopping';
    case 'bills': return 'bills';
    case 'entertainment': return 'entertainment';
    default: return 'other';
  }
};

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return localStorage.getItem("selectedMonth") || new Date().toISOString().slice(0, 7);
  });
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const navigateMonth = (direction: number) => {
    const date = new Date(`${selectedMonth}-01`);
    date.setMonth(date.getMonth() + direction);
    const newMonth = date.toISOString().slice(0, 7);
    setSelectedMonth(newMonth);
    localStorage.setItem("selectedMonth", newMonth);
  };

  const setPresentMonth = () => {
    const newMonth = new Date().toISOString().slice(0, 7);
    setSelectedMonth(newMonth);
    localStorage.setItem("selectedMonth", newMonth);
  };
  
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
          <Link to="/goals" className="sidebar-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
               <path d="M12 20L18 12C18 12 21 8.5 21 6.5C21 4.01472 18.9853 2 16.5 2C14.7317 2 13.1979 3.01831 12.5 4.54275C11.8021 3.01831 10.2683 2 8.5 2C6.01472 2 4 4.01472 4 6.5C4 8.5 7 12 7 12L12 20ZM12 20V22M8 22H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Goals & Reminders</span>
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
          <button className="sidebar-link logout-btn" onClick={() => { localStorage.clear(); window.location.href = "/login"; }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
              <button 
                onClick={() => navigateMonth(-1)}
                className="month-nav-btn"
                style={{ height: '24px', padding: '0 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', background: 'var(--color-gray-100)', border: '1px solid var(--color-gray-200)', cursor: 'pointer', fontSize: '11px', fontWeight: 500, color: 'var(--color-gray-700)' }}
              >
                Prev
              </button>
              <button 
                onClick={setPresentMonth}
                className="month-nav-btn"
                style={{ height: '24px', padding: '0 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', background: 'var(--color-primary-light)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
              >
                Today
              </button>
              <button 
                onClick={() => navigateMonth(1)}
                className="month-nav-btn"
                style={{ height: '24px', padding: '0 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', background: 'var(--color-gray-100)', border: '1px solid var(--color-gray-200)', cursor: 'pointer', fontSize: '11px', fontWeight: 500, color: 'var(--color-gray-700)' }}
              >
                Next
              </button>
              <span style={{ marginLeft: '8px', fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.9rem', minWidth: '90px' }}>
                {new Date(`${selectedMonth}-01`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
          <div className="budget-header-right">
            <button 
              className="icon-btn" 
              onClick={() => setShowCalendar(true)}
              style={{ padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-gray-100)', border: '1px solid var(--color-gray-200)' }}
              title="View Spending Calendar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </button>
            <ThemeToggle />
            <div style={{ position: 'relative' }}>
              <button className="btn btn-secondary btn-small" onClick={() => setShowExportMenu(!showExportMenu)} style={{ height: '36px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export
              </button>
              {showExportMenu && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                  backgroundColor: 'var(--color-popover)', borderRadius: '8px', boxShadow: 'var(--shadow-lg)',
                  zIndex: 100, padding: '4px', minWidth: '140px', border: '1px solid var(--color-border)', overflow: 'hidden'
                }}>
                  <button 
                    style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: 'var(--color-popover-foreground)' }}
                    onClick={() => {
                       window.open(`${API_BASE_URL}/api/reports/download/pdf?userId=${user.id}&month=${selectedMonth}`, '_blank');
                       setShowExportMenu(false);
                    }}
                  >
                    Download PDF
                  </button>
                  <button 
                    style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: 'var(--color-popover-foreground)' }}
                    onClick={() => {
                        window.open(`${API_BASE_URL}/api/reports/download/csv?userId=${user.id}&month=${selectedMonth}`, '_blank');
                        setShowExportMenu(false);
                    }}
                  >
                    Download CSV
                  </button>
                </div>
              )}
            </div>
            <Link to="/add-expense" className="btn btn-primary btn-small" style={{ height: '36px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Expense
            </Link>
            <div className="user-panel" style={{ height: '36px', padding: '0 8px' }}>
              <div className="user-avatar" style={{ width: '28px', height: '28px', fontSize: '11px' }}>{user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}</div>
              <div className="user-info" style={{ gap: 0 }}>
                <p className="user-name" style={{ fontSize: '12px' }}>{user?.firstName}</p>
                <p className="user-role" style={{ fontSize: '10px' }}>Account</p>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet context={{ selectedMonth }} />
        </div>
        {showCalendar && (
          <SpendingCalendar 
            initialMonth={selectedMonth} 
            onClose={() => setShowCalendar(false)} 
          />
        )}
      </main>
    </div>
  );
}

export function DashboardOverview() {
  const { selectedMonth } = useOutletContext<{ selectedMonth: string }>();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTotalBudget, setEditingTotalBudget] = useState(false);
  const [newTotalBudgetValue, setNewTotalBudgetValue] = useState("");
  const [chartRange, setChartRange] = useState("7");
  const [chartExpenses, setChartExpenses] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [healthScore, setHealthScore] = useState<any>(null);

  const totalExpenses = expenses.filter(e => e.type !== 'income').reduce((sum, exp) => sum + exp.amount, 0);
  const totalBudgetDoc = budgets.find(b => b.category === 'total');
  const totalBudgetLimit = totalBudgetDoc ? totalBudgetDoc.limit : 0;
  const totalCategoryBudget = budgets.filter(b => b.category !== 'total').reduce((sum, b) => sum + b.limit, 0);

  // Remaining Budget = Overall Total Budget - Total Spent
  const remainingBudget = totalBudgetLimit - totalExpenses;
  const unallocatedBudget = totalBudgetLimit - totalCategoryBudget;
  const utilizationPercent = totalBudgetLimit === 0 ? 0 : Math.min(100, (totalCategoryBudget / totalBudgetLimit) * 100);
  const isOverBudget = remainingBudget < 0;

  const fetchDashboardData = async () => {
    try {
      const user = getUser();
      if(!user) return;
      const fetchOpts = { cache: "no-store" as RequestCache };
      const [expenseRes, budgetRes, alertRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/expenses?userId=${user.id}&month=${selectedMonth}`, fetchOpts),
        fetch(`${API_BASE_URL}/api/budgets?userId=${user.id}&month=${selectedMonth}`, fetchOpts),
        fetch(`${API_BASE_URL}/api/alerts?userId=${user.id}`, fetchOpts)
      ]);
      
      if (expenseRes.ok && budgetRes.ok && alertRes.ok) {
        const expenseData = await expenseRes.json();
        const budgetData = await budgetRes.json();
        const alertData = await alertRes.json();
        setExpenses(expenseData);
        setBudgets(budgetData);
        setAlerts(alertData);

        // Fetch user total savings
        const userRes = await fetch(`${API_BASE_URL}/api/auth/profile?userId=${user.id}`);
        if (userRes.ok) {
           const userData = await userRes.json();
           setTotalSavings(userData.totalSavings || 0);
        }

        // Fetch Spending Insights
        const insightsRes = await fetch(`${API_BASE_URL}/api/reports/spending-insights?userId=${user.id}`);
        if (insightsRes.ok) {
          const insightsData = await insightsRes.json();
          setInsights(insightsData);
        }

        // Fetch Financial Health Score
        const healthRes = await fetch(`${API_BASE_URL}/api/financial-health-score?userId=${user.id}&month=${selectedMonth}`);
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          setHealthScore(healthData);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Poll every 30 seconds for dynamic updates after adding expenses
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [selectedMonth]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const user = getUser();
        if(!user) return;
        const res = await fetch(`${API_BASE_URL}/api/expenses?userId=${user.id}&range=${chartRange}`, { cache: "no-store" as RequestCache });
        if (res.ok) setChartExpenses(await res.json());
      } catch (err) {
        console.error("Error fetching chart data:", err);
      }
    };
    
    fetchChartData();
    const interval = setInterval(fetchChartData, 30000);
    return () => clearInterval(interval);
  }, [chartRange]);

  const handleSaveTotalBudget = async () => {
    const numericValue = Number(newTotalBudgetValue.replace(/,/g, ""));
    if (!Number.isFinite(numericValue) || numericValue < 0) {
      setEditingTotalBudget(false);
      return;
    }

    try {
      const user = getUser();
      if (!user) return;
      
      const response = await fetch(`${API_BASE_URL}/api/budgets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, category: 'total', limit: numericValue })
      });
      
      if (response.ok) {
        setEditingTotalBudget(false);
        fetchDashboardData(); // Refresh to get the new total budget
      } else {
        alert("Failed to save total budget");
      }
    } catch (e) {
      console.error(e);
      alert("Network error updating total budget");
    }
  };





  // Dynamically compute totals per unique category from actual expense data
  const categoryTotals: Record<string, number> = expenses.filter(e => e.type !== 'income').reduce((acc: Record<string, number>, exp) => {
    const cat = exp.category ? exp.category.toLowerCase() : 'others';
    acc[cat] = (acc[cat] || 0) + Number(exp.amount);
    return acc;
  }, {});



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

  // Dynamic Line Chart (7 / 30 / 90 Days)
  const days = parseInt(chartRange, 10);
  const chartData = React.useMemo(() => {
    const data = new Array(days).fill(0);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    chartExpenses.filter(e => e.type !== 'income').forEach(exp => {
      const expDate = new Date(exp.date || exp.createdAt);
      const diffTime = today.getTime() - expDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays < days) {
        const idx = days - 1 - diffDays;
        data[idx] += exp.amount;
      }
    });
    return data;
  }, [chartExpenses, chartRange]);

  const maxSpending = Math.max(...chartData, 1);
  const getPathData = (data: number[]) => {
    if (data.length === 0) return { path: "", areaPath: "" };
    if (data.length === 1) return { path: `M 0 ${200 - (data[0]/maxSpending)*150}`, areaPath: "" };
    
    let path = "";
    let areaPath = "";
    const stepX = 600 / (data.length - 1);
    
    for (let i = 0; i < data.length; i++) {
       const x = i * stepX;
       const y = 200 - (data[i] / maxSpending) * 150;
       if (i === 0) {
           path += `M 0 ${y}`;
           areaPath += `M 0 ${y}`;
       } else {
           const prevX = (i - 1) * stepX;
           const prevY = 200 - (data[i - 1] / maxSpending) * 150;
           const cp1X = prevX + stepX / 2;
           const cp2X = x - stepX / 2;
           path += ` C ${cp1X} ${prevY}, ${cp2X} ${y}, ${x} ${y}`;
           areaPath += ` C ${cp1X} ${prevY}, ${cp2X} ${y}, ${x} ${y}`;
       }
    }
    areaPath += ` L 600 250 L 0 250 Z`;
    return { path, areaPath };
  };

  const { path: linePath, areaPath } = getPathData(chartData);

  const chartLabels = React.useMemo(() => {
    const labels = [];
    const today = new Date();
    const numLabels = 7;
    for (let i = 0; i < numLabels; i++) {
      const d = new Date(today);
      const daysAgo = (days - 1) - Math.round(i * ((days - 1) / (numLabels - 1)));
      d.setDate(today.getDate() - daysAgo);
      if (days === 7) {
        labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      } else {
        labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }
    }
    return labels;
  }, [chartRange]);

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
      <div className="dashboard-stats-grid">
            {/* Total Budget Card (New) */}
            <div className="stat-card full-width" style={totalBudgetLimit === 0 ? { border: '2px dashed var(--color-primary)', background: 'var(--color-primary-light)', opacity: 0.8 } : {}}>
              <div className="stat-header">
                <div className="stat-icon-wrapper" style={{background: totalBudgetLimit === 0 ? '#6366f1' : '#EEF2FF', color: totalBudgetLimit === 0 ? 'white' : '#6366F1'}}>
                  <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                    <path d="M16 10V22M20 14H14C13.4696 14 12.9609 14.2107 12.5858 14.5858C12.2107 14.9609 12 15.4696 12 16C12 16.5304 12.2107 17.0391 12.5858 17.4142C12.9609 17.7893 13.4696 18 14 18H18C18.5304 18 19.0391 18.2107 19.4142 18.5858C19.7893 18.9609 20 19.4696 20 20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
                  <span className="stat-label" style={totalBudgetLimit === 0 ? { color: '#4f46e5', fontWeight: 600, fontSize: '1rem' } : { fontSize: '1.1rem', fontWeight: 600 }}>Overall Total Budget</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {totalBudgetLimit > 0 && (
                      <button 
                        onClick={() => {
                          setEditingTotalBudget(true);
                          setNewTotalBudgetValue(totalBudgetLimit.toString());
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', padding: '4px' }}
                        title="Edit Total Budget"
                      >
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                          <path d="M14 3L17 6L7 16H4V13L14 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {editingTotalBudget ? (
                <div style={{ display: 'flex', gap: '8px', margin: '14px 0' }}>
                  <input
                    type="number"
                    min="0"
                    value={newTotalBudgetValue}
                    onChange={(e) => setNewTotalBudgetValue(e.target.value)}
                    onBlur={handleSaveTotalBudget}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTotalBudget();
                      if (e.key === 'Escape') setEditingTotalBudget(false);
                    }}
                    autoFocus
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--color-gray-200)', background: 'var(--color-gray-50)', color: 'var(--color-gray-900)', fontSize: '1.5rem', fontWeight: 700 }}
                    placeholder="Enter limit"
                  />
                  <button onClick={handleSaveTotalBudget} style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '4px', padding: '0 16px', cursor: 'pointer', fontWeight: 600 }}>
                    Save
                  </button>
                </div>
              ) : totalBudgetLimit === 0 ? (
                <div style={{ padding: '0.75rem 0', textAlign: 'center' }}>
                  <p style={{ color: '#4f46e5', fontSize: '1rem', marginBottom: '1rem' }}>You haven't set a budget yet!</p>
                  <button 
                    onClick={() => {
                      setEditingTotalBudget(true);
                      setNewTotalBudgetValue("");
                    }}
                    style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '0.375rem', padding: '0.75rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
                  >
                    Set Monthly Budget
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem' }}>
                  <p className="stat-value" style={{ fontSize: '2rem', marginBottom: 0 }}>
                    ₹{totalBudgetLimit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </p>
                  <div className="stat-footer" style={{ flex: '0 1 200px' }}>
                    <div className="mini-progress" style={{ flex: 1, marginRight: '8px' }}>
                      <div className="mini-progress-bar" style={{ width: `${utilizationPercent}%`, background: isOverBudget ? '#ef4444' : '#6366f1' }}></div>
                    </div>
                    <span className="stat-period" style={{ color: isOverBudget ? '#ef4444' : undefined }}>{utilizationPercent.toFixed(0)}% allocated</span>
                  </div>
                </div>
              )}
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-wrapper red">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M16 8L12 4L8 8M12 4V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M3 20H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="stat-label">Total Spent</span>
              </div>
              <p className="stat-value">₹{totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>

              <div className="stat-footer">
                <span className="stat-change negative">
                  Actual spending
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className={`stat-icon-wrapper ${isOverBudget ? 'red' : 'blue'}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="stat-label">Remaining Budget</span>
              </div>
              <p className="stat-value" style={{ color: isOverBudget ? '#ef4444' : undefined }}>
                ₹{remainingBudget.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>

              <div className="stat-footer">
                <span className="stat-period">Available to spend</span>
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
                <span className="stat-label">Budget Usage</span>
              </div>
              <p className="stat-value">{((totalExpenses / (totalBudgetLimit || 1)) * 100).toFixed(1)}%</p>
              <div className="stat-footer">
                <div className="mini-progress" style={{ flex: 1, height: '4px', background: 'var(--color-gray-200)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div className="mini-progress-bar" style={{ width: `${Math.min(100, (totalExpenses / (totalBudgetLimit || 1)) * 100)}%`, background: '#818cf8', height: '100%' }}></div>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-wrapper green">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 1L12 23M17 5H12.5C11.6716 5 11 5.67157 11 6.5C11 7.32843 11.6716 8 12.5 8H14.5C15.3284 8 16 8.67157 16 9.5C16 10.3284 15.3284 11 14.5 11H11.5C10.6716 11 10 10.3284 10 9.5V8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <rect x="2" y="2" width="20" height="20" rx="10" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <span className="stat-label">Total Savings</span>
              </div>
              <p className="stat-value">₹{totalSavings.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              <div className="stat-footer">
                <span className="stat-period">Accumulated leftover budget</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className={`stat-icon-wrapper ${unallocatedBudget < 0 ? 'red' : 'green'}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M19 9L12 3L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <rect x="5" y="9" width="14" height="12" rx="1" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <span className="stat-label">Unallocated Budget</span>
              </div>

              <p className="stat-value" style={{ color: unallocatedBudget < 0 ? '#ef4444' : undefined }}>
                {unallocatedBudget < 0 ? '-' : ''}₹{Math.abs(unallocatedBudget).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>

              <div className="stat-footer">
                <span className="stat-period" style={{ color: unallocatedBudget < 0 ? '#ef4444' : undefined }}>
                  ₹{totalCategoryBudget.toLocaleString('en-IN')} allocated to categories
                </span>
              </div>
            </div>
      </div>

      {/* Charts Section - Restructured for 3-column layout */}
      <div className="dashboard-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        {/* Spending Overview Chart */}
        <div className="card chart-card">
          <div className="card-header-section" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h3 className="card-title">Spending Overview</h3>
              <p className="card-subtitle">Spending trend</p>
            </div>
            <select className="chart-filter" value={chartRange} onChange={(e) => setChartRange(e.target.value)}>
              <option value="7">Last 7d</option>
              <option value="30">Last 30d</option>
              <option value="90">Last 90d</option>
            </select>
          </div>
          <div className="chart-container" style={{ marginTop: '0.5rem' }}>
            <svg className="line-chart" viewBox="0 0 600 250" style={{ height: '180px' }}>
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
              <path d={areaPath} fill="url(#area-gradient)" opacity="0.3" />
              <path d={linePath} stroke="url(#line-gradient)" strokeWidth="3" fill="none" />
              {chartData.length <= 31 && chartData.map((amount, i) => (
                <circle key={i} cx={i * (600/(chartData.length -1 || 1))} cy={200 - (amount / maxSpending) * 150} r={chartData.length <= 7 ? "5" : "3"} fill="#6366f1" />
              ))}
            </svg>
            <div className="chart-labels" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
              {chartLabels.slice(0, 3).map((lbl, idx) => <span key={idx}>{lbl}</span>)}
              {chartLabels.slice(-1).map((lbl, idx) => <span key={idx}>{lbl}</span>)}
            </div>
          </div>
        </div>

        {/* Financial Health Score (1/3 width) */}
        {healthScore && (
          <div className="card" style={{ padding: 0, border: 'none', background: 'transparent' }}>
            <FinancialHealthScore 
              score={healthScore.score} 
              details={healthScore.details} 
              insight={healthScore.insight} 
            />
          </div>
        )}

        {/* Category Distribution (1/3 width) */}
        <div className="card chart-card">
          <div className="card-header-section" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h3 className="card-title">Category Distribution</h3>
              <p className="card-subtitle">Monthly breakdown</p>
            </div>
          </div>
          <div className="category-chart" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div className="donut-chart" style={{ width: '160px', height: '160px', flexShrink: 0, position: 'relative' }}>
              <svg viewBox="0 0 200 200" style={{ overflow: 'visible', width: '100%', height: '100%' }}>
                <circle cx="100" cy="100" r="80" fill="none" stroke="var(--color-gray-100)" strokeWidth="36" />
                {totalExpenses > 0 && segmentProps.map(({ cat, color, props }) => (
                  <circle key={cat} cx="100" cy="100" r="80" fill="none" stroke={color} strokeWidth="36"
                    {...props} transform="rotate(-90 100 100)" style={{ transition: 'stroke-dashoffset 0.5s ease', cursor: 'pointer' }} />
                ))}
                <text x="100" y="98" textAnchor="middle" fontSize="24" fontWeight="800" fill="var(--color-gray-900)">₹{(totalExpenses/1000).toFixed(1)}k</text>
                <text x="100" y="118" textAnchor="middle" fontSize="12" fontWeight="500" fill="var(--color-gray-500)">Total Spent</text>
              </svg>
            </div>
            
            {expenses.length > 0 && activeCategories.length > 0 && (
              <div className="category-legend" style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '0.4rem',
                width: '100%',
                padding: '0.6rem 0.8rem',
                background: 'rgba(249, 250, 251, 0.5)',
                borderRadius: '0.75rem',
                border: '1px solid var(--color-gray-100)',
                maxHeight: '120px',
                overflowY: 'auto'
              }}>
                {activeCategories.slice(0, 4).map(([cat, amt], idx) => (
                  <div className="legend-item" key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="legend-dot" style={{ width: '10px', height: '10px', borderRadius: '50%', background: getCategoryColor(cat, idx), flexShrink: 0 }}></span>
                    <span className="legend-label" style={{ textTransform: 'capitalize', flex: 1, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-gray-700)' }}>{cat}</span>
                    <span className="legend-value" style={{ flexShrink: 0, fontSize: '0.85rem', color: 'var(--color-gray-900)', fontWeight: 600 }}>₹{amt > 999 ? (amt/1000).toFixed(1) + 'k' : amt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Highlights: Insights & Alerts Side by Side */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header-section">
            <h3 className="card-title">Spending Insights</h3>
          </div>
          <div className="insights-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {insights.length > 0 ? (
              insights.slice(0, 5).map((insight, idx) => (
                <div key={idx} className={`insight-item ${insight.type}`} style={{ 
                  padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--color-gray-200)', 
                  background: 'var(--color-gray-50)', position: 'relative', overflow: 'hidden'
                }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: insight.type === 'warning' ? '#ef4444' : '#6366f1' }}></div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-gray-900)' }}>{insight.message}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-gray-600)', marginTop: '4px' }}>{insight.suggestion}</p>
                </div>
              ))
            ) : (
              <div style={{textAlign: "center", padding: "1rem", color: "#6B7280"}}>Calculating insights...</div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header-section">
            <h3 className="card-title">Budget Alerts</h3>
          </div>
          <div className="alerts-list">
            {alerts.length > 0 ? alerts.slice(0, 5).map((alert) => (
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

      <div style={{ height: '1.5rem' }}></div>

      {/* Recent Transactions Section */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
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
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{exp.description || 'No Description'}</span>
                        {exp.type === 'income' && <span style={{fontSize: '10px', color: 'var(--color-success)', fontWeight: 'bold'}}>INCOME</span>}
                      </div>
                    </div>
                  </td>
                  <td><span className={`category-badge ${getCategoryTheme(exp.category)}`}>{exp.category}</span></td>
                  <td>{new Date(exp.date || exp.createdAt).toLocaleDateString()}</td>
                  <td>{exp.paymentMethod || 'Cash'}</td>
                  <td className="amount" style={{ color: exp.type === 'income' ? 'var(--color-success)' : 'inherit' }}>
                    {exp.type === 'income' ? '+' : ''}₹{exp.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} style={{textAlign: "center"}}>No expenses recorded yet.</td></tr>
              )}
            </tbody>
          </table>
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
        const res = await fetch(`${API_BASE_URL}/api/expenses?userId=${user.id}`);
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
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{exp.description || 'No Description'}</span>
                        {exp.type === 'income' && <span style={{fontSize: '10px', color: 'var(--color-success)', fontWeight: 'bold'}}>INCOME</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`category-badge ${getCategoryTheme(exp.category)}`}>{exp.category}</span>
                  </td>
                  <td>{new Date(exp.date || exp.createdAt).toLocaleDateString()}</td>
                  <td>{exp.paymentMethod || 'Cash'}</td>
                  <td className="amount" style={{ color: exp.type === 'income' ? 'var(--color-success)' : 'inherit' }}>
                    {exp.type === 'income' ? '+' : ''}₹{exp.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
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
  const { selectedMonth } = useOutletContext<{ selectedMonth: string }>();
  const [reportData, setReportData] = useState<any>(null);
  const [healthScore, setHealthScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/reports/monthly?userId=${user.id}&month=${selectedMonth}`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }

      // Fetch Financial Health Score
      const healthRes = await fetch(`${API_BASE_URL}/api/financial-health-score?userId=${user.id}&month=${selectedMonth}`);
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHealthScore(healthData);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchReportData();
  }, [selectedMonth]);

  const handleDownload = (type: 'pdf' | 'csv') => {
    window.open(`${API_BASE_URL}/api/reports/download/${type}?userId=${user.id}&month=${selectedMonth}`, '_blank');
  };

  if (loading) return <div className="loading-container">Loading Reports...</div>;
  if (!reportData) return <div>No data available for this month.</div>;

  const pieData = Object.entries(reportData.categoryBreakdown).map(([name, value]) => ({ name, value }));
  const barData = Object.entries(reportData.dailySummary).map(([day, amount]) => ({ day: `Day ${day}`, amount })).sort((a, b) => parseInt(a.day.split(' ')[1]) - parseInt(b.day.split(' ')[1]));

  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#F97316'];

  return (
    <div className="reports-section">
      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper red">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M16 8L12 4L8 8M12 4V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M3 20H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <span className="stat-label">Total Expenses</span>
          </div>
          <p className="stat-value">₹{reportData.totalExpenses.toLocaleString('en-IN')}</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M3 9H21M9 21V9" stroke="currentColor" strokeWidth="2" /></svg>
            </div>
            <span className="stat-label">Total Budget</span>
          </div>
          <p className="stat-value">₹{reportData.totalBudget.toLocaleString('en-IN')}</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className={`stat-icon-wrapper ${reportData.remainingBudget < 0 ? 'red' : 'green'}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" /></svg>
            </div>
            <span className="stat-label">Remaining Budget</span>
          </div>
          <p className="stat-value" style={{ color: reportData.remainingBudget < 0 ? '#ef4444' : '#10b981' }}>₹{reportData.remainingBudget.toLocaleString('en-IN')}</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" /><path d="M12 6V18M12 6L8 10M12 6L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <span className="stat-label">Total Income</span>
          </div>
          <p className="stat-value" style={{ color: 'var(--color-success)' }}>₹{(reportData.totalIncome || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {healthScore && (
        <div style={{ marginBottom: '24px' }}>
          <FinancialHealthScore 
            score={healthScore.score} 
            details={healthScore.details} 
            insight={healthScore.insight} 
          />
        </div>
      )}

      <div className="dashboard-grid">
        {/* Category breakdown Chart */}
        <div className="card">
          <div className="card-header-section">
            <h3 className="card-title">Category Breakdown</h3>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Spending Trend Chart */}
        <div className="card">
          <div className="card-header-section">
            <h3 className="card-title">Daily Spending Trend</h3>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="amount" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header-section">
          <h3 className="card-title">Detailed Expenses</h3>
        </div>
        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {reportData.expenses.map((exp: any) => (
                <tr key={exp._id}>
                  <td>{new Date(exp.date).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <span>{exp.description || 'N/A'}</span>
                       {exp.type === 'income' && <span style={{fontSize: '10px', color: 'var(--color-success)', fontWeight: 'bold'}}>INCOME</span>}
                    </div>
                  </td>
                  <td><span className={`category-badge ${getCategoryTheme(exp.category)}`}>{exp.category}</span></td>
                  <td className="amount" style={{ color: exp.type === 'income' ? 'var(--color-success)' : 'inherit' }}>
                    {exp.type === 'income' ? '+' : ''}₹{exp.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '32px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button onClick={() => handleDownload('pdf')} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download PDF
        </button>
        <button onClick={() => handleDownload('csv')} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download CSV
        </button>
      </div>
    </div>
  );
}
