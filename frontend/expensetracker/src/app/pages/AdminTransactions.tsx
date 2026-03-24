import { useEffect, useState } from "react";

interface TrendPoint {
  label: string;
  total: number;
  count: number;
}

type Period = "daily" | "weekly" | "monthly";

export default function AdminTransactions() {
  const [period, setPeriod] = useState<Period>("weekly");
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    setLoading(true);
    const fetchTrends = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/admin/spending-trends?period=${period}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) setTrends(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [period]);

  const maxTotal = trends.length > 0 ? Math.max(...trends.map((t) => t.total)) : 1;
  const totalSpend = trends.reduce((s, t) => s + t.total, 0);
  const avgSpend = trends.length > 0 ? totalSpend / trends.length : 0;

  return (
    <div className="admin-grid">
      <div className="card col-span-2">
        <div className="card-header-section">
          <h3 className="card-title">Spending Trends</h3>
          <div className="filter-tabs">
            {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
              <button
                key={p}
                className={`filter-tab${period === p ? " active" : ""}`}
                onClick={() => setPeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
          <div style={{
            flex: 1, minWidth: "140px", padding: "16px", borderRadius: "12px",
            background: "var(--color-card, #ffffff)", border: "1px solid var(--color-border, #e5e7eb)"
          }}>
            <p style={{ fontSize: "12px", color: "var(--color-muted-foreground, #6b7280)", marginBottom: "6px", fontWeight: 600 }}>TOTAL SPENDING</p>
            <p style={{ fontSize: "22px", fontWeight: 700 }}>₹{totalSpend.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
          </div>
          <div style={{
            flex: 1, minWidth: "140px", padding: "16px", borderRadius: "12px",
            background: "var(--color-card, #ffffff)", border: "1px solid var(--color-border, #e5e7eb)"
          }}>
            <p style={{ fontSize: "12px", color: "var(--color-muted-foreground, #6b7280)", marginBottom: "6px", fontWeight: 600 }}>AVG PER PERIOD</p>
            <p style={{ fontSize: "22px", fontWeight: 700 }}>₹{avgSpend.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
          </div>
          <div style={{
            flex: 1, minWidth: "140px", padding: "16px", borderRadius: "12px",
            background: "var(--color-card, #ffffff)", border: "1px solid var(--color-border, #e5e7eb)"
          }}>
            <p style={{ fontSize: "12px", color: "var(--color-muted-foreground, #6b7280)", marginBottom: "6px", fontWeight: 600 }}>DATA POINTS</p>
            <p style={{ fontSize: "22px", fontWeight: 700 }}>{trends.length}</p>
          </div>
        </div>

        {/* Bar Chart */}
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-muted-foreground, #6b7280)" }}>Loading trends…</div>
        ) : trends.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-muted-foreground, #6b7280)" }}>No spending data for this period.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Y-axis + bars */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "200px", paddingBottom: "4px" }}>
              {trends.map((t, i) => {
                const heightPct = maxTotal > 0 ? (t.total / maxTotal) * 100 : 0;
                const isLast = i === trends.length - 1;
                return (
                  <div
                    key={t.label}
                    title={`${t.label}: ₹${t.total.toLocaleString("en-IN")}`}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: "4px",
                      height: "100%"
                    }}
                  >
                    <div style={{
                      width: "100%",
                      height: `${Math.max(heightPct, 2)}%`,
                      background: isLast
                        ? "linear-gradient(180deg, #f97316, #ea580c)"
                        : "linear-gradient(180deg, #fdba74, #fb923c)",
                      borderRadius: "6px 6px 2px 2px",
                      transition: "height 0.4s ease",
                      cursor: "pointer",
                      position: "relative"
                    }} />
                  </div>
                );
              })}
            </div>
            {/* X Labels */}
            <div style={{ display: "flex", gap: "6px" }}>
              {trends.map((t) => (
                <div key={t.label} style={{
                  flex: 1,
                  minWidth: 0,
                  textAlign: "center",
                  fontSize: "10px",
                  color: "var(--color-muted-foreground, #6b7280)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}>{t.label}</div>
              ))}
            </div>
          </div>
        )}

        {/* Data Table */}
        {!loading && trends.length > 0 && (
          <div style={{ marginTop: "24px", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border, #e5e7eb)" }}>
                  {["Period", "Total Spending", "Expenses Count"].map((h) => (
                    <th key={h} style={{
                      padding: "8px 12px",
                      textAlign: "left",
                      color: "var(--color-muted-foreground, #6b7280)",
                      fontWeight: 600,
                      fontSize: "11px",
                      textTransform: "uppercase"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...trends].reverse().map((t) => (
                  <tr key={t.label} style={{ borderBottom: "1px solid var(--color-border, #f3f4f6)" }}>
                    <td style={{ padding: "8px 12px", fontWeight: 500 }}>{t.label}</td>
                    <td style={{ padding: "8px 12px" }}>₹{t.total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                    <td style={{ padding: "8px 12px", color: "var(--color-muted-foreground, #6b7280)" }}>{t.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
