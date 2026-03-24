import { useEffect, useState } from "react";

interface Activity {
  type: string;
  userName: string;
  action: string;
  time: string;
}

interface SystemHealth {
  server: string;
  database: string;
  apiRequests: number;
  uptime: number;
  timestamp: string;
}

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function AdminLogs() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [healthRes, actRes] = await Promise.all([
          fetch("http://localhost:5000/api/admin/system-health", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/admin/activities", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (healthRes.ok) setHealth(await healthRes.json());
        if (actRes.ok) setActivities(await actRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    const timer = setInterval(fetchAll, 30000);
    return () => clearInterval(timer);
  }, [token]);

  const dbConnected = health?.database === "connected";
  const serverRunning = health?.server === "running";

  return (
    <div className="admin-grid">
      {/* System Health Panel */}
      <div className="card">
        <div className="card-header-section">
          <h3 className="card-title">System Health</h3>
          <span className={`status-badge ${serverRunning && dbConnected ? "online" : "offline"}`}>
            {serverRunning && dbConnected ? "All Systems Online" : "Issues Detected"}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-muted-foreground, #6b7280)" }}>Checking health…</div>
        ) : (
          <div className="system-health-list">
            <div className="health-item">
              <div className="health-header">
                <span className="health-label">Server Status</span>
                <span className={`health-status ${serverRunning ? "success" : "error"}`}>
                  {serverRunning ? "Running" : "Down"}
                </span>
              </div>
              <div className="health-bar">
                <div className={`health-fill ${serverRunning ? "success" : "error"}`} style={{ width: serverRunning ? "100%" : "10%" }} />
              </div>
              <p className="health-value">{health?.server ?? "—"}</p>
            </div>

            <div className="health-item">
              <div className="health-header">
                <span className="health-label">Database Status</span>
                <span className={`health-status ${dbConnected ? "success" : "error"}`}>
                  {dbConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div className="health-bar">
                <div className={`health-fill ${dbConnected ? "success" : "error"}`} style={{ width: dbConnected ? "100%" : "10%" }} />
              </div>
              <p className="health-value">MongoDB Atlas</p>
            </div>

            <div className="health-item">
              <div className="health-header">
                <span className="health-label">API Requests (session)</span>
                <span className="health-status success">Tracking</span>
              </div>
              <div className="health-bar">
                <div className="health-fill success" style={{ width: "80%" }} />
              </div>
              <p className="health-value">{(health?.apiRequests ?? 0).toLocaleString("en-IN")} requests</p>
            </div>

            <div className="health-item">
              <div className="health-header">
                <span className="health-label">Server Uptime</span>
                <span className="health-status success">Excellent</span>
              </div>
              <div className="health-bar">
                <div className="health-fill success" style={{ width: "99%" }} />
              </div>
              <p className="health-value">{health ? formatUptime(health.uptime) : "—"}</p>
            </div>

            <div className="health-item">
              <div className="health-header">
                <span className="health-label">Last Checked</span>
                <span className="health-status success">Live</span>
              </div>
              <div className="health-bar">
                <div className="health-fill success" style={{ width: "95%" }} />
              </div>
              <p className="health-value">{health ? new Date(health.timestamp).toLocaleTimeString("en-IN") : "—"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activities Panel */}
      <div className="card">
        <div className="card-header-section">
          <h3 className="card-title">Recent Activity Log</h3>
          <span className="status-badge online">Live</span>
        </div>

        <div className="admin-activity-list">
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-muted-foreground, #6b7280)" }}>Loading activities…</div>
          ) : activities.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-muted-foreground, #6b7280)" }}>No recent activity.</div>
          ) : (
            activities.map((act, i) => {
              const initials = act.userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              const colorClass = act.type === "expense" ? "expense" : act.type === "signup" ? "signup" : "update";
              const label = act.type === "expense" ? "Expense" : act.type === "signup" ? "Sign Up" : "Budget";

              return (
                <div key={i} className="activity-item">
                  <div className="activity-avatar">{initials}</div>
                  <div className="activity-details">
                    <p className="activity-title">
                      <strong>{act.userName}</strong> {act.action}
                    </p>
                    <p className="activity-time">{timeAgo(act.time)}</p>
                  </div>
                  <span className={`activity-type ${colorClass}`}>{label}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
