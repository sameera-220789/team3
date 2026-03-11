import React, { useEffect } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      navigate("/admin-login", { replace: true });
    }
  }, [navigate]);

  const getPageTitle = () => {
    if (location.pathname.startsWith("/admin/users")) return "Users";
    if (location.pathname.startsWith("/admin/transactions")) return "Transactions";
    if (location.pathname.startsWith("/admin/alerts")) return "Alerts & Flags";
    if (location.pathname.startsWith("/admin/categories")) return "Categories";
    if (location.pathname.startsWith("/admin/logs")) return "System Logs";
    return "Admin Dashboard";
  };

  const getPageSubtitle = () => {
    if (location.pathname.startsWith("/admin/users"))
      return "Recent user activity and account insights";
    if (location.pathname.startsWith("/admin/transactions"))
      return "High-level view of platform transactions";
    if (location.pathname.startsWith("/admin/alerts"))
      return "Monitor suspicious and flagged activities";
    if (location.pathname.startsWith("/admin/categories"))
      return "Manage global spending categories";
    if (location.pathname.startsWith("/admin/logs"))
      return "System performance and health overview";
    return "System monitoring and management console";
  };

  return (
    <div className="dashboard-page admin-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="8" fill="url(#gradient-sidebar-admin)" />
              <path d="M20 10L28 20L20 30L12 20L20 10Z" fill="white" opacity="0.9" />
              <defs>
                <linearGradient id="gradient-sidebar-admin" x1="0" y1="0" x2="40" y2="40">
                  <stop offset="0%" style={{ stopColor: "#6366f1" }} />
                  <stop offset="100%" style={{ stopColor: "#8b5cf6" }} />
                </linearGradient>
              </defs>
            </svg>
            <span className="logo-text">ExpenseFlow</span>
          </div>
          <span className="admin-badge">ADMIN</span>
        </div>
        <nav className="sidebar-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Overview</span>
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 19C16.6569 19 18 17.6569 18 16C18 14.3431 16.6569 13 15 13C13.3431 13 12 14.3431 12 16C12 17.6569 13.3431 19 15 19Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 11C6.65685 11 8 9.65685 8 8C8 6.34315 6.65685 5 5 5C3.34315 5 2 6.34315 2 8C2 9.65685 3.34315 11 5 11Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M15 11C16.6569 11 18 9.65685 18 8C18 6.34315 16.6569 5 15 5C13.3431 5 12 6.34315 12 8C12 9.65685 13.3431 11 15 11Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 8H12M6.5 10L9 13M13.5 10L12 13" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Users</span>
          </NavLink>
          <NavLink
            to="/admin/transactions"
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 3V17H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M7 13L10 7L13 10L17 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Transactions</span>
          </NavLink>
          <NavLink
            to="/admin/alerts"
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Alerts & Flags</span>
          </NavLink>
          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 7L10 3L17 7V13C17 14 16 15 15 15H5C4 15 3 14 3 13V7Z" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Categories</span>
          </NavLink>
          <NavLink
            to="/admin/logs"
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 6V10L13 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>System Logs</span>
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <Link to="/dashboard" className="sidebar-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 7L10 3L17 7V17C17 17.5304 16.7893 18.0391 16.4142 18.4142C16.0391 18.7893 15.5304 19 15 19H5C4.46957 19 3.96086 18.7893 3.58579 18.4142C3.21071 18.0391 3 17.5304 3 17V7Z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>User View</span>
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
        <header className="page-header">
          <div className="page-header-content">
            <div>
              <h1 className="page-title">{getPageTitle()}</h1>
              <p className="page-subtitle">{getPageSubtitle()}</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4V10M10 10V16M10 10H16M10 10H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              System Settings
            </button>
            <button className="btn btn-primary">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 3L17 3V13L10 17L3 13V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Export Report
            </button>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
