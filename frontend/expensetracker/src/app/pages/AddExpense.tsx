import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser } from "../utils/api";
import { ThemeToggle } from "../components/ThemeToggle";

export default function AddExpense() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("other");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);


  const fetchRecentExpenses = async () => {
    try {
      const user = getUser();
      if (!user) return;
      const fetchOpts = { cache: "no-store" as RequestCache };
      const [expRes, budRes, alertRes] = await Promise.all([
        fetch(`http://localhost:5000/api/expenses?userId=${user.id}`, fetchOpts),
        fetch(`http://localhost:5000/api/budgets?userId=${user.id}`, fetchOpts),
        fetch(`http://localhost:5000/api/alerts?userId=${user.id}`, fetchOpts)
      ]);
      
      if (expRes.ok) setRecentExpenses(await expRes.json());
      if (budRes.ok) setBudgets(await budRes.json());
      if (alertRes.ok) setAlerts(await alertRes.json());
      
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };


  useEffect(() => {
    fetchRecentExpenses();
  }, []);
  
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = getUser();
      if (!user) {
        alert("Please login first");
        navigate("/login");
        return;
      }
      
      const response = await fetch("http://localhost:5000/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          amount: Number(amount),
          category,
          date,
          paymentMethod,
          description,
          isRecurring
        })
      });

      if (response.ok) {
        alert("Expense added successfully!");
        setAmount("");
        setDescription("");
        await fetchRecentExpenses(); // Dynamic update without refresh
      } else {
        const errorData = await response.json();
        alert(`Failed to add expense: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="8" fill="url(#gradient-sidebar)" />
              <path d="M20 10L28 20L20 30L12 20L20 10Z" fill="white" opacity="0.9" />
              <defs>
                <linearGradient id="gradient-sidebar" x1="0" y1="0" x2="40" y2="40">
                  <stop offset="0%" style={{ stopColor: "#6366f1" }} />
                  <stop offset="100%" style={{ stopColor: "#8b5cf6" }} />
                </linearGradient>
              </defs>
            </svg>
            <span className="logo-text">ExpenseFlow</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="sidebar-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 7L10 3L17 7V17C17 17.5304 16.7893 18.0391 16.4142 18.4142C16.0391 18.7893 15.5304 19 15 19H5C4.46957 19 3.96086 18.7893 3.58579 18.4142C3.21071 18.0391 3 17.5304 3 17V7Z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Dashboard</span>
          </Link>
          <Link to="/add-expense" className="sidebar-link active">
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
          <Link to="/dashboard/transactions" className="sidebar-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 8H17" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Transactions</span>
          </Link>
          <Link to="/dashboard/reports" className="sidebar-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 4H17V16H3V4Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 8L12 12M12 8L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Reports</span>
          </Link>
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
        <header className="page-header">
          <div className="page-header-content">
            <h1 className="page-title">Add Expense</h1>
            <p className="page-subtitle">Record a new transaction quickly and easily</p>
          </div>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ThemeToggle />
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard/transactions')}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 3V17H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M7 13L10 7L13 10L17 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              View History
            </button>
          </div>
        </header>

        <div className="page-content">
          <div className="expense-layout">
            {/* Left: Expense Form */}
            <div className="expense-form-container">
              <div className="card">
                <div className="card-header-section">
                  <h2 className="card-title">Expense Details</h2>
                  <p className="card-subtitle">Fill in the information below</p>
                </div>
                <form className="expense-form" onSubmit={handleAddExpense}>
                  <div className="form-group">
                    <label htmlFor="amount" className="form-label required">Amount</label>
                    <div className="amount-input-wrapper">
                      <span className="currency-symbol">₹</span>
                      <input
                        type="text"
                        id="amount"
                        className="form-input amount-input"
                        placeholder="0.00"
                        required
                        value={amount}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || /^\d*\.?\d*$/.test(val)) {
                            setAmount(val);
                          }
                        }}
                      />

                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="category" className="form-label required">Category</label>
                    <div className="category-grid">
                      <label className="category-option">
                        <input type="radio" name="category" value="food" required checked={category === "food"} onChange={() => setCategory("food")} />
                        <div className="category-card">
                          <span className="category-emoji">🍔</span>
                          <span className="category-name">Food</span>
                        </div>
                      </label>
                      <label className="category-option">
                        <input type="radio" name="category" value="travel" required checked={category === "travel"} onChange={() => setCategory("travel")} />
                        <div className="category-card">
                          <span className="category-emoji">✈️</span>
                          <span className="category-name">Travel</span>
                        </div>
                      </label>
                      <label className="category-option">
                        <input type="radio" name="category" value="shopping" required checked={category === "shopping"} onChange={() => setCategory("shopping")} />
                        <div className="category-card">
                          <span className="category-emoji">🛍️</span>
                          <span className="category-name">Shopping</span>
                        </div>
                      </label>
                      <label className="category-option">
                        <input type="radio" name="category" value="bills" required checked={category === "bills"} onChange={() => setCategory("bills")} />
                        <div className="category-card">
                          <span className="category-emoji">📄</span>
                          <span className="category-name">Bills</span>
                        </div>
                      </label>
                      <label className="category-option">
                        <input type="radio" name="category" value="entertainment" required checked={category === "entertainment"} onChange={() => setCategory("entertainment")} />
                        <div className="category-card">
                          <span className="category-emoji">🎬</span>
                          <span className="category-name">Entertainment</span>
                        </div>
                      </label>
                      <label className="category-option">
                        <input type="radio" name="category" value="healthcare" required checked={category === "healthcare"} onChange={() => setCategory("healthcare")} />
                        <div className="category-card">
                          <span className="category-emoji">🏥</span>
                          <span className="category-name">Healthcare</span>
                        </div>
                      </label>
                      <label className="category-option">
                        <input type="radio" name="category" value="education" required checked={category === "education"} onChange={() => setCategory("education")} />
                        <div className="category-card">
                          <span className="category-emoji">📚</span>
                          <span className="category-name">Education</span>
                        </div>
                      </label>
                      <label className="category-option">
                        <input type="radio" name="category" value="other" required checked={category === "other"} onChange={() => setCategory("other")} />
                        <div className="category-card">
                          <span className="category-emoji">💼</span>
                          <span className="category-name">Other</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="date" className="form-label required">Date</label>
                      <div className="input-wrapper">
                        <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <rect x="3" y="4" width="14" height="14" rx="2" stroke="#9CA3AF" strokeWidth="1.5" />
                          <path d="M3 8H17M7 2V5M13 2V5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <input
                          type="date"
                          id="date"
                          className="form-input"
                          required
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="paymentMethod" className="form-label">Payment Method</label>
                      <div className="input-wrapper">
                        <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <rect x="2" y="5" width="16" height="10" rx="2" stroke="#9CA3AF" strokeWidth="1.5" />
                          <path d="M2 9H18" stroke="#9CA3AF" strokeWidth="1.5" />
                        </svg>
                        <select id="paymentMethod" className="form-input form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                          <option value="cash">Cash</option>
                          <option value="card">Credit/Debit Card</option>
                          <option value="upi">UPI</option>
                          <option value="netbanking">Net Banking</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                      id="description"
                      className="form-input form-textarea"
                      placeholder="Add notes about this expense..."
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input type="checkbox" className="checkbox-input" id="recurring" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
                      <span className="checkbox-text">This is a recurring expense</span>
                    </label>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-outline btn-large">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 5V15M5 10H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Save as Draft
                    </button>
                    <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M16 10L7 10M7 10L11 6M7 10L11 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      {loading ? "Adding..." : "Add Expense"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-card">
                <h3 className="quick-actions-title">Quick Actions</h3>
                <div className="quick-actions-grid">
                  <button className="quick-action-btn">
                    <span className="quick-action-icon">🍕</span>
                    <span>Lunch - ₹200</span>
                  </button>
                  <button className="quick-action-btn">
                    <span className="quick-action-icon">🚕</span>
                    <span>Taxi - ₹150</span>
                  </button>
                  <button className="quick-action-btn">
                    <span className="quick-action-icon">☕</span>
                    <span>Coffee - ₹80</span>
                  </button>
                  <button className="quick-action-btn">
                    <span className="quick-action-icon">🎬</span>
                    <span>Movie - ₹300</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Summary & Recent */}
            <div className="expense-sidebar-content">
              {/* Today's Summary */}
              {(() => {
                const today = new Date().toISOString().split("T")[0];
                const todaysExpenses = recentExpenses.filter(e => {
                  const eDate = new Date(e.date || e.createdAt).toISOString().split("T")[0];
                  return eDate === today;
                });
                
                const todayTotal = todaysExpenses.reduce((sum, e) => sum + e.amount, 0);
                
                const categoryTotals = todaysExpenses.reduce((acc, e) => {
                  acc[e.category] = (acc[e.category] || 0) + e.amount;
                  return acc;
                }, {} as Record<string, number>);

                const getEmoji = (cat: string) => {
                  switch (cat) {
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

                return (
                  <div className="card summary-card">
                    <div className="card-header-section">
                      <h3 className="card-title">Today's Summary</h3>
                      <span className="date-badge">{new Date().toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                    </div>
                    <div className="summary-stats">
                      <div className="summary-stat">
                        <span className="summary-label">Total Spent</span>
                        <span className="summary-value primary">₹{todayTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>

                      </div>
                      <div className="summary-divider"></div>
                      <div className="summary-stat">
                        <span className="summary-label">Transactions</span>
                        <span className="summary-value">{todaysExpenses.length}</span>
                      </div>
                    </div>
                    {todaysExpenses.length > 0 && (
                      <div className="category-breakdown">
                        <h4 className="breakdown-title">Category Breakdown</h4>
                        {Object.entries(categoryTotals).map(([cat, amt]) => (
                          <div className="breakdown-item" key={cat}>
                            <div className="breakdown-info">
                              <span className="breakdown-icon">{getEmoji(cat)}</span>
                              <span className="breakdown-name" style={{textTransform: 'capitalize'}}>{cat}</span>
                            </div>
                            <span className="breakdown-amount">₹{(amt as number).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Recent Transactions */}
              <div className="card recent-card">
                <div className="card-header-section">
                  <h3 className="card-title">Recent Transactions</h3>
                  <Link to="/dashboard/transactions" className="view-all-link">View all</Link>
                </div>
                <div className="recent-transactions">
                  {recentExpenses.length > 0 ? recentExpenses.slice(0, 4).map(exp => {
                    const getTheme = (cat: string) => ['food', 'travel', 'shopping', 'bills'].includes(cat) ? cat : 'other';
                    const getEmoji = (cat: string) => {
                      switch (cat) {
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
                    return (
                      <div className="transaction-item" key={exp._id}>
                        <div className={`transaction-icon ${getTheme(exp.category)}`}>{getEmoji(exp.category)}</div>
                        <div className="transaction-details">
                          <p className="transaction-name">{exp.description ? String(exp.description) : `${String(exp.category)} expense`}</p>
                          <p className="transaction-time">{new Date(exp.date || exp.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className="transaction-amount">₹{exp.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>

                      </div>
                    );
                  }) : (
                    <div style={{textAlign: 'center', padding: '1rem', color: 'var(--color-gray-500)'}}>No recent transactions</div>
                  )}
                </div>
              </div>

              {/* Budget Alert (Dynamic logic) */}
              {(() => {
                const totalSpent = recentExpenses.reduce((sum, e) => sum + e.amount, 0);
                const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
                const utilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
                
                // Get most relevant alert
                const latestAlert = alerts[0];
                
                return (
                  <div className={`alert-card ${utilization >= 100 ? 'danger' : utilization >= 80 ? 'warning' : 'info'}`}>
                    <div className="alert-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="alert-content">
                      <h4 className="alert-title">{latestAlert ? 'Budget Alert' : 'Budget Status'}</h4>
                      <p className="alert-text">
                        {latestAlert ? latestAlert.message : 
                         totalBudget > 0 ? `You've used ${utilization.toFixed(0)}% of your total budget.` : 
                         "Start by setting a budget to track your spending limits."
                        }
                      </p>
                      <Link to="/budget" className="alert-link">
                        {totalBudget > 0 ? "View Details →" : "Set Budget →"}
                      </Link>
                    </div>
                  </div>
                );
              })()}


            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
