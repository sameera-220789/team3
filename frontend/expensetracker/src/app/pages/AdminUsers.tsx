import { useEffect, useState } from "react";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  provider: string;
  createdAt: string;
  currency: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const token = localStorage.getItem("adminToken");

  const fetchUsers = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This will also delete their expenses and budgets.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/user/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="admin-grid">
      <div className="card col-span-2">
        <div className="card-header-section">
          <h3 className="card-title">User Management</h3>
          <span style={{
            background: "var(--primary-light, #eef2ff)",
            color: "var(--primary, #6366f1)",
            padding: "4px 12px",
            borderRadius: "99px",
            fontSize: "13px",
            fontWeight: 600
          }}>{filtered.length} users</span>
        </div>

        {/* Search Bar */}
        <div style={{ padding: "0 0 16px 0" }}>
          <div className="input-wrapper" style={{ maxWidth: "400px" }}>
            <svg className="input-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="8" cy="8" r="5.5" stroke="#9CA3AF" strokeWidth="1.5" />
              <path d="M12.5 12.5L16 16" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-muted-foreground, #6b7280)" }}>Loading users…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-muted-foreground, #6b7280)" }}>No users found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border, #e5e7eb)" }}>
                  {["User", "Email", "Provider", "Currency", "Joined", "Action"].map((h) => (
                    <th key={h} style={{
                      padding: "10px 12px",
                      textAlign: "left",
                      color: "var(--color-muted-foreground, #6b7280)",
                      fontWeight: 600,
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const initials = `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase();
                  const fullName = `${u.firstName} ${u.lastName}`.trim();
                  return (
                    <tr key={u._id} style={{
                      borderBottom: "1px solid var(--color-border, #f3f4f6)",
                      transition: "background 0.15s"
                    }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-muted, #f9fafb)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                    >
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="activity-avatar" style={{ width: "36px", height: "36px", fontSize: "13px" }}>{initials}</div>
                          <span style={{ fontWeight: 500 }}>{fullName || "—"}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px", color: "var(--color-muted-foreground, #6b7280)" }}>{u.email}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: u.provider === "google" ? "#fff0f0" : u.provider === "github" ? "#f0f0ff" : "#f0fff4",
                          color: u.provider === "google" ? "#dc2626" : u.provider === "github" ? "#6366f1" : "#059669",
                        }}>
                          {u.provider === "local" ? "📧 Email" : u.provider === "google" ? "🔴 Google" : "🐙 GitHub"}
                        </span>
                      </td>
                      <td style={{ padding: "12px", color: "var(--color-muted-foreground, #6b7280)" }}>{u.currency || "INR"}</td>
                      <td style={{ padding: "12px", color: "var(--text-secondary)" }}>
                        {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <button
                          className="icon-btn danger"
                          disabled={deletingId === u._id}
                          onClick={() => handleDelete(u._id, fullName)}
                          title="Delete user"
                        >
                          {deletingId === u._id ? (
                            <span style={{ fontSize: "12px" }}>…</span>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4H12L11 13C11 13.5523 10.5523 14 10 14H6C5.44772 14 5 13.5523 5 13L4 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
