import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser } from "../utils/api";

type BudgetCategoryId =
  | "food"
  | "travel"
  | "shopping"
  | "bills"
  | "entertainment"
  | "healthcare"
  | "education"
  | "other";

interface BudgetCategory {
  id: BudgetCategoryId;
  emoji: string;
  name: string;
  description: string;
  spent: number;
  budget: number;
}

const getCategoryMetadata = (id: string) => {
  const meta: Record<string, any> = {
    food: { emoji: "🍔", name: "Food & Dining", description: "Groceries, restaurants, cafes" },
    travel: { emoji: "✈️", name: "Travel & Transport", description: "Fuel, taxi, public transport" },
    shopping: { emoji: "🛍️", name: "Shopping", description: "Clothing, electronics, etc." },
    bills: { emoji: "📄", name: "Bills & Utilities", description: "Rent, electricity, internet" },
    entertainment: { emoji: "🎬", name: "Entertainment", description: "Movies, games, subscriptions" },
    healthcare: { emoji: "🏥", name: "Healthcare", description: "Medicine, doctor visits" },
    education: { emoji: "📚", name: "Education", description: "Course fees, books" },
    other: { emoji: "💼", name: "Other", description: "Miscellaneous expenses" },
  };
  return meta[id] || meta.other;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));

