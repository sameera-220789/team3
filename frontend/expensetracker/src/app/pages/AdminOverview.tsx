import { useEffect, useState } from "react";

interface Stats {
  totalUsers: number;
  totalExpenses: number;
  totalSpending: number;
  totalBudgets: number;
  newUsersThisWeek: number;
  expensesToday: number;
  apiRequests: number;
  serverStatus: string;
  dbStatus: string;
}

interface Activity {
  type: string;
  userName: string;
  action: string;
  time: string;
}

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getActivityColor(type: string) {
  switch (type) {
    case "expense": return "expense";
    case "signup": return "signup";
    case "budget": return "update";
    default: return "update";
  }
}

function getActivityLabel(type: string) {
  switch (type) {
    case "expense": return "Expense";
    case "signup": return "Sign Up";
    case "budget": return "Budget";
    default: return "Activity";
  }
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activitiesRes] = await Promise.all([
          fetch("http://localhost:5000/api/admin/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/admin/activities", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (activitiesRes.ok) setActivities(await activitiesRes.json());
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [token]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", color: "var(--color-muted-foreground, #6b7280)" }}>
        Loading dashboard data…
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Stats Grid */}
      <div className="admin-stats-grid">
        {/* Total Users */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 20C20.4183 20 24 16.4183 24 12C24 7.58172 20.4183 4 16 4C11.5817 4 8 7.58172 8 12C8 16.4183 11.5817 20 16 20Z" stroke="currentColor" strokeWidth="2" />
              <path d="M4 28V26C4 23.7909 5.79086 22 8 22H24C26.2091 22 28 23.7909 28 26V28" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <div className="admin-stat-content">
            <p className="admin-stat-label">Total Users</p>
            <p className="admin-stat-value">{stats?.totalUsers?.toLocaleString("en-IN") ?? "—"}</p>
            <p className="admin-stat-change positive">+{stats?.newUsersThisWeek ?? 0} this week</p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon purple">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="8" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M4 14H28" stroke="currentColor" strokeWidth="2" />
              <path d="M10 20H12M16 20H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="admin-stat-content">
            <p className="admin-stat-label">Total Expenses</p>
            <p className="admin-stat-value">{stats?.totalExpenses?.toLocaleString("en-IN") ?? "—"}</p>
            <p className="admin-stat-change positive">+{stats?.expensesToday ?? 0} today</p>
          </div>
        </div>

        {/* Total Budgets */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon green">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M6 26V10L16 4L26 10V26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <rect x="12" y="18" width="8" height="8" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <div className="admin-stat-content">
            <p className="admin-stat-label">Total Budgets</p>
            <p className="admin-stat-value">{stats?.totalBudgets?.toLocaleString("en-IN") ?? "—"}</p>
            <p className="admin-stat-change positive">across all users</p>
          </div>
        </div>

        {/* Total Spending */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon orange">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" />
              <path d="M16 9V16M16 16L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M11 19C12.5 21 14.5 22 16.5 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="admin-stat-content">
            <p className="admin-stat-label">Total Spending</p>
            <p className="admin-stat-value">₹{(stats?.totalSpending ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
            <p className="admin-stat-change positive">platform-wide</p>
          </div>
        </div>

        {/* API Requests */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon teal">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M4 16H28M16 4V28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M8 10L4 16L8 22M24 10L28 16L24 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="admin-stat-content">
            <p className="admin-stat-label">API Requests</p>
            <p className="admin-stat-value">{stats?.apiRequests?.toLocaleString("en-IN") ?? "—"}</p>
            <p className="admin-stat-change positive">since server start</p>
          </div>
        </div>

        {/* Server Status */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon red">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="4" width="24" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
              <rect x="4" y="20" width="24" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
              <circle cx="26" cy="8" r="2" fill="currentColor" />
              <circle cx="26" cy="24" r="2" fill="currentColor" />
            </svg>
          </div>
          <div className="admin-stat-content">
            <p className="admin-stat-label">System Status</p>
            <p className="admin-stat-value" style={{ fontSize: "18px", textTransform: "capitalize" }}>
              {stats?.serverStatus ?? "—"}
            </p>
            <p className="admin-stat-change positive">DB: {stats?.dbStatus ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="card">
        <div className="card-header-section">
          <h3 className="card-title">Recent Platform Activity</h3>
          <span className="status-badge online">Live</span>
        </div>
        <div className="admin-activity-list">
          {activities.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--color-muted-foreground, #6b7280)" }}>
              No recent activity found.
            </div>
          ) : (
            activities.slice(0, 10).map((act, i) => {
              const initials = act.userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <div key={i} className="activity-item">
                  <div className="activity-avatar">{initials}</div>
                  <div className="activity-details">
                    <p className="activity-title">
                      <strong>{act.userName}</strong> {act.action}
                    </p>
                    <p className="activity-time">{timeAgo(act.time)}</p>
                  </div>
                  <span className={`activity-type ${getActivityColor(act.type)}`}>
                    {getActivityLabel(act.type)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
