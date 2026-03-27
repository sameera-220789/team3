import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser } from "../utils/api";
import { ThemeToggle } from "../components/ThemeToggle";
import { API_BASE_URL } from "../utils/config";

export default function AddIncome() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("salary");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const getCategoryEmoji = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "salary": return "💰";
      case "side job": return "🛠️";
      case "investment": return "📈";
      case "bonus": return "🎊";
      case "dividend": return "💸";
      case "rent": return "🏠";
      case "gift": return "🎁";
      default: return "💼";
    }
  };

  useEffect(() => {
    setCurrentUser(getUser());
  }, []);

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = getUser();
      if (!user) {
        alert("Please login first");
        navigate("/login");
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/income/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          amount: Number(amount),
          category,
          date,
          notes
        })
      });

      if (response.ok) {
        alert("Income added successfully!");
        setAmount("");
        setNotes("");
        // Optional: wait a moment then navigate back to dashboard
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        alert(`Failed to add income: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error adding income:", error);
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="12" fill="url(#expense-logo-bg2)" />
              <path d="M12 28L18 20L22 24L28 14" stroke="url(#expense-logo-line2)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="28" cy="14" r="3" fill="#ffffff" />
              <path d="M12 14L12 28L28 28" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="logo-text">ExpenseFlow</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="sidebar-link">
            <span>Dashboard</span>
          </Link>
          <Link to="/add-expense" className="sidebar-link">
            <span>Add Expense</span>
          </Link>
          <Link to="/add-income" className="sidebar-link active">
            <span>Add Income</span>
          </Link>
          <Link to="/budget" className="sidebar-link">
            <span>Budgets</span>
          </Link>
          <Link to="/goals" className="sidebar-link">
            <span>Goals & Reminders</span>
          </Link>
          <Link to="/dashboard/transactions" className="sidebar-link">
            <span>Transactions</span>
          </Link>
          <Link to="/dashboard/reports" className="sidebar-link">
            <span>Reports</span>
          </Link>
        </nav>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div className="page-header-content">
            <h1 className="page-title">Add Income</h1>
            <p className="page-subtitle">Record your new earnings smoothly</p>
          </div>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ThemeToggle />
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </header>

        <div className="page-content">
          <div className="expense-layout" style={{ justifyContent: 'center' }}>
            <div className="expense-form-container" style={{ maxWidth: '600px', width: '100%' }}>
              <div className="card">
                <div className="card-header-section">
                  <h2 className="card-title">Income Details</h2>
                  <p className="card-subtitle">Fill in the information below</p>
                </div>
                <form className="expense-form" onSubmit={handleAddIncome}>
                  <div className="form-group">
                    <label htmlFor="amount" className="form-label required">Amount</label>
                    <div className="amount-input-wrapper">
                      <span className="currency-symbol">{currentUser?.currency === 'USD' ? '$' : '₹'}</span>
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
                    <div className="category-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                      {["salary", "side job", "investment", "bonus", "dividend", "rent", "gift", "others"].map((cat) => (
                        <label className="category-option" key={cat}>
                          <input type="radio" name="category" value={cat} required checked={category === cat} onChange={() => setCategory(cat)} />
                          <div className="category-card" style={{ padding: '12px 8px' }}>
                            <span className="category-emoji" style={{ fontSize: '24px' }}>{getCategoryEmoji(cat)}</span>
                            <span className="category-name" style={{ fontSize: '11px', textTransform: 'capitalize' }}>{cat}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="date" className="form-label required">Date</label>
                    <input
                      type="date"
                      id="date"
                      className="form-input"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="notes" className="form-label">Notes (Optional)</label>
                    <textarea
                      id="notes"
                      className="form-input form-textarea"
                      placeholder="Add notes about this income..."
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary btn-large" disabled={loading} style={{ width: '100%' }}>
                      {loading ? "Adding..." : "Add Income"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
