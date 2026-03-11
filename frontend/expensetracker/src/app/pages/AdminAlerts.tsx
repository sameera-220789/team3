export default function AdminAlerts() {
  return (
    <div className="admin-grid">
      <div className="card">
        <div className="card-header-section">
          <h3 className="card-title">Suspicious Activity</h3>
          <span className="alert-count">18</span>
        </div>
        <div className="suspicious-list">
          <div className="suspicious-item high">
            <div className="suspicious-header">
              <span className="suspicious-severity high">HIGH</span>
              <span className="suspicious-time">5 min ago</span>
            </div>
            <p className="suspicious-title">Unusual Large Transaction</p>
            <p className="suspicious-desc">User: Raj Mehta - ₹1,50,000 expense</p>
            <div className="suspicious-actions">
              <button className="btn-link">Review</button>
              <button className="btn-link">Flag</button>
            </div>
          </div>
          <div className="suspicious-item medium">
            <div className="suspicious-header">
              <span className="suspicious-severity medium">MEDIUM</span>
              <span className="suspicious-time">15 min ago</span>
            </div>
            <p className="suspicious-title">Multiple Failed Login Attempts</p>
            <p className="suspicious-desc">User: ankit@email.com - 8 attempts</p>
            <div className="suspicious-actions">
              <button className="btn-link">Review</button>
              <button className="btn-link">Block</button>
            </div>
          </div>
          <div className="suspicious-item low">
            <div className="suspicious-header">
              <span className="suspicious-severity low">LOW</span>
              <span className="suspicious-time">1 hour ago</span>
            </div>
            <p className="suspicious-title">Rapid Transaction Entry</p>
            <p className="suspicious-desc">
              User: Kavita - 25 transactions in 2 mins
            </p>
            <div className="suspicious-actions">
              <button className="btn-link">Review</button>
              <button className="btn-link">Ignore</button>
            </div>
          </div>
          <div className="suspicious-item medium">
            <div className="suspicious-header">
              <span className="suspicious-severity medium">MEDIUM</span>
              <span className="suspicious-time">2 hours ago</span>
            </div>
            <p className="suspicious-title">Unusual Spending Pattern</p>
            <p className="suspicious-desc">
              User: Deepak - 500% increase this week
            </p>
            <div className="suspicious-actions">
              <button className="btn-link">Review</button>
              <button className="btn-link">Contact</button>
            </div>
          </div>
        </div>
        <button className="view-all-btn">View All Alerts →</button>
      </div>
    </div>
  );
}

