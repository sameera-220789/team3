export default function AdminLogs() {
  return (
    <div className="admin-grid">
      <div className="card">
        <div className="card-header-section">
          <h3 className="card-title">System Health</h3>
          <span className="status-badge online">All Systems Online</span>
        </div>
        <div className="system-health-list">
          <div className="health-item">
            <div className="health-header">
              <span className="health-label">API Response Time</span>
              <span className="health-status success">Healthy</span>
            </div>
            <div className="health-bar">
              <div
                className="health-fill success"
                style={{ width: "95%" }}
              ></div>
            </div>
            <p className="health-value">45ms avg</p>
          </div>
          <div className="health-item">
            <div className="health-header">
              <span className="health-label">Database Performance</span>
              <span className="health-status success">Healthy</span>
            </div>
            <div className="health-bar">
              <div
                className="health-fill success"
                style={{ width: "92%" }}
              ></div>
            </div>
            <p className="health-value">12ms avg</p>
          </div>
          <div className="health-item">
            <div className="health-header">
              <span className="health-label">Server Load</span>
              <span className="health-status warning">Moderate</span>
            </div>
            <div className="health-bar">
              <div
                className="health-fill warning"
                style={{ width: "68%" }}
              ></div>
            </div>
            <p className="health-value">68% usage</p>
          </div>
          <div className="health-item">
            <div className="health-header">
              <span className="health-label">Storage Capacity</span>
              <span className="health-status success">Healthy</span>
            </div>
            <div className="health-bar">
              <div
                className="health-fill success"
                style={{ width: "45%" }}
              ></div>
            </div>
            <p className="health-value">45% used</p>
          </div>
          <div className="health-item">
            <div className="health-header">
              <span className="health-label">Uptime</span>
              <span className="health-status success">Excellent</span>
            </div>
            <div className="health-bar">
              <div
                className="health-fill success"
                style={{ width: "99.9%" }}
              ></div>
            </div>
            <p className="health-value">99.9%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

