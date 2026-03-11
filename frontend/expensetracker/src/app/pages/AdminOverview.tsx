export default function AdminOverview() {
  return (
    <div className="admin-stats-grid">
      <div className="admin-stat-card">
        <div className="admin-stat-icon blue">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M16 20C20.4183 20 24 16.4183 24 12C24 7.58172 20.4183 4 16 4C11.5817 4 8 7.58172 8 12C8 16.4183 11.5817 20 16 20Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M4 28V26C4 23.7909 5.79086 22 8 22H24C26.2091 22 28 23.7909 28 26V28"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="admin-stat-content">
          <p className="admin-stat-label">Total Users</p>
          <p className="admin-stat-value">52,348</p>
          <p className="admin-stat-change positive">+1,240 this week</p>
        </div>
      </div>

      <div className="admin-stat-card">
        <div className="admin-stat-icon green">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M8 12L16 4L24 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M12 28V16H20V28"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x="8"
              y="12"
              width="16"
              height="16"
              rx="1"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="admin-stat-content">
          <p className="admin-stat-label">Active Users</p>
          <p className="admin-stat-value">38,562</p>
          <p className="admin-stat-change positive">73.6% activity rate</p>
        </div>
      </div>

      <div className="admin-stat-card">
        <div className="admin-stat-icon purple">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect
              x="4"
              y="8"
              width="24"
              height="18"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path d="M4 14H28" stroke="currentColor" strokeWidth="2" />
            <path
              d="M10 20H12M16 20H22"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="admin-stat-content">
          <p className="admin-stat-label">Total Transactions</p>
          <p className="admin-stat-value">2.54M</p>
          <p className="admin-stat-change positive">+54.2K today</p>
        </div>
      </div>

      <div className="admin-stat-card">
        <div className="admin-stat-icon orange">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M16 10V16M16 22H16.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="admin-stat-content">
          <p className="admin-stat-label">Flagged Activities</p>
          <p className="admin-stat-value">127</p>
          <p className="admin-stat-change warning">18 require attention</p>
        </div>
      </div>

      <div className="admin-stat-card">
        <div className="admin-stat-icon red">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M16 8V16L22 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="admin-stat-content">
          <p className="admin-stat-label">Money Tracked</p>
          <p className="admin-stat-value">₹485.2Cr</p>
          <p className="admin-stat-change positive">+12.8% this month</p>
        </div>
      </div>

      <div className="admin-stat-card">
        <div className="admin-stat-icon teal">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M16 4L4 10L16 16L28 10L16 4Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 22L16 28L28 22"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 16L16 22L28 16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="admin-stat-content">
          <p className="admin-stat-label">New Signups Today</p>
          <p className="admin-stat-value">186</p>
          <p className="admin-stat-change positive">+24% vs yesterday</p>
        </div>
      </div>
    </div>
  );
}

