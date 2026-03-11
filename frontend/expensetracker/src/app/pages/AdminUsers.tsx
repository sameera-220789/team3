export default function AdminUsers() {
  return (
    <div className="admin-grid">
      <div className="card col-span-2">
        <div className="card-header-section">
          <h3 className="card-title">Recent User Activity</h3>
          <div className="filter-tabs">
            <button className="filter-tab active">All</button>
            <button className="filter-tab">Sign Ups</button>
            <button className="filter-tab">Transactions</button>
          </div>
        </div>
        <div className="admin-activity-list">
          <div className="activity-item">
            <div className="activity-avatar">RK</div>
            <div className="activity-details">
              <p className="activity-title">
                <strong>Rajesh Kumar</strong> added expense of ₹2,400
              </p>
              <p className="activity-time">2 minutes ago</p>
            </div>
            <span className="activity-type expense">Expense</span>
          </div>
          <div className="activity-item">
            <div className="activity-avatar">PS</div>
            <div className="activity-details">
              <p className="activity-title">
                <strong>Priya Sharma</strong> created new account
              </p>
              <p className="activity-time">5 minutes ago</p>
            </div>
            <span className="activity-type signup">Sign Up</span>
          </div>
          <div className="activity-item">
            <div className="activity-avatar">AS</div>
            <div className="activity-details">
              <p className="activity-title">
                <strong>Amit Singh</strong> exceeded budget limit
              </p>
              <p className="activity-time">12 minutes ago</p>
            </div>
            <span className="activity-type alert">Alert</span>
          </div>
          <div className="activity-item">
            <div className="activity-avatar">MJ</div>
            <div className="activity-details">
              <p className="activity-title">
                <strong>Meera Joshi</strong> exported monthly report
              </p>
              <p className="activity-time">18 minutes ago</p>
            </div>
            <span className="activity-type report">Report</span>
          </div>
          <div className="activity-item">
            <div className="activity-avatar">NK</div>
            <div className="activity-details">
              <p className="activity-title">
                <strong>Nikhil Kapoor</strong> updated budget settings
              </p>
              <p className="activity-time">25 minutes ago</p>
            </div>
            <span className="activity-type update">Update</span>
          </div>
          <div className="activity-item">
            <div className="activity-avatar">ST</div>
            <div className="activity-details">
              <p className="activity-title">
                <strong>Sneha Tiwari</strong> deleted transaction
              </p>
              <p className="activity-time">32 minutes ago</p>
            </div>
            <span className="activity-type delete">Delete</span>
          </div>
        </div>
      </div>
    </div>
  );
}

