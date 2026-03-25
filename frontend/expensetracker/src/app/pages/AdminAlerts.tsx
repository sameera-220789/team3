import { useEffect, useState } from "react";

interface Alert {
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  time: string;
  actions: string[];
}

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/alerts", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setAlerts(await res.json());
      } catch (err) {
        console.error("Admin alerts fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [token]);

  return (
    <div className="admin-grid">
      <div className="card">
        <div className="card-header-section">
          <h3 className="card-title">Suspicious Activity</h3>
          {!loading && <span className="alert-count">{alerts.length}</span>}
        </div>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-muted-foreground, #6b7280)" }}>
            Loading alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-muted-foreground, #6b7280)" }}>
            No suspicious activity detected.
          </div>
        ) : (
          <div className="suspicious-list">
            {alerts.map((alert, i) => (
              <div key={i} className={`suspicious-item ${alert.severity}`}>
                <div className="suspicious-header">
                  <span className={`suspicious-severity ${alert.severity}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className="suspicious-time">{timeAgo(alert.time)}</span>
                </div>
                <p className="suspicious-title">{alert.title}</p>
                <p className="suspicious-desc">{alert.description}</p>
                <div className="suspicious-actions">
                  {alert.actions?.map((action, j) => (
                    <button key={j} className="btn-link">{action}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <button className="view-all-btn">View All Alerts →</button>
      </div>
    </div>
  );
}