export default function Budget() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [editingCategoryId, setEditingCategoryId] = useState<BudgetCategoryId | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudgetsData();
  }, []);

  const fetchBudgetsData = async () => {
    try {
      const user = getUser();
      if (!user) return navigate("/login");

      const [expenseRes, budgetRes] = await Promise.all([
        fetch(`http://localhost:5000/api/expenses?userId=${user.id}`),
        fetch(`http://localhost:5000/api/budgets?userId=${user.id}`)
      ]);

      if (expenseRes.ok && budgetRes.ok) {
        const expenses = await expenseRes.json();
        const budgets = await budgetRes.json();

        // Calculate spending per category
        const spentByCategory: Record<string, number> = {};
        expenses.forEach((exp: any) => {
          spentByCategory[exp.category] = (spentByCategory[exp.category] || 0) + exp.amount;
        });

        // Merge with defined budgets
        const loadedCategories = budgets.map((b: any) => {
          const meta = getCategoryMetadata(b.category);
          return {
            id: b.category,
            emoji: meta.emoji,
            name: meta.name,
            description: meta.description,
            spent: spentByCategory[b.category] || 0,
            budget: b.limit
          };
        });

        setCategories(loadedCategories);
      }
    } catch (error) {
      console.error("Error fetching budget data", error);
    } finally {
      setLoading(false);
    }
  };

  const totalBudget = categories.reduce((sum, category) => sum + category.budget, 0);
  const totalSpent = categories.reduce((sum, category) => sum + category.spent, 0);
  const remaining = totalBudget - totalSpent;
  const overallUtilization = totalBudget === 0 ? 0 : (totalSpent / totalBudget) * 100;

  const startEditing = (category: BudgetCategory) => {
    setEditingCategoryId(category.id);
    setEditingValue(category.budget.toString());
  };

  const saveEditing = async (categoryId: BudgetCategoryId) => {
    const numericValue = Number(editingValue.replace(/,/g, ""));
    if (!Number.isFinite(numericValue) || numericValue < 0) {
      setEditingCategoryId(null);
      setEditingValue("");
      return;
    }

    try {
      const user = getUser();
      if (!user) return;
      
      const response = await fetch("http://localhost:5000/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, category: categoryId, limit: numericValue })
      });
      
      if (response.ok) {
        setCategories((prev) =>
          prev.map((category) =>
            category.id === categoryId ? { ...category, budget: numericValue } : category
          )
        );
      } else {
        alert("Failed to save budget");
      }
    } catch (e) {
      console.error(e);
      alert("Network error updating budget");
    }

    setEditingCategoryId(null);
    setEditingValue("");
  };

  const getCategoryStats = (category: BudgetCategory) => {
    const percent =
      category.budget === 0 ? 0 : (category.spent / category.budget) * 100;
    const clampedPercent = Math.min(percent, 100);

    let barClass = "success";
    let cardClass = "";

    if (percent >= 100) {
      barClass = "danger";
      cardClass = "danger-card";
    } else if (percent >= 80) {
      barClass = "warning";
      cardClass = "warning-card";
    }

    const remainingAmount = category.budget - category.spent;
    const remainingLabel =
      remainingAmount >= 0
        ? `₹${formatCurrency(remainingAmount)} left`
        : `₹${formatCurrency(Math.abs(remainingAmount))} over budget`;

    const remainingClass =
      remainingAmount >= 0 ? "progress-remaining" : "progress-remaining exceeded";

    return {
      percent: clampedPercent,
      barClass,
      cardClass,
      remainingLabel,
      remainingClass,
    };
  };

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="8" fill="url(#gradient-sidebar2)" />
              <path d="M20 10L28 20L20 30L12 20L20 10Z" fill="white" opacity="0.9" />
              <defs>
                <linearGradient id="gradient-sidebar2" x1="0" y1="0" x2="40" y2="40">
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
          <Link to="/add-expense" className="sidebar-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 5V15M5 10H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Add Expense</span>
          </Link>
          <Link to="/budget" className="sidebar-link active">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 6V10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Budgets</span>
          </Link>
          <a href="#" className="sidebar-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 8H17" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Transactions</span>
          </a>
          <a href="#" className="sidebar-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 4H17V16H3V4Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 8L12 12M12 8L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Reports</span>
          </a>
        </nav>
        <div className="sidebar-footer">
          <Link to="/admin" className="sidebar-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 11C12.2091 11 14 9.20914 14 7C14 4.79086 12.2091 3 10 3C7.79086 3 6 4.79086 6 7C6 9.20914 7.79086 11 10 11Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 17V16C3 14.3431 4.34315 13 6 13H14C15.6569 13 17 14.3431 17 16V17" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Profile</span>
          </Link>
          <button className="sidebar-link logout-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M13 3H15C15.5304 3 16.0391 3.21071 16.4142 3.58579C16.7893 3.96086 17 4.46957 17 5V15C17 15.5304 16.7893 16.0391 16.4142 16.4142C16.0391 16.7893 15.5304 17 15 17H13M7 13L3 10M3 10L7 7M3 10H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Sticky Header */}
        <header className="budget-page-header">
          <div className="budget-header-left">
            <h1 className="budget-page-title">Budget Management</h1>
            <p className="budget-page-subtitle">Set and track your monthly spending limits</p>
          </div>
          <div className="budget-header-right">
            <button className="btn btn-secondary">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3V17M3 10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Add Category
            </button>
            <button className="btn btn-primary">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 2V6M12 2V6M3 8H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              This Month
            </button>
            {/* Username Panel */}
            <div className="user-panel">
              <div className="user-avatar">RK</div>
              <div className="user-info">
                <p className="user-name">Rajesh Kumar</p>
                <p className="user-role">Personal Account</p>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          {/* Budget Overview — 3 cards side by side */}
          <div className="budget-overview">
            <div className="overview-card total">
              <div className="overview-header">
                <div className="overview-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="14" fill="#EEF2FF" />
                    <path d="M16 10V22M20 14H14C13.4696 14 12.9609 14.2107 12.5858 14.5858C12.2107 14.9609 12 15.4696 12 16C12 16.5304 12.2107 17.0391 12.5858 17.4142C12.9609 17.7893 13.4696 18 14 18H18C18.5304 18 19.0391 18.2107 19.4142 18.5858C19.7893 18.9609 20 19.4696 20 20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H12" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="overview-title">Total Budget</h3>
              </div>
              <p className="overview-amount">₹{formatCurrency(totalBudget)}</p>
              <div className="overview-footer">
                <span className="overview-label">For March 2026</span>
              </div>
            </div>

            <div className="overview-card spent">
              <div className="overview-header">
                <div className="overview-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="14" fill="#FEF2F2" />
                    <path d="M16 10V16L20 18" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="16" cy="16" r="8" stroke="#EF4444" strokeWidth="2" />
                  </svg>
                </div>
                <h3 className="overview-title">Total Spent</h3>
              </div>
              <p className="overview-amount danger">
                ₹{formatCurrency(totalSpent)}
              </p>
              <div className="overview-footer">
                <div className="progress-mini">
                  <div
                    className="progress-bar danger"
                    style={{ width: `${Math.min(overallUtilization, 100).toFixed(0)}%` }}
                  ></div>
                </div>
                <span className="overview-percentage">
                  {overallUtilization.toFixed(1)}% used
                </span>
              </div>
            </div>

            <div className="overview-card remaining">
              <div className="overview-header">
                <div className="overview-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="14" fill="#F0FDF4" />
                    <path d="M12 16L15 19L21 13" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="overview-title">Remaining</h3>
              </div>
              <p className="overview-amount success">
                ₹{formatCurrency(remaining)}
              </p>
              <div className="overview-footer">
                <span className="overview-label">22 days left</span>
              </div>
            </div>
          </div>

          {/* Budget Categories — side by side grid */}
          <div className="budget-categories">
            {categories.map((category) => {
              const { percent, barClass, cardClass, remainingLabel, remainingClass } =
                getCategoryStats(category);

              return (
                <div
                  key={category.id}
                  className={`budget-card ${cardClass}`}
                >
                  <div className="budget-card-header">
                    <div className="budget-category-info">
                      <span className="budget-emoji">{category.emoji}</span>
                      <div>
                        <h3 className="budget-category-name">
                          {category.name}
                        </h3>
                        <p className="budget-category-subtitle">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <button
                      className="budget-edit-btn"
                      type="button"
                      onClick={() => startEditing(category)}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M14 3L17 6L7 16H4V13L14 3Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="budget-amounts">
                    <div className="budget-amount-item">
                      <span className="budget-label">Spent</span>
                      <span className="budget-value">
                        ₹{formatCurrency(category.spent)}
                      </span>
                    </div>
                    <div className="budget-amount-item">
                      <span className="budget-label">Budget</span>
                      {editingCategoryId === category.id ? (
                        <div className="budget-edit-input-wrapper">
                          <input
                            type="number"
                            min={0}
                            className="budget-input"
                            value={editingValue}
                            onChange={(event) =>
                              setEditingValue(event.target.value)
                            }
                            onBlur={() => saveEditing(category.id)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                saveEditing(category.id);
                              }
                              if (event.key === "Escape") {
                                setEditingCategoryId(null);
                                setEditingValue("");
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <span className="budget-value total">
                          ₹{formatCurrency(category.budget)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="budget-progress">
                    <div className="progress-bar-container">
                      <div
                        className={`progress-bar ${barClass}`}
                        style={{ width: `${percent.toFixed(1)}%` }}
                      ></div>
                    </div>
                    <div className="progress-info">
                      <span className="progress-percentage">
                        {percent.toFixed(1)}%
                      </span>
                      <span className={remainingClass}>{remainingLabel}</span>
                    </div>
                  </div>
                  {category.id === "shopping" && barClass === "warning" && (
                    <div className="budget-alert">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M8 4V8M8 11H8.005M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z"
                          stroke="#F59E0B"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span>Approaching budget limit</span>
                    </div>
                  )}
                  {category.id === "bills" && barClass === "danger" && (
                    <div className="budget-alert danger">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M8 4V8M8 11H8.005M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z"
                          stroke="#EF4444"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span>Budget exceeded</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add New Budget */}
          <div className="add-budget-card">
            <div className="add-budget-form" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select className="form-input form-select" style={{ width: 'auto' }} id="new-budget-category">
                <option value="food">Food</option>
                <option value="travel">Travel</option>
                <option value="shopping">Shopping</option>
                <option value="bills">Bills</option>
                <option value="entertainment">Entertainment</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
              <input type="number" id="new-budget-amount" className="budget-input" placeholder="Budget Amount" style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }} />
              <button 
                className="add-budget-btn"
                onClick={async () => {
                  const categorySelect = document.getElementById('new-budget-category') as HTMLSelectElement;
                  const amountInput = document.getElementById('new-budget-amount') as HTMLInputElement;
                  
                  if (!categorySelect || !amountInput || !amountInput.value) return;
                  
                  const categoryId = categorySelect.value as BudgetCategoryId;
                  const numericValue = Number(amountInput.value);
                  
                  // Check if already exists in categories list
                  if (categories.some(c => c.id === categoryId)) {
                     alert("You already have a budget for this category. Please edit the existing one.");
                     return;
                  }
                  
                  try {
                    const user = getUser();
                    if (!user) return;
                    
                    const response = await fetch("http://localhost:5000/api/budgets", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ userId: user.id, category: categoryId, limit: numericValue })
                    });
                    
                    if (response.ok) {
                      amountInput.value = "";
                      fetchBudgetsData(); // Refresh all budget data
                    } else {
                      alert("Failed to add budget category");
                    }
                  } catch (e) {
                    console.error(e);
                    alert("Network error adding budget");
                  }
                }}
                style={{ padding: '0.5rem 1rem', background: '#6366f1', color: 'white', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                  <path d="M16 10V22M10 16H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>Add Category</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
