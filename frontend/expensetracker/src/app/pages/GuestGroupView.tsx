import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../utils/config";
import GroupChat from "../components/GroupChat";

export default function GuestGroupView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [group, setGroup] = useState<any>(null);
  const [groupExpenses, setGroupExpenses] = useState<any[]>([]);
  const [groupBalances, setGroupBalances] = useState<{ balances: any, transactions: any[] }>({ balances: {}, transactions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAndFetch = async () => {
      const params = new URLSearchParams(window.location.search);
      const pwd = params.get("pwd");
      
      if (id && pwd && !localStorage.getItem(`guestToken_${id}`)) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/groups/join`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ groupId: id, groupPassword: pwd, guestName: "Invited Guest" })
          });
          if (res.ok) {
            const data = await res.json();
            localStorage.setItem(`guestToken_${id}`, data.guestToken);
            localStorage.setItem(`guestName_${id}`, "Invited Guest");
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (e) {
          console.error("Auto join failed", e);
        }
      }

      if (!id || !localStorage.getItem(`guestToken_${id}`)) {
        navigate("/");
        return;
      }
      fetchGroupData(id);
    };

    initAndFetch();
  }, [id, navigate]);

  const fetchGroupData = async (groupId: string) => {
    try {
      const token = localStorage.getItem(`guestToken_${groupId}`);
      const headers = {
        "x-guest-token": token || ""
      };

      const [grpRes, expRes, balRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/groups/${groupId}`, { headers }),
        fetch(`${API_BASE_URL}/api/groups/${groupId}/expenses`, { headers }),
        fetch(`${API_BASE_URL}/api/groups/${groupId}/balance`, { headers })
      ]);

      if (grpRes.ok && expRes.ok && balRes.ok) {
        setGroup(await grpRes.json());
        setGroupExpenses(await expRes.json());
        setGroupBalances(await balRes.json());
      } else {
        alert("Session expired or unauthorized");
        navigate("/");
      }
    } catch (e) {
      console.error("Error fetching group data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (id) {
      localStorage.removeItem(`guestToken_${id}`);
      localStorage.removeItem(`guestName_${id}`);
    }
    navigate("/");
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading Group...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-gray-50)", padding: "20px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", padding: "16px 24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginBottom: "24px", maxWidth: "1200px", margin: "0 auto 24px auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ background: "var(--color-primary-light)", color: "white", padding: "8px", borderRadius: "8px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/></svg>
          </div>
          <div>
            <h1 style={{ fontSize: "1.25rem", margin: 0, color: "var(--color-gray-900)" }}>{group?.groupName || "Group Details"}</h1>
            <span style={{ fontSize: "0.85rem", color: "var(--color-gray-500)" }}>Guest View</span>
          </div>
        </div>
        <button onClick={handleLogout} style={{ padding: "8px 16px", background: "var(--color-gray-200)", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, color: "var(--color-gray-700)" }}>Leave Group</button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Left Side: Layout for Expenses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card" style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', color: 'var(--color-gray-900)' }}>Group Expenses</h3>
            <div className="table-wrapper" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: "var(--color-gray-50)", borderBottom: "1px solid var(--color-gray-200)" }}>
                    <th style={{ padding: "12px", fontSize: "0.875rem", color: "var(--color-gray-600)" }}>Date</th>
                    <th style={{ padding: "12px", fontSize: "0.875rem", color: "var(--color-gray-600)" }}>Description</th>
                    <th style={{ padding: "12px", fontSize: "0.875rem", color: "var(--color-gray-600)" }}>Total Amount</th>
                    <th style={{ padding: "12px", fontSize: "0.875rem", color: "var(--color-gray-600)" }}>Paid By</th>
                    <th style={{ padding: "12px", fontSize: "0.875rem", color: "var(--color-gray-600)" }}>Split Among</th>
                  </tr>
                </thead>
                <tbody>
                  {groupExpenses.length > 0 ? groupExpenses.map((exp: any) => (
                    <tr key={exp._id} style={{ borderBottom: "1px solid var(--color-gray-100)" }}>
                      <td style={{ padding: "12px", color: 'var(--color-gray-500)' }}>
                        {new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ padding: "12px", fontWeight: 500, color: 'var(--color-gray-900)' }}>{exp.description}</td>
                      <td style={{ padding: "12px", fontWeight: 600, color: 'var(--color-gray-900)' }}>₹{exp.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td style={{ padding: "12px", color: 'var(--color-primary)', fontWeight: 500 }}>{exp.paidBy}</td>
                      <td style={{ padding: "12px", color: 'var(--color-gray-600)', fontSize: '0.875rem' }}>
                        {exp.splitBetween.map((s: any) => s.member).join(', ')}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                        No expenses recorded for this group yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: '16px' }}>Balance Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {groupBalances.transactions && groupBalances.transactions.length > 0 ? groupBalances.transactions.map((tx: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--color-gray-50)', borderRadius: '8px', border: '1px solid var(--color-gray-200)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>Owes</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>{tx.from}</span>
                  </div>
                  <div style={{ color: 'var(--color-gray-400)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>Gets paid</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>{tx.to}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-gray-900)', marginLeft: '12px' }}>
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-gray-600)', fontSize: '0.9rem' }}>
                  Balances are settled up!
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Group Chat */}
        <div>
          {id && <GroupChat groupId={id} />}
        </div>
      </div>
    </div>
  );
}
