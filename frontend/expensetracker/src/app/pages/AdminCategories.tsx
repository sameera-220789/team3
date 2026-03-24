import { useEffect, useState } from "react";

interface CategoryStat {
  category: string;
  count: number;
  total: number;
  percentage: number;
}

const CATEGORY_COLORS = [
  "#6366f1", "#8b5cf6", "#06b6d4", "#10b981",
  "#f59e0b", "#ef4444", "#ec4899", "#84cc16"
];

const CATEGORY_EMOJIS: Record<string, string> = {
  food: "🍔",
  dining: "🍔",
  travel: "✈️",
  transport: "🚗",
  shopping: "🛍️",
  bills: "📄",
  utilities: "💡",
  entertainment: "🎬",
  health: "🏥",
  education: "📚",
  groceries: "🛒",
  rent: "🏠",
  salary: "💰",
  other: "📦",
};

function getEmoji(category: string) {
  const key = category?.toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_EMOJIS)) {
    if (key?.includes(k)) return v;
  }
  return "📦";
}

export default function AdminCategories() {
  const [cats, setCats] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setCats(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  const maxTotal = cats.length > 0 ? Math.max(...cats.map((c) => c.total)) : 1;

  return (
    <div className="admin-grid">
      {/* Bar Chart */}
      <div className="card">
        <div className="card-header-section">
          <h3 className="card-title">Category Spending</h3>
          <span style={{ fontSize: "13px", color: "var(--color-muted-foreground, #6b7280)" }}>by total amount (₹)</span>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-muted-foreground, #6b7280)" }}>Loading…</div>
        ) : cats.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-muted-foreground, #6b7280)" }}>No expense data yet.</div>
        ) : (
          <div style={{ padding: "8px 0", display: "flex", flexDirection: "column", gap: "14px" }}>
            {cats.map((c, i) => (
              <div key={c.category}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "14px" }}>
                  <span style={{ fontWeight: 500 }}>{getEmoji(c.category)} {c.category}</span>
                  <span style={{ color: "var(--color-muted-foreground, #6b7280)", fontWeight: 600 }}>
                    ₹{c.total.toLocaleString("en-IN", { maximumFractionDigits: 0 })} ({c.percentage}%)
                  </span>
                </div>
                <div style={{ height: "10px", borderRadius: "9999px", background: "var(--color-muted, #f3f4f6)" }}>
                  <div style={{
                    height: "10px",
                    borderRadius: "9999px",
                    width: `${(c.total / maxTotal) * 100}%`,
                    background: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                    transition: "width 0.6s ease"
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pie Chart (SVG) + Legend */}
      <div className="card">
        <div className="card-header-section">
          <h3 className="card-title">Category Distribution</h3>
          <span style={{ fontSize: "13px", color: "var(--color-muted-foreground, #6b7280)" }}>% of total spending</span>
        </div>

        {!loading && cats.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            {/* SVG Donut Chart */}
            <svg width="200" height="200" viewBox="0 0 200 200">
              {(() => {
                const cx = 100, cy = 100, r = 80, innerR = 48;
                let cumAngle = -Math.PI / 2;
                const total = cats.reduce((s, c) => s + c.percentage, 0) || 1;
                return cats.map((c, i) => {
                  const angle = (c.percentage / total) * 2 * Math.PI;
                  const x1 = cx + r * Math.cos(cumAngle);
                  const y1 = cy + r * Math.sin(cumAngle);
                  cumAngle += angle;
                  const x2 = cx + r * Math.cos(cumAngle);
                  const y2 = cy + r * Math.sin(cumAngle);
                  const ix1 = cx + innerR * Math.cos(cumAngle);
                  const iy1 = cy + innerR * Math.sin(cumAngle);
                  const ix2 = cx + innerR * Math.cos(cumAngle - angle);
                  const iy2 = cy + innerR * Math.sin(cumAngle - angle);
                  const largeArc = angle > Math.PI ? 1 : 0;
                  const path = [
                    `M ${x1} ${y1}`,
                    `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
                    `L ${ix1} ${iy1}`,
                    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2}`,
                    "Z"
                  ].join(" ");
                  return <path key={i} d={path} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} opacity="0.9" />;
                });
              })()}
              {/* Center label */}
              <text x="100" y="96" textAnchor="middle" fontSize="14" fontWeight="700" fill="currentColor">
                {cats.length}
              </text>
              <text x="100" y="112" textAnchor="middle" fontSize="11" fill="var(--color-muted-foreground, #6b7280)">
                categories
              </text>
            </svg>

            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
              {cats.map((c, i) => (
                <div key={c.category} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: CATEGORY_COLORS[i % CATEGORY_COLORS.length], flexShrink: 0 }} />
                    <span style={{ fontSize: "13px" }}>{getEmoji(c.category)} {c.category}</span>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-muted-foreground, #6b7280)" }}>{c.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && cats.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-muted-foreground, #6b7280)" }}>No data available.</div>
        )}
      </div>
    </div>
  );
}
