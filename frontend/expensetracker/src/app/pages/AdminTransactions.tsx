import { useEffect, useState } from "react";

interface TrendPoint {
  label: string;
  total: number;
  count: number;
}

interface Transaction {
  _id: string;
  amount: number;
  category: string;
  type: string;
  date: string;
  createdAt: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

type Period = "daily" | "weekly" | "monthly";

export default function AdminTransactions() {
  const [period, setPeriod] = useState<Period>("weekly");
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);

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
  }, [period, token]);

  useEffect(() => {
    setTxLoading(true);
    const fetchTransactions = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/transactions", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setTransactions(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setTxLoading(false);
      }
    };
    fetchTransactions();
  }, [token]);

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

      <div className="card col-span-3">
        <div className="card-header-section">
          <h3 className="card-title">Recent Transactions</h3>
        </div>
        {txLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-muted-foreground, #6b7280)" }}>Loading transactions…</div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-muted-foreground, #6b7280)" }}>No recent transactions found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="transactions-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border, #e5e7eb)" }}>
                  <th style={{ padding: "12px 16px", color: "var(--color-muted-foreground)", fontWeight: 600, fontSize: "12px", textTransform: "uppercase" }}>User</th>
                  <th style={{ padding: "12px 16px", color: "var(--color-muted-foreground)", fontWeight: 600, fontSize: "12px", textTransform: "uppercase" }}>Category</th>
                  <th style={{ padding: "12px 16px", color: "var(--color-muted-foreground)", fontWeight: 600, fontSize: "12px", textTransform: "uppercase" }}>Amount</th>
                  <th style={{ padding: "12px 16px", color: "var(--color-muted-foreground)", fontWeight: 600, fontSize: "12px", textTransform: "uppercase" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx._id} style={{ borderBottom: "1px solid var(--color-border, #f3f4f6)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 500 }}>{tx.userId?.firstName || "Unknown"} {tx.userId?.lastName || ""}</div>
                      <div style={{ fontSize: "12px", color: "var(--color-muted-foreground)" }}>{tx.userId?.email || "No email"}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ 
                        background: "var(--color-muted, #ececf0)", 
                        padding: "4px 8px", 
                        borderRadius: "4px", 
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "var(--color-foreground)"
                      }}>
                        {tx.category}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--color-danger)" }}>
                      -₹{tx.amount?.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--color-muted-foreground)" }}>
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
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
