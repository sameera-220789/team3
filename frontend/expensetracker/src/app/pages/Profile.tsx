import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser } from "../utils/api";
import { ThemeToggle } from "../components/ThemeToggle";

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  currency: string;
  memberSince: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const localUser = getUser();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localUser) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/auth/profile?userId=${localUser.id}`
        );
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          const errData = await res.json();
          setError(errData.message || "Failed to load profile.");
        }
      } catch (err) {
        setError("Network error. Could not load profile.");
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="8" fill="url(#gradient-sidebar-p)" />
              <path d="M20 10L28 20L20 30L12 20L20 10Z" fill="white" opacity="0.9" />
              <defs>
                <linearGradient id="gradient-sidebar-p" x1="0" y1="0" x2="40" y2="40">
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
          <Link to="/profile" className="sidebar-link active">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 11C12.2091 11 14 9.20914 14 7C14 4.79086 12.2091 3 10 3C7.79086 3 6 4.79086 6 7C6 9.20914 7.79086 11 10 11Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 17V16C3 14.3431 4.34315 13 6 13H14C15.6569 13 17 14.3431 17 16V17" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Profile</span>
          </Link>
          <button
            className="sidebar-link logout-btn"
            onClick={() => { localStorage.clear(); navigate("/login"); }}
          >
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
            <h1 className="budget-page-title">My Profile</h1>
            <p className="budget-page-subtitle">Your account information and details</p>
          </div>
          <div className="budget-header-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <ThemeToggle />
            <div className="user-panel">
              <div className="user-avatar">
                {localUser?.firstName?.[0] || "U"}{localUser?.lastName?.[0] || ""}
              </div>
              <div className="user-info">
                <p className="user-name">{localUser?.firstName} {localUser?.lastName}</p>
                <p className="user-role">Personal Account</p>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          {loading && (
            <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>⏳</div>
              <p style={{ color: "var(--color-gray-500)", fontWeight: 500 }}>Loading your profile...</p>
            </div>
          )}

          {error && !loading && (
            <div className="card" style={{ padding: "2rem", textAlign: "center", borderLeft: "4px solid #ef4444" }}>
              <p style={{ color: "#ef4444", fontWeight: 600 }}>⚠️ {error}</p>
            </div>
          )}

          {profile && !loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "700px" }}>

              {/* Hero Banner Card */}
              <div className="card" style={{
                padding: "2rem",
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                color: "white",
                borderRadius: "1rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  {/* Avatar circle */}
                  <div style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    flexShrink: 0,
                    border: "3px solid rgba(255,255,255,0.4)",
                    letterSpacing: "0.05em"
                  }}>
                    {profile.firstName?.[0]?.toUpperCase()}{profile.lastName?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <p style={{ margin: "0.35rem 0 0", opacity: 0.85, fontSize: "0.95rem" }}>{profile.email}</p>
                    <span style={{
                      display: "inline-block",
                      marginTop: "0.6rem",
                      padding: "2px 12px",
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      letterSpacing: "0.04em"
                    }}>
                      Personal Account
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Details Card */}
              <div className="card" style={{ padding: "1.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 11C12.2091 11 14 9.20914 14 7C14 4.79086 12.2091 3 10 3C7.79086 3 6 4.79086 6 7C6 9.20914 7.79086 11 10 11Z" stroke="#6366f1" strokeWidth="1.5" />
                    <path d="M3 17V16C3 14.3431 4.34315 13 6 13H14C15.6569 13 17 14.3431 17 16V17" stroke="#6366f1" strokeWidth="1.5" />
                  </svg>
                  <h3 className="card-title" style={{ margin: 0 }}>Account Details</h3>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <ProfileRow icon="👤" label="First Name" value={profile.firstName} />
                  <ProfileRow icon="👤" label="Last Name" value={profile.lastName} />
                  <ProfileRow icon="✉️" label="Email Address" value={profile.email} />
                  <ProfileRow icon="💱" label="Currency" value={profile.currency} />
                  <ProfileRow
                    icon="📅"
                    label="Member Since"
                    value={new Date(profile.memberSince).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                    isLast
                  />
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ProfileRow({
  icon,
  label,
  value,
  isLast = false
}: {
  icon: string;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      padding: "0.875rem 0",
      borderBottom: isLast ? "none" : "1px solid var(--color-gray-100)",
      gap: "0.75rem"
    }}>
      <span style={{ fontSize: "1.1rem", width: "24px", textAlign: "center", flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: "0.875rem", color: "var(--color-gray-500)", fontWeight: 500, flex: 1 }}>{label}</span>
      <span style={{
        fontSize: "0.875rem",
        color: "var(--color-gray-900)",
        fontWeight: 600,
        background: "var(--color-gray-100)",
        padding: "4px 12px",
        borderRadius: "0.375rem",
        maxWidth: "280px",
        wordBreak: "break-word",
        textAlign: "right"
      }}>{value}</span>
    </div>
  );
}
