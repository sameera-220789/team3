import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ThemeToggle } from "../components/ThemeToggle";
import { getUser } from "../utils/api";
import { API_BASE_URL } from "../utils/config";

export default function Goals() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<any[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [unallocatedBudget, setUnallocatedBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [recurringBills, setRecurringBills] = useState<any[]>([]);

  // Recurring Bill Form State
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [billCategory, setBillCategory] = useState("bills");
  const [billAmount, setBillAmount] = useState("");
  const [billDescription, setBillDescription] = useState("");
  const [billDueDate, setBillDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [billRecurrence, setBillRecurrence] = useState("monthly");
  const [billReminderInterval, setBillReminderInterval] = useState("24");

  // Modals
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  // New Goal Form
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  // Add Money Form
  const [addAmount, setAddAmount] = useState("");
  const [source, setSource] = useState("savings");

  const fetchData = async () => {
    try {
      const user = getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setCurrentUser(user);
      
      const month = new Date().toISOString().slice(0, 7);

      const [goalsRes, profileRes, budgetRes, recurringRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/goals?userId=${user.id}`, { cache: "no-store" }),
        fetch(`${API_BASE_URL}/api/auth/profile?userId=${user.id}`, { cache: "no-store" }),
        fetch(`${API_BASE_URL}/api/budgets?userId=${user.id}&month=${month}`, { cache: "no-store" }),
        fetch(`${API_BASE_URL}/api/recurring?userId=${user.id}`, { cache: "no-store" })
      ]);

      if (goalsRes.ok) setGoals(await goalsRes.json());
      if (recurringRes.ok) setRecurringBills(await recurringRes.json());
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setTotalSavings(profile.totalSavings || 0);
      }
      if (budgetRes.ok) {
        const budgets = await budgetRes.json();
        const totalDoc = budgets.find((b: any) => b.category === 'total');
        const totalLimit = totalDoc ? totalDoc.limit : 0;
        const catTotal = budgets.filter((b: any) => b.category !== 'total').reduce((s: number, b: any) => s + b.limit, 0);
        setUnallocatedBudget(Math.max(0, totalLimit - catTotal));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !targetAmount) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          goalName,
          targetAmount: Number(targetAmount),
          deadline: deadline || null
        })
      });
      if (res.ok) {
        setShowAddGoalModal(false);
        setGoalName("");
        setTargetAmount("");
        setDeadline("");
        fetchData();
      } else {
        alert("Failed to create goal");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addAmount || !selectedGoal) return;
    const amountNum = Number(addAmount);
    
    // Check if enough funds
    if (source === 'savings' && amountNum > totalSavings) {
      alert("Insufficient Savings");
      return;
    }
    if (source === 'unallocated' && amountNum > unallocatedBudget) {
      alert("Insufficient Unallocated Budget for this month");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/goals/${selectedGoal._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNum,
          source,
          month: new Date().toISOString().slice(0, 7)
        })
      });
      if (res.ok) {
        setShowAddMoneyModal(false);
        setSelectedGoal(null);
        setAddAmount("");
        fetchData(); // re-fetch to see new balances
      } else {
        const data = await res.json();
        alert(data.message || "Failed to add money");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Delete this goal?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/goals/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/recurring/${id}/pay`, {
        method: "PUT"
      });
      if (res.ok) {
        alert("Bill marked as paid and next cycle scheduled!");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/recurring`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          category: billCategory,
          amount: Number(billAmount),
          description: billDescription,
          dueDate: billDueDate,
          recurrence: billRecurrence,
          reminderInterval: Number(billReminderInterval)
        })
      });

      if (res.ok) {
        alert("Recurring bill added!");
        setShowAddBillModal(false);
        setBillAmount("");
        setBillDescription("");
        fetchData();
      } else {
        alert("Failed to add bill");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBill = async (id: string) => {
    if (!window.confirm("Delete this recurring bill?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/recurring/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
  <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="12" fill="url(#expense-logo-bg2)" />
    <path d="M12 28L18 20L22 24L28 14" stroke="url(#expense-logo-line2)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="28" cy="14" r="3" fill="#ffffff" />
    <path d="M12 14L12 28L28 28" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="expense-logo-bg2" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="50%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#DB2777" />
      </linearGradient>
      <linearGradient id="expense-logo-line2" x1="12" y1="28" x2="28" y2="14" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#A78BFA" />
        <stop offset="100%" stopColor="#FDF4FF" />
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
          <Link to="/budget" className="sidebar-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 6V10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Budgets</span>
          </Link>
            <Link to="/goals" className="sidebar-link active">
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
        <header className="budget-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', background: 'var(--color-background)', borderBottom: '1px solid var(--color-gray-200)', position: 'sticky', top: 0, zIndex: 10 }}>
          <div className="budget-header-left">
            <h1 className="budget-page-title" style={{ fontSize: '1.75rem', fontWeight: 700 }}>Goals & Reminders</h1>
            <p className="budget-page-subtitle" style={{ color: 'var(--color-gray-500)', marginTop: '0.25rem' }}>Track targets and manage repeating bills</p>
          </div>
          <div className="budget-header-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <ThemeToggle />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowAddBillModal(true)}
                style={{ borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add Reminder
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => setShowAddGoalModal(true)}
                style={{
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 5V15M5 10H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Add Goal
              </button>
            </div>
          </div>
        </header>

        <div className="page-content" style={{ padding: '2rem' }}>
          {/* Quick Stats: Unallocated Budget & Savings */}
          <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
            <div className="stat-card" style={{ background: 'var(--color-success-light)', border: '1px solid var(--color-success)', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.1)' }}>
              <div className="stat-header">
                <div className="stat-icon-wrapper" style={{ background: 'var(--color-success)', color: '#fff', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="stat-label">Available Savings</span>
              </div>
              <p className="stat-value" style={{ color: 'var(--color-success)', fontWeight: 700 }}>₹{totalSavings.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
            
            <div className="stat-card" style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary)', boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.1)' }}>
              <div className="stat-header">
                <div className="stat-icon-wrapper" style={{ background: 'var(--color-primary)', color: '#fff', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 21V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V14M3 21H15M3 21H19C20.1046 21 21 20.1046 21 19V14M15 21H21V19M15 21V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="stat-label">Unallocated Budget (Current Month)</span>
              </div>
              <p className="stat-value" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>₹{unallocatedBudget.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
          </div>

          {/* Goals Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.75rem' }}>
            {goals.map(goal => {
              const progress = Math.min(100, (goal.savedAmount / goal.targetAmount) * 100);
              const isCompleted = goal.status === 'completed' || progress >= 100;
              return (
                <div 
                  key={goal._id} 
                  className="card" 
                  style={{ 
                    position: 'relative', 
                    overflow: 'hidden',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: 'var(--shadow-md)',
                    border: isCompleted ? '1px solid #10b981' : '1px solid var(--color-gray-200)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    cursor: 'default'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                >
                  {isCompleted && (
                    <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--color-success)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Completed
                    </div>
                  )}
                  
                  <div style={{ paddingRight: isCompleted ? '90px' : '30px' }}>
                    <h3 style={{ fontSize: '1.35rem', marginBottom: '0.2rem', fontWeight: 700, color: 'var(--color-gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{goal.goalName}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)', marginBottom: '1.5rem', fontWeight: 500 }}>
                      {goal.deadline ? `Target: ${new Date(goal.deadline).toLocaleDateString(undefined, {month: 'long', day: 'numeric', year: 'numeric'})}` : 'No deadline set'}
                    </p>
                  </div>
                  
                  {/* Progress Info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.95rem' }}>
                    <span style={{ color: isCompleted ? 'var(--color-success)' : 'var(--color-gray-700)' }}>₹{goal.savedAmount.toLocaleString()} saved <span style={{fontSize:'0.8rem', opacity: 0.8}}>({progress.toFixed(1)}%)</span></span>
                    <span style={{ color: 'var(--color-gray-500)' }}>₹{goal.targetAmount.toLocaleString()} target</span>
                  </div>

                  {/* Enhanced Progress Bar */}
                  <div style={{ height: '14px', background: 'var(--color-gray-200)', borderRadius: '7px', overflow: 'hidden', marginBottom: '1.75rem', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)', position: 'relative' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${progress}%`, 
                      background: isCompleted ? 'linear-gradient(90deg, var(--color-success), #34d399)' : 'linear-gradient(90deg, var(--color-primary), #8b5cf6)', 
                      transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      borderRadius: '7px'
                    }}></div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {!isCompleted && (
                      <button 
                        className="btn" 
                        style={{ 
                          flex: 1, 
                          background: 'var(--color-primary-light)', 
                          color: 'var(--color-primary)', 
                          fontWeight: 600,
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#e0e7ff'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-primary-light)'}
                        onClick={() => {
                          setSelectedGoal(goal);
                          setShowAddMoneyModal(true);
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                        Add Money
                      </button>
                    )}
                    
                    <button 
                      className="btn" 
                      style={{ 
                        color: 'var(--color-danger)', 
                        background: 'transparent',
                        border: '1px solid var(--color-danger-light)', 
                        padding: '0.75rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        flex: isCompleted ? 1 : 'unset', 
                        justifyContent: 'center',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-danger-light)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={(e) => handleDelete(goal._id, e)}
                      title="Delete Goal"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path>
                      </svg>
                      {isCompleted && <span style={{ fontWeight: 600 }}>Delete Goal</span>}
                    </button>
                  </div>
                </div>
              );
            })}
            
            {/* Empty State Illustration */}
            {goals.length === 0 && !loading && (
              <div style={{ gridColumn: '1 / -1', padding: '4rem 2rem', textAlign: 'center', background: 'var(--color-gray-50)', borderRadius: '1rem', border: '2px dashed var(--color-gray-300)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ background: '#e0e7ff', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: '0.5rem' }}>No goals yet</h3>
                <p style={{ color: 'var(--color-gray-500)', fontSize: '1.1rem', maxWidth: '400px', marginBottom: '2rem' }}>Dreaming of a new laptop, a vacation, or just building an emergency fund? Set a new target to start tracking!</p>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setShowAddGoalModal(true)}
                  style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600 }}
                >
                  Create Your First Goal
                </button>
              </div>
            )}
          </div>

          {/* Recurring Bills Checklist Section */}
          <div style={{ marginTop: '3.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Recurring Bills & Reminders 📝</h2>
                <p style={{ color: 'var(--color-gray-500)', marginTop: '0.25rem' }}>Stay on top of your repeating payments to reach your goals</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {recurringBills.length > 0 ? recurringBills.map(bill => (
                <div key={bill._id} className="card" style={{ 
                  borderRadius: '12px', padding: '1.25rem', borderLeft: `4px solid ${bill.status === 'overdue' ? 'var(--color-danger)' : 'var(--color-primary)'}`,
                  display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--color-surface)',
                  boxShadow: 'var(--shadow-md)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{bill.description || bill.category}</h4>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-gray-500)' }}>
                        Due: {new Date(bill.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className={`badge ${bill.status}`} style={{ 
                        fontSize: '0.75rem', padding: '2px 10px', borderRadius: '12px',
                        backgroundColor: bill.status === 'overdue' ? '#fee2e2' : '#fef3c7',
                        color: bill.status === 'overdue' ? '#991b1b' : '#92400e',
                        fontWeight: 600
                      }}>
                        {bill.status.toUpperCase()}
                      </span>
                      <button onClick={() => handleDeleteBill(bill._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>🗑️</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>₹{bill.amount.toLocaleString()}</span>
                    <button 
                      onClick={() => handleMarkAsPaid(bill._id)}
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                      Mark as Paid
                    </button>
                  </div>
                </div>
              )) : (
                <div style={{ gridColumn: '1 / -1', padding: '2.5rem', textAlign: 'center', background: 'var(--color-gray-50)', borderRadius: '12px', border: '1px dashed var(--color-gray-300)', color: 'var(--color-gray-500)' }}>
                  No recurring bills setup. Track your repeating expenses here.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="modal-content" style={{ background: 'var(--color-background)', padding: '2.5rem', width: '100%', maxWidth: '420px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-gray-900)' }}>Create New Goal</h2>
            <form onSubmit={handleCreateGoal}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label required" style={{ fontWeight: 600 }}>Goal Name</label>
                <input type="text" className="form-input" required value={goalName} onChange={e => setGoalName(e.target.value)} placeholder="e.g. Dream Vacation" style={{ padding: '0.75rem', borderRadius: '8px' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label required" style={{ fontWeight: 600 }}>Target Amount (₹)</label>
                <input type="number" min="1" className="form-input" required value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="50000" style={{ padding: '0.75rem', borderRadius: '8px' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Deadline (Optional)</label>
                <input type="date" className="form-input" value={deadline} onChange={e => setDeadline(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', fontWeight: 600 }} onClick={() => setShowAddGoalModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', fontWeight: 600 }}>Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Money Modal */}
      {showAddMoneyModal && selectedGoal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="modal-content" style={{ background: 'var(--color-background)', padding: '2.5rem', width: '100%', maxWidth: '420px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-gray-900)' }}>Fund Goal</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--color-gray-500)', fontWeight: 500 }}>Target: <span style={{ color: 'var(--color-primary)' }}>{selectedGoal.goalName}</span></p>
            
            <div style={{ background: 'var(--color-gray-50)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--color-gray-200)', display: 'flex', justifyContent: 'space-between' }}>
               <span style={{ fontWeight: 600, color: 'var(--color-gray-700)' }}>Remaining to save:</span>
               <span style={{ fontWeight: 700, color: 'var(--color-gray-900)' }}>₹{(selectedGoal.targetAmount - selectedGoal.savedAmount).toLocaleString()}</span>
            </div>

            <form onSubmit={handleAddMoney}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label required" style={{ fontWeight: 600 }}>Amount to Add (₹)</label>
                <input type="number" min="1" max={selectedGoal.targetAmount - selectedGoal.savedAmount} className="form-input" required value={addAmount} onChange={e => setAddAmount(e.target.value)} placeholder="e.g. 5000" style={{ padding: '0.75rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 600 }} />
              </div>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label required" style={{ fontWeight: 600 }}>Fund Source</label>
                <select className="form-input form-select" value={source} onChange={e => setSource(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--color-gray-50)' }}>
                  <option value="savings">Available Savings (₹{totalSavings.toLocaleString()})</option>
                  <option value="unallocated">Unallocated Monthly Budget (₹{unallocatedBudget.toLocaleString()})</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', fontWeight: 600 }} onClick={() => setShowAddMoneyModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', fontWeight: 600 }}>Add Funds</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add Money Modal code ... */}
      {/* Add Recurring Bill Modal */}
      {showAddBillModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="modal-content" style={{ background: 'var(--color-background)', padding: '2.5rem', width: '100%', maxWidth: '450px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-gray-900)' }}>Setup Recurring Bill</h2>
            <form onSubmit={handleCreateBill}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Category</label>
                  <select className="form-input" value={billCategory} onChange={e => setBillCategory(e.target.value)}>
                    <option value="bills">Bills & Utilities</option>
                    <option value="subscriptions">Subscriptions</option>
                    <option value="rent">Rent</option>
                    <option value="insurance">Insurance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Amount (₹)</label>
                  <input type="number" className="form-input" value={billAmount} onChange={e => setBillAmount(e.target.value)} required placeholder="e.g. 500" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>First Due Date</label>
                  <input type="date" className="form-input" value={billDueDate} onChange={e => setBillDueDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Recurrence</label>
                  <select className="form-input" value={billRecurrence} onChange={e => setBillRecurrence(e.target.value)}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Description</label>
                <input type="text" className="form-input" value={billDescription} onChange={e => setBillDescription(e.target.value)} placeholder="e.g. Electricity, Netflix" />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', fontWeight: 600 }} onClick={() => setShowAddBillModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', fontWeight: 600 }}>Save Bill</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
