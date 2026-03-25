import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../utils/config";
import { getUser } from "../utils/api";
import { ThemeToggle } from "../components/ThemeToggle";

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
  const [budgetsData, setBudgetsData] = useState<any[]>([]); // raw budget docs
  const [allExpenses, setAllExpenses] = useState<any[]>([]); // all raw expenses
  const [editingCategoryId, setEditingCategoryId] = useState<BudgetCategoryId | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  // Selected Month (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return localStorage.getItem("selectedMonth") || new Date().toISOString().slice(0, 7);
  });

  // Split Expense State
  const [groups, setGroups] = useState<any[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [groupExpenses, setGroupExpenses] = useState<any[]>([]);
  const [groupBalances, setGroupBalances] = useState<{ balances: any, transactions: any[] }>({ balances: {}, transactions: [] });

  // Modals Data
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupMembers, setNewGroupMembers] = useState<string[]>([""]);

  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [splitDesc, setSplitDesc] = useState("");
  const [splitAmount, setSplitAmount] = useState("");
  const [splitPaidBy, setSplitPaidBy] = useState("");
  const [splitInvolvedMembers, setSplitInvolvedMembers] = useState<string[]>([]);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  useEffect(() => {
    fetchBudgetsData();
    fetchGroups();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchBudgetsData();
      if (activeTab === "split") {
        fetchGroups();
        if (activeGroupId) fetchGroupDetails(activeGroupId);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [activeTab, activeGroupId, selectedMonth]);

  const fetchGroups = async () => {
    try {
      const user = getUser();
      if (!user) return;
      // Pass both ID and name/email if membership relies on string names
      const userName = `${user.firstName} ${user.lastName}`.trim();
      const res = await fetch(`${API_BASE_URL}/api/groups?userId=${user.id}&userName=${encodeURIComponent(userName)}&userEmail=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (e) {
      console.error("Error fetching groups:", e);
    }
  };

  const finalizeMonth = async (option: 'carryForward' | 'savings') => {
    try {
      const user = getUser();
      if (!user) return;

      const response = await fetch(`${API_BASE_URL}/api/budgets/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, month: selectedMonth, option })
      });

      if (response.ok) {
        alert(option === 'carryForward' ? "Budget carried forward to next month!" : "Remaining budget moved to savings!");
        fetchBudgetsData();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to finalize month");
      }
    } catch (e) {
      console.error(e);
      alert("Network error finalizing month");
    }
  };

  const undoFinalize = async () => {
    try {
      const user = getUser();
      if (!user) return;

      const res = await fetch(`${API_BASE_URL}/api/budgets/undo-finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, month: selectedMonth })
      });

      if (res.ok) {
        alert("Finalization undone successfully!");
        fetchBudgetsData(); // Refresh both budgets and expenses
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to undo finalization");
      }
    } catch (e) {
      console.error("Error undoing finalization:", e);
    }
  };

  const fetchGroupDetails = async (groupId: string) => {
    try {
      const [expRes, balRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/groups/${groupId}/expenses`),
        fetch(`${API_BASE_URL}/api/groups/${groupId}/balance`)
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
    setGroupBalances({ balances: {}, transactions: [] });
    fetchGroupDetails(id);
  };

  const fetchBudgetsData = async () => {
    try {
      const user = getUser();
      if (!user) return navigate("/login");

      const fetchOpts = { cache: "no-store" as RequestCache };
      const [expenseRes, budgetRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/expenses?userId=${user.id}&month=${selectedMonth}`, fetchOpts),
        fetch(`${API_BASE_URL}/api/budgets?userId=${user.id}&month=${selectedMonth}`, fetchOpts)
      ]);

      if (expenseRes.ok && budgetRes.ok) {
        const expenses = await expenseRes.json();
        const budgets = await budgetRes.json();

        setBudgetsData(budgets); // raw budget docs
        setAllExpenses(expenses); // all raw expenses for correct totalSpent

        // Calculate spending per category
        const spentByCategory: Record<string, number> = {};
        expenses.filter((exp: any) => exp.type !== 'income').forEach((exp: any) => {
          spentByCategory[exp.category] = (spentByCategory[exp.category] || 0) + Number(exp.amount);
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
  const overallTotalBudget = totalBudgetDoc ? (Number(totalBudgetDoc.totalBudget) || 0) : 0;
  const overallSpentAmount = totalBudgetDoc ? (Number(totalBudgetDoc.spentAmount) || 0) : 0;
  const overallRemainingAmount = totalBudgetDoc ? (Number(totalBudgetDoc.remainingAmount) || 0) : 0;

  // Total Spent = sum of ALL expenses (matches Dashboard)
  const totalSpent = allExpenses.filter((exp: any) => exp.type !== 'income').reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);

  // Total category budget allocated (sum of non-total budget limits)
  const totalCategoryBudget = budgetsData
    .filter((b: any) => b.category !== 'total')
    .reduce((sum: number, b: any) => sum + b.limit, 0);

  // Remaining unallocated budget = overall budget minus actual spend
  const unallocatedBudget = overallTotalBudget - totalSpent;
  const isOverAllocated = unallocatedBudget < 0;
  
  // Utilization based on actual spend vs overall budget
  const overallUtilization = overallTotalBudget === 0 ? 0 : (overallSpentAmount / overallTotalBudget) * 100;

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

      const response = await fetch(`${API_BASE_URL}/api/budgets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, category: categoryId, limit: numericValue, month: selectedMonth })
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

  const deleteBudgetCategory = async (categoryId: BudgetCategoryId) => {
    try {
      const user = getUser();
      if (!user) return;

      if (!window.confirm("Are you sure you want to delete this budget category?")) return;

      const response = await fetch(`${API_BASE_URL}/api/budgets/${categoryId}?userId=${user.id}&month=${selectedMonth}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setCategories((prev) => prev.filter(c => c.id !== categoryId));
        fetchBudgetsData();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to delete budget");
      }
    } catch (e) {
      console.error(e);
      alert("Network error deleting budget");
    }
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

      const res = await fetch(`${API_BASE_URL}/api/groups/create`, {
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

      const url = editingExpenseId 
        ? `${API_BASE_URL}/api/groups/expense/${editingExpenseId}`
        : `${API_BASE_URL}/api/groups/expense/add`;
      const method = editingExpenseId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
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
        setEditingExpenseId(null);
        setSplitDesc("");
        setSplitAmount("");
        setSplitPaidBy("");
        setSplitInvolvedMembers([]);
        if (activeGroupId) fetchGroupDetails(activeGroupId);
      } else {
        alert("Failed to save split expense");
      }
    } catch (e) {
      console.error(e);
      alert("Network error");
    }
  };

  const handleDeleteSplitExpense = async (expenseId: string) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/groups/expense/${expenseId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        if (activeGroupId) fetchGroupDetails(activeGroupId);
      } else {
        alert("Failed to delete expense");
      }
    } catch (e) {
      console.error(e);
      alert("Network error deleting expense");
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
          <Link to="/goals" className="sidebar-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
               <path d="M12 20L18 12C18 12 21 8.5 21 6.5C21 4.01472 18.9853 2 16.5 2C14.7317 2 13.1979 3.01831 12.5 4.54275C11.8021 3.01831 10.2683 2 8.5 2C6.01472 2 4 4.01472 4 6.5C4 8.5 7 12 7 12L12 20ZM12 20V22M8 22H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Goals & Reminders</span>
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
          <button className="sidebar-link logout-btn" onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("role");
            window.location.href = "/login";
          }}>
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
            <div style={{ marginTop: '12px' }}>
              <p className="budget-page-subtitle" style={{ margin: 0, fontWeight: 700, color: 'var(--color-primary)', fontSize: '1rem' }}>
                {new Date(`${selectedMonth}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="budget-header-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ThemeToggle />
            <div className="tabs-container" style={{ display: 'flex', gap: '10px', marginRight: '20px', background: 'var(--color-gray-100)', padding: '4px', borderRadius: '8px' }}>
              <button
                className={`tab-btn ${activeTab === 'budgets' ? 'active' : ''}`}
                onClick={() => setActiveTab('budgets')}
                style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', fontWeight: 600, background: activeTab === 'budgets' ? 'var(--color-gray-50)' : 'transparent', color: activeTab === 'budgets' ? 'var(--color-primary)' : 'var(--color-gray-500)', boxShadow: activeTab === 'budgets' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                My Budgets
              </button>
              <button
                className={`tab-btn ${activeTab === 'split' ? 'active' : ''}`}
                onClick={() => setActiveTab('split')}
                style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', fontWeight: 600, background: activeTab === 'split' ? 'var(--color-gray-50)' : 'transparent', color: activeTab === 'split' ? 'var(--color-primary)' : 'var(--color-gray-500)', boxShadow: activeTab === 'split' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}
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
                        <circle cx="16" cy="16" r="14" fill="var(--color-primary-light)" fillOpacity="0.1" />
                        <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontSize="18" fontWeight="bold" fill="var(--color-primary)">₹</text>
                      </svg>
                    </div>
                    <h3 className="overview-title">Overall Budget</h3>
                  </div>
                  <p className="overview-amount">₹{formatCurrency(overallTotalBudget)}</p>
                  <div className="overview-footer">
                    <span className="overview-label">Set for {new Date(`${selectedMonth}-01`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="overview-card spent">
                  <div className="overview-header">
                    <div className="overview-icon">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="14" fill="var(--color-danger-light)" fillOpacity="0.1" />
                        <path d="M16 10V16L20 18" stroke="var(--color-danger)" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="16" cy="16" r="8" stroke="var(--color-danger)" strokeWidth="2" />
                      </svg>
                    </div>
                    <h3 className="overview-title">Total Spent</h3>
                  </div>
                  <p className="overview-amount danger">
                    ₹{formatCurrency(overallSpentAmount)}
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
                        <circle cx="16" cy="16" r="14" fill={isOverAllocated ? 'var(--color-danger-light)' : 'var(--color-success-light)'} fillOpacity="0.2" />
                        {isOverAllocated ? (
                          <path d="M11 11L21 21M21 11L11 21" stroke="var(--color-danger)" strokeWidth="2.5" strokeLinecap="round" />
                        ) : (
                          <path d="M12 16L15 19L21 13" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        )}
                      </svg>
                    </div>
                    <h3 className="overview-title">Unallocated Balance</h3>
                  </div>
                  <p className="overview-amount" style={{ color: isOverAllocated ? 'var(--color-danger)' : 'var(--color-success)' }}>
                    {isOverAllocated ? '-' : ''}₹{formatCurrency(Math.abs(unallocatedBudget))}
                  </p>
                  <div className="overview-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {isOverAllocated ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-danger)', background: 'var(--color-danger-light)', opacity: 0.8, padding: '2px 8px', borderRadius: '9999px', width: 'fit-content' }}>
                        ⚠️ Over Allocated by ₹{formatCurrency(Math.abs(unallocatedBudget))}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-success)', background: 'var(--color-success-light)', opacity: 0.8, padding: '2px 8px', borderRadius: '9999px', width: 'fit-content' }}>
                        ✓ Within Budget
                      </span>
                    )}
                    
                    {overallRemainingAmount > 0 && totalBudgetDoc && !totalBudgetDoc.carryForward && totalBudgetDoc.savings === 0 && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button 
                          onClick={() => finalizeMonth('carryForward')}
                          style={{ fontSize: '0.7rem', padding: '4px 8px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Carry Forward
                        </button>
                        <button 
                          onClick={() => finalizeMonth('savings')}
                          style={{ fontSize: '0.7rem', padding: '4px 8px', background: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          To Savings
                        </button>
                      </div>
                    )}
                    {totalBudgetDoc?.carryForward && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600 }}>Will carry forward to next month</span>
                    )}
                    {totalBudgetDoc?.savings > 0 && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: 600 }}>₹{formatCurrency(totalBudgetDoc.savings)} moved to savings</span>
                    )}

                {(totalBudgetDoc && (totalBudgetDoc.carryForward || (totalBudgetDoc.savings > 0))) && (
                  <div style={{ marginTop: '14px' }}>
                    <button 
                      className="btn btn-secondary btn-small"
                      style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger-light)' }}
                      onClick={undoFinalize}
                    >
                      Undo Finalization
                    </button>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginTop: '4px' }}>
                      {totalBudgetDoc.carryForward ? "Status: Carried Forward" : `Status: Saved ₹${formatCurrency(totalBudgetDoc.savings)}`}
                    </p>
                  </div>
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
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--color-gray-100)', borderRadius: '0.5rem', border: '1px solid var(--color-gray-200)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{c.emoji}</span>
                        <span style={{ fontWeight: 500, color: 'var(--color-gray-700)' }}>{c.name}</span>
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--color-gray-900)' }}>₹{formatCurrency(c.budget)}</span>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <div style={{ color: '#6b7280', padding: '1rem', fontStyle: 'italic' }}>No categories added yet.</div>
                  )}
                </div>

                {categories.length > 0 && (
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-gray-700)' }}>Total Category Budget</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
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
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="budget-edit-btn"
                            type="button"
                            onClick={() => startEditing(category)}
                            title="Edit Budget"
                          >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M14 3L17 6L7 16H4V13L14 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </button>
                          <button
                            className="budget-edit-btn"
                            type="button"
                            onClick={() => deleteBudgetCategory(category.id)}
                            style={{ color: 'var(--color-danger)' }}
                            title="Delete Budget"
                          >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M4 5H16M6 5V15C6 16.1046 6.89543 17 8 17H12C13.1046 17 14 16.1046 14 15V5M8 5V3C8 2.44772 8.44772 2 9 2H11C11.5523 2 12 2.44772 12 3V5M8 9V13M12 9V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </button>
                        </div>
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
                  <input type="number" id="new-budget-amount" className="budget-input" placeholder="Budget Amount" style={{ padding: '0.5rem', border: '1px solid var(--color-gray-300)', borderRadius: '0.375rem' }} />
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

                        const response = await fetch(`${API_BASE_URL}/api/budgets`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ userId: user.id, category: categoryId, limit: numericValue, month: selectedMonth })
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
                        border: '1px solid var(--color-gray-200)',
                        background: activeGroupId === group._id ? 'var(--color-primary-light)' : 'var(--color-gray-100)',
                        color: activeGroupId === group._id ? 'white' : 'var(--color-gray-600)',
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
                      border: '1px dashed var(--color-primary)',
                      background: 'transparent',
                      color: 'var(--color-primary)',
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
                    onClick={() => {
                       setEditingExpenseId(null);
                       setSplitDesc("");
                       setSplitAmount("");
                       setSplitPaidBy("");
                       setSplitInvolvedMembers([]);
                       setShowAddExpenseModal(true);
                    }}
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
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', color: 'var(--color-gray-900)' }}>Group Expenses</h3>
                    <div className="table-wrapper">
                      <table className="transactions-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Total Amount</th>
                            <th>Paid By</th>
                            <th>Split Among</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupExpenses.length > 0 ? groupExpenses.map((exp: any) => (
                            <tr key={exp._id}>
                              <td style={{ color: 'var(--color-gray-500)' }}>
                                {new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </td>
                              <td style={{ fontWeight: 500, color: 'var(--color-gray-900)' }}>{exp.description}</td>
                              <td style={{ fontWeight: 600, color: 'var(--color-gray-900)' }}>₹{exp.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                              <td style={{ color: 'var(--color-primary)', fontWeight: 500 }}>{exp.paidBy}</td>
                              <td style={{ color: 'var(--color-gray-600)', fontSize: '0.875rem' }}>
                                {exp.splitBetween.map((s: any) => s.member).join(', ')}
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button onClick={() => {
                                      setEditingExpenseId(exp._id);
                                      setSplitDesc(exp.description);
                                      setSplitAmount(exp.amount.toString());
                                      setSplitPaidBy(exp.paidBy);
                                      setSplitInvolvedMembers(exp.splitBetween.map((s:any)=>s.member));
                                      setShowAddExpenseModal(true);
                                    }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }} title="Edit">
                                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                                      <path d="M14 3L17 6L7 16H4V13L14 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                  </button>
                                  <button onClick={() => handleDeleteSplitExpense(exp._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)' }} title="Delete">
                                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                                      <path d="M4 5H16M6 5V15C6 16.1046 6.89543 17 8 17H12C13.1046 17 14 16.1046 14 15V5M8 5V3C8 2.44772 8.44772 2 9 2H11C11.5523 2 12 2.44772 12 3V5M8 9V13M12 9V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                                No expenses recorded for this group yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right side: Balances Summary */}
                  <div className="card" style={{ padding: '20px', background: 'var(--color-gray-100)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <div style={{ background: 'var(--color-primary-light)', padding: '8px', borderRadius: '8px', color: 'white', opacity: 0.8 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.44 3.59 2.95 1.89.47 2.42 1.14 2.42 1.92 0 .9-.85 1.56-2.18 1.56-1.57 0-2.25-.8-2.3-1.88h-1.71c.06 1.75 1.13 2.89 2.8 3.25V19h2.39v-1.7c1.55-.37 2.8-1.35 2.8-2.92.01-1.92-1.51-2.61-3.68-3.24z" fill="currentColor" />
                        </svg>
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-gray-900)' }}>Balance Summary</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {groupBalances.transactions.length > 0 ? groupBalances.transactions.map((tx: any, i: number) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--color-gray-50)', borderRadius: '8px', border: '1px solid var(--color-gray-200)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>Owes</span>
                            <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>{tx.from}</span>
                          </div>
                          <div style={{ color: 'var(--color-gray-400)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M5 12h14m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>Gets paid</span>
                            <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>{tx.to}</span>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-gray-900)', marginLeft: '12px' }}>
                            ₹{tx.amount.toLocaleString('en-IN')}
                          </div>
                        </div>
                      )) : (
                        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-gray-600)', fontSize: '0.9rem' }}>
                          Balances are settled up!
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--color-gray-100)', borderRadius: '12px', border: '1px dashed var(--color-gray-300)' }}>
                  <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-gray-200)', color: 'var(--color-gray-500)', marginBottom: '16px' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M17 20h5V4H2v16h5M7 15h10M7 11h10M7 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: '8px' }}>Select or create a Group</h3>
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
          <div style={{ background: 'var(--color-gray-100)', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--color-gray-200)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px', color: 'var(--color-gray-900)' }}>Create New Group</h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px', color: 'var(--color-gray-700)' }}>Group Name</label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-gray-300)', borderRadius: '6px', background: 'var(--color-gray-50)', color: 'var(--color-gray-900)' }}
                placeholder="e.g., Goa Trip 2026"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px', color: 'var(--color-gray-700)' }}>Members (Names)</label>
              {newGroupMembers.map((member, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={member}
                    onChange={(e) => {
                      const updated = [...newGroupMembers];
                      updated[index] = e.target.value;
                      setNewGroupMembers(updated);
                    }}
                    style={{ flex: 1, padding: '10px 12px', border: '1px solid var(--color-gray-300)', borderRadius: '6px', background: 'var(--color-gray-50)', color: 'var(--color-gray-900)' }}
                    placeholder="Member name"
                  />
                  {newGroupMembers.length > 1 && (
                    <button
                      onClick={() => setNewGroupMembers(newGroupMembers.filter((_, i) => i !== index))}
                      style={{ padding: '8px', background: 'var(--color-gray-200)', color: 'var(--color-gray-600)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >Remove</button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setNewGroupMembers([...newGroupMembers, ""])}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
              >+ Add Member</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowCreateGroupModal(false)}
                style={{ padding: '8px 16px', border: '1px solid var(--color-gray-300)', background: 'var(--color-gray-100)', color: 'var(--color-gray-700)', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
              >Cancel</button>
              <button
                onClick={handleCreateGroup}
                style={{ padding: '8px 16px', border: 'none', background: 'var(--color-primary)', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
              >Create Group</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SPLIT EXPENSE MODAL */}
      {showAddExpenseModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>
              {editingExpenseId ? "Edit Split Expense" : "Add Split Expense"}
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px', color: '#4b5563' }}>Description</label>
              <input
                type="text"
                value={splitDesc}
                onChange={(e) => setSplitDesc(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-gray-200)', borderRadius: '6px', background: 'var(--color-gray-50)', color: 'var(--color-gray-900)' }}
                placeholder="e.g., Dinner at Taj"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px', color: 'var(--color-gray-700)' }}>Total Amount</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--color-gray-400)' }}>₹</span>
                <input
                  type="number"
                  value={splitAmount}
                  onChange={(e) => setSplitAmount(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 28px', border: '1px solid var(--color-gray-200)', borderRadius: '6px', background: 'var(--color-gray-50)', color: 'var(--color-gray-900)' }}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px', color: '#4b5563' }}>Paid By</label>
              <select
                value={splitPaidBy}
                onChange={(e) => setSplitPaidBy(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-gray-200)', borderRadius: '6px', background: 'var(--color-gray-50)', color: 'var(--color-gray-900)' }}
              >
                <option value="" disabled>Select member who paid</option>
                {groups.find(g => g._id === activeGroupId)?.members.map((m: string) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px', color: 'var(--color-gray-700)' }}>Split Between (Equal Shares)</label>
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
                style={{ padding: '8px 16px', border: '1px solid var(--color-gray-200)', background: 'var(--color-gray-50)', color: 'var(--color-gray-700)', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
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
