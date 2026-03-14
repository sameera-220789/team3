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
  // Tab State
  const [activeTab, setActiveTab] = useState<"budgets" | "split">("budgets");

  // Budget State
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [budgetsData, setBudgetsData] = useState<any[]>([]); // Added state
  const [editingCategoryId, setEditingCategoryId] = useState<BudgetCategoryId | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Split Expense State
  const [groups, setGroups] = useState<any[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [groupExpenses, setGroupExpenses] = useState<any[]>([]);
  const [groupBalances, setGroupBalances] = useState<{balances: any, transactions: any[]}>({ balances: {}, transactions: [] });
  
  // Modals Data
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupMembers, setNewGroupMembers] = useState<string[]>([""]);

  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [splitDesc, setSplitDesc] = useState("");
  const [splitAmount, setSplitAmount] = useState("");
  const [splitPaidBy, setSplitPaidBy] = useState("");
  const [splitInvolvedMembers, setSplitInvolvedMembers] = useState<string[]>([]);

  useEffect(() => {
    fetchBudgetsData();
    fetchGroups();
    // Auto-refresh every 30 seconds so Total Spent and Remaining update after adding expenses
    const interval = setInterval(() => {
        fetchBudgetsData();
        if (activeTab === "split") {
          fetchGroups();
          if (activeGroupId) fetchGroupDetails(activeGroupId);
        }
    }, 30000);
    return () => clearInterval(interval);
  }, [activeTab, activeGroupId]);

  const fetchGroups = async () => {
    try {
      const user = getUser();
      if (!user) return;
      // Pass both ID and name/email if membership relies on string names
      const userName = `${user.firstName} ${user.lastName}`.trim();
      const res = await fetch(`http://localhost:5000/api/groups?userId=${user.id}&userName=${encodeURIComponent(userName)}`);
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (e) {
      console.error("Error fetching groups:", e);
    }
  };

  const fetchGroupDetails = async (groupId: string) => {
    try {
       const [expRes, balRes] = await Promise.all([
         fetch(`http://localhost:5000/api/groups/${groupId}/expenses`),
         fetch(`http://localhost:5000/api/groups/${groupId}/balance`)
       ]);

       if (expRes.ok && balRes.ok) {
         setGroupExpenses(await expRes.json());
         setGroupBalances(await balRes.json());
       }
    } catch (e) {
      console.error("Error fetching group details:", e);
    }
  };

  const handleGroupSelect = (id: string) => {
    setActiveGroupId(id);
    setGroupExpenses([]);
    setGroupBalances({balances: {}, transactions: []});
    fetchGroupDetails(id);
  };

  const fetchBudgetsData = async () => {
    try {
      const user = getUser();
      if (!user) return navigate("/login");

      const fetchOpts = { cache: "no-store" as RequestCache };
      const [expenseRes, budgetRes] = await Promise.all([
        fetch(`http://localhost:5000/api/expenses?userId=${user.id}`, fetchOpts),
        fetch(`http://localhost:5000/api/budgets?userId=${user.id}`, fetchOpts)
      ]);

      if (expenseRes.ok && budgetRes.ok) {
        const expenses = await expenseRes.json();
        const budgets = await budgetRes.json();
        
        setBudgetsData(budgets); // Set raw budget data to calculate overall total budget

        // Calculate spending per category
        const spentByCategory: Record<string, number> = {};
        expenses.forEach((exp: any) => {
          spentByCategory[exp.category] = (spentByCategory[exp.category] || 0) + exp.amount;
        });

        // Merge with defined budgets
        const loadedCategories = budgets
          .filter((b: any) => b.category !== 'total')
          .map((b: any) => {
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

  const totalBudgetDoc = budgetsData.find((b: any) => b.category === 'total');
  const overallTotalBudget = totalBudgetDoc ? totalBudgetDoc.limit : 0;

  const totalSpent = categories.reduce((sum, category) => sum + category.spent, 0);
  // Show real negative value — do NOT clamp to 0
  const remaining = overallTotalBudget - totalSpent;
  const isOverBudget = remaining < 0;
  const overallUtilization = overallTotalBudget === 0 ? 0 : (totalSpent / overallTotalBudget) * 100;

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
      } else if (response.status === 400) {
        const data = await response.json();
        alert(data.message || "Cannot add category budget. Total budget limit exceeded.");
        setEditingCategoryId(null);
        setEditingValue("");
        return;
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

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || newGroupMembers.some(m => !m.trim())) {
      alert("Please fill all group fields");
      return;
    }
    try {
      const user = getUser();
      if (!user) return;
      const userName = `${user.firstName} ${user.lastName}`.trim();
      const currentMembers = newGroupMembers.map(m => m.trim()).filter(Boolean);
      // Ensure the creator is implicitly in the group logic if not already typed
      if (!currentMembers.includes(userName)) {
         currentMembers.push(userName);
      }

      const res = await fetch("http://localhost:5000/api/groups/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupName: newGroupName,
          members: currentMembers,
          createdBy: user.id
        })
      });

      if (res.ok) {
        const savedGroup = await res.json();
        setGroups([savedGroup, ...groups]);
        setShowCreateGroupModal(false);
        setNewGroupName("");
        setNewGroupMembers([""]);
        handleGroupSelect(savedGroup._id); // Auto select new group
      } else {
        alert("Failed to create group");
      }
    } catch (e) {
      console.error(e);
      alert("Network error");
    }
  };

  const handleAddSplitExpense = async () => {
    const numAmount = Number(splitAmount);
    if (!splitDesc || isNaN(numAmount) || numAmount <= 0 || !splitPaidBy || splitInvolvedMembers.length === 0) {
      alert("Please fill all fields correctly");
      return;
    }

    try {
      const share = numAmount / splitInvolvedMembers.length;
      const splitBetween = splitInvolvedMembers.map(m => ({ member: m, share }));

      const res = await fetch("http://localhost:5000/api/groups/expense/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: activeGroupId,
          description: splitDesc,
          amount: numAmount,
          paidBy: splitPaidBy,
          splitBetween
        })
      });

      if (res.ok) {
        setShowAddExpenseModal(false);
        setSplitDesc("");
        setSplitAmount("");
        setSplitPaidBy("");
        setSplitInvolvedMembers([]);
        if (activeGroupId) fetchGroupDetails(activeGroupId);
      } else {
        alert("Failed to add split expense");
      }
    } catch (e) {
      console.error(e);
      alert("Network error");
    }
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
            <div className="tabs-container" style={{ display: 'flex', gap: '10px', marginRight: '20px', background: '#f3f4f6', padding: '4px', borderRadius: '8px' }}>
              <button 
                className={`tab-btn ${activeTab === 'budgets' ? 'active' : ''}`}
                onClick={() => setActiveTab('budgets')}
                style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', fontWeight: 600, background: activeTab === 'budgets' ? 'white' : 'transparent', color: activeTab === 'budgets' ? '#4f46e5' : '#6b7280', boxShadow: activeTab === 'budgets' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                My Budgets
              </button>
              <button 
                className={`tab-btn ${activeTab === 'split' ? 'active' : ''}`}
                onClick={() => setActiveTab('split')}
                style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', fontWeight: 600, background: activeTab === 'split' ? 'white' : 'transparent', color: activeTab === 'split' ? '#4f46e5' : '#6b7280', boxShadow: activeTab === 'split' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Split Expenses
              </button>
            </div>

            {/* Username Panel */}
            <div className="user-panel">
              <div className="user-avatar">{getUser()?.firstName?.[0] || 'U'}{getUser()?.lastName?.[0] || ''}</div>
              <div className="user-info">
                <p className="user-name">{getUser()?.firstName} {getUser()?.lastName}</p>
                <p className="user-role">Personal Account</p>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          {activeTab === "budgets" && (
            <>
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
                    <h3 className="overview-title">Overall Budget</h3>
                  </div>
                  <p className="overview-amount">₹{formatCurrency(overallTotalBudget)}</p>
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
                        <circle cx="16" cy="16" r="14" fill={isOverBudget ? '#FEF2F2' : '#F0FDF4'} />
                        {isOverBudget ? (
                          <path d="M11 11L21 21M21 11L11 21" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
                        ) : (
                          <path d="M12 16L15 19L21 13" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        )}
                      </svg>
                    </div>
                    <h3 className="overview-title">Remaining</h3>
                  </div>
                  <p className="overview-amount" style={{ color: isOverBudget ? '#ef4444' : '#10b981' }}>
                    {isOverBudget ? '-' : ''}₹{formatCurrency(Math.abs(remaining))}
                  </p>
                  <div className="overview-footer">
                    {isOverBudget ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', background: '#fee2e2', padding: '2px 8px', borderRadius: '9999px' }}>
                        ⚠️ Over Budget by ₹{formatCurrency(Math.abs(remaining))}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', background: '#d1fae5', padding: '2px 8px', borderRadius: '9999px' }}>
                        ✓ Within Budget
                      </span>
                    )}
                  </div>
                </div>
              </div>

          {/* Category Wise Total Budget Card */}
          <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
            <div className="card-header-section">
              <h3 className="card-title">Category Wise Total Budget</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {categories.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{c.emoji}</span>
                    <span style={{ fontWeight: 500, color: '#374151' }}>{c.name}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: '#111827' }}>₹{formatCurrency(c.budget)}</span>
                </div>
              ))}
              {categories.length === 0 && (
                <div style={{ color: '#6b7280', padding: '1rem', fontStyle: 'italic' }}>No categories added yet.</div>
              )}
            </div>

            {categories.length > 0 && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 600, color: '#374151' }}>Total Category Budget</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6366f1' }}>
                  ₹{formatCurrency(categories.reduce((acc, c) => acc + c.budget, 0))}
                </span>
              </div>
            )}
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
                      } else if (response.status === 400) {
                        const data = await response.json();
                        alert(data.message || "Cannot add category budget. Total budget limit exceeded.");
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
          </>
        )}

        {activeTab === "split" && (
          <div className="split-expenses-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                {groups.map(group => (
                  <button
                    key={group._id}
                    onClick={() => handleGroupSelect(group._id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: '1px solid #e5e7eb',
                      background: activeGroupId === group._id ? '#e0e7ff' : 'white',
                      color: activeGroupId === group._id ? '#4f46e5' : '#4b5563',
                      fontWeight: activeGroupId === group._id ? 600 : 400,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {group.groupName}
                  </button>
                ))}
                <button
                  onClick={() => setShowCreateGroupModal(true)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px dashed #6366f1',
                    background: 'transparent',
                    color: '#6366f1',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>+ Create Group</span>
                </button>
              </div>

              {activeGroupId && (
                 <button
                   onClick={() => setShowAddExpenseModal(true)}
                   style={{
                     padding: '8px 20px',
                     background: '#6366f1',
                     color: 'white',
                     border: 'none',
                     borderRadius: '8px',
                     fontWeight: 600,
                     cursor: 'pointer',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '8px',
                     boxShadow: '0 2px 4px rgba(99,102,241,0.2)'
                   }}
                 >
                   <span>+ Add Split Expense</span>
                 </button>
              )}
            </div>

            {activeGroupId ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
                
                {/* Left side: Group Expenses Table */}
                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>Group Expenses</h3>
                  <div className="table-wrapper">
                    <table className="transactions-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Description</th>
                          <th>Total Amount</th>
                          <th>Paid By</th>
                          <th>Split Among</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupExpenses.length > 0 ? groupExpenses.map((exp: any) => (
                          <tr key={exp._id}>
                            <td style={{ color: '#6b7280' }}>
                              {new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </td>
                            <td style={{ fontWeight: 500 }}>{exp.description}</td>
                            <td style={{ fontWeight: 600, color: '#111827' }}>₹{exp.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                            <td style={{ color: '#4f46e5', fontWeight: 500 }}>{exp.paidBy}</td>
                            <td style={{ color: '#4b5563', fontSize: '0.875rem' }}>
                              {exp.splitBetween.map((s: any) => s.member).join(', ')}
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                              No expenses recorded for this group yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right side: Balances Summary */}
                <div className="card" style={{ padding: '20px', background: '#f8fafc' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                     <div style={{ background: '#e0e7ff', p: '8px', borderRadius: '8px', color: '#4f46e5' }}>
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                         <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.44 3.59 2.95 1.89.47 2.42 1.14 2.42 1.92 0 .9-.85 1.56-2.18 1.56-1.57 0-2.25-.8-2.3-1.88h-1.71c.06 1.75 1.13 2.89 2.8 3.25V19h2.39v-1.7c1.55-.37 2.8-1.35 2.8-2.92.01-1.92-1.51-2.61-3.68-3.24z" fill="currentColor"/>
                       </svg>
                     </div>
                     <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>Balance Summary</h3>
                   </div>
                   
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                     {groupBalances.transactions.length > 0 ? groupBalances.transactions.map((tx: any, i: number) => (
                       <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                         <div style={{ display: 'flex', flexDirection: 'column' }}>
                           <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Owes</span>
                           <span style={{ fontWeight: 600, color: '#ef4444' }}>{tx.from}</span>
                         </div>
                         <div style={{ color: '#cbd5e1' }}>
                           <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                             <path d="M5 12h14m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           </svg>
                         </div>
                         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                           <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Gets paid</span>
                           <span style={{ fontWeight: 600, color: '#10b981' }}>{tx.to}</span>
                         </div>
                         <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b', marginLeft: '12px' }}>
                           ₹{tx.amount.toLocaleString('en-IN')}
                         </div>
                       </div>
                     )) : (
                       <div style={{ textAlign: 'center', padding: '20px 0', color: '#64748b', fontSize: '0.9rem' }}>
                         Balances are settled up!
                       </div>
                     )}
                   </div>
                </div>

              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', color: '#94a3b8', marginBottom: '16px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M17 20h5V4H2v16h5M7 15h10M7 11h10M7 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Select or create a Group</h3>
                <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto', lineHeight: 1.5 }}>
                  Manage shared expenses among friends, family, or colleagues easily. Create a group to start tracking splits automatically!
                </p>
              </div>
            )}
          </div>
        )}
        </div>
      </main>

      {/* CREATE GROUP MODAL */}
      {showCreateGroupModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>Create New Group</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px', color: '#4b5563' }}>Group Name</label>
              <input 
                type="text" 
                value={newGroupName} 
                onChange={(e) => setNewGroupName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                placeholder="e.g., Goa Trip 2026"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px', color: '#4b5563' }}>Members (Names)</label>
              {newGroupMembers.map((member, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input 
                    type="text" 
                    value={member}
                    onChange={(e) => {
                      const newMembers = [...newGroupMembers];
                      newMembers[index] = e.target.value;
                      setNewGroupMembers(newMembers);
                    }}
                    style={{ flex: 1, padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                    placeholder={`Member ${index + 1} Name`}
                  />
                  {newGroupMembers.length > 1 && (
                    <button 
                      onClick={() => setNewGroupMembers(newGroupMembers.filter((_, i) => i !== index))}
                      style={{ padding: '0 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >✕</button>
                  )}
                </div>
              ))}
              <button 
                onClick={() => setNewGroupMembers([...newGroupMembers, ""])}
                style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem', marginTop: '4px' }}
              >+ Add another member</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button 
                onClick={() => setShowCreateGroupModal(false)}
                style={{ padding: '8px 16px', border: '1px solid #d1d5db', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
              >Cancel</button>
              <button 
                onClick={handleCreateGroup}
                style={{ padding: '8px 16px', border: 'none', background: '#6366f1', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
              >Create Group</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SPLIT EXPENSE MODAL */}
      {showAddExpenseModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>Add Split Expense</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px', color: '#4b5563' }}>Description</label>
              <input 
                type="text" 
                value={splitDesc} 
                onChange={(e) => setSplitDesc(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                placeholder="e.g., Dinner at Taj"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px', color: '#4b5563' }}>Total Amount</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#6b7280' }}>₹</span>
                <input 
                  type="number" 
                  value={splitAmount} 
                  onChange={(e) => setSplitAmount(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 28px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px', color: '#4b5563' }}>Paid By</label>
              <select 
                value={splitPaidBy} 
                onChange={(e) => setSplitPaidBy(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white' }}
              >
                <option value="" disabled>Select member who paid</option>
                {groups.find(g => g._id === activeGroupId)?.members.map((m: string) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px', color: '#4b5563' }}>Split Between (Equal Shares)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {groups.find(g => g._id === activeGroupId)?.members.map((m: string) => (
                  <label key={m} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input 
                      type="checkbox" 
                      checked={splitInvolvedMembers.includes(m)}
                      onChange={(e) => {
                        if (e.target.checked) setSplitInvolvedMembers([...splitInvolvedMembers, m]);
                        else setSplitInvolvedMembers(splitInvolvedMembers.filter(member => member !== m));
                      }}
                      style={{ accentColor: '#6366f1', width: '16px', height: '16px' }}
                    />
                    {m}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setShowAddExpenseModal(false)}
                style={{ padding: '8px 16px', border: '1px solid #d1d5db', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
              >Cancel</button>
              <button 
                onClick={handleAddSplitExpense}
                style={{ padding: '8px 16px', border: 'none', background: '#6366f1', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
              >Save Split Expense</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
