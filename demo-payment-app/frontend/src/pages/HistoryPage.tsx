import React, { useEffect, useState } from 'react';
import { getToken } from '../utils/config';

interface Transaction {
  _id: string;
  receiver: string;
  amount: number;
  category: string;
  note: string;
  paymentMode: string;
  timestamp: string;
  status: string;
  expenseId?: string;
}

const modeIcon: Record<string, string> = { mobile: '📱', bank: '🏦', qr: '📷' };

export default function HistoryPage() {
  const token = getToken();
  const [txns, setTxns]     = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch('/api/payments/history', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setTxns(Array.isArray(data) ? data : []); })
      .catch(() => setError('Failed to load history'))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) return (
    <div className="no-auth">
      <div style={{ fontSize:40 }}>🔐</div>
      <h2>Not Logged In</h2>
      <p>Log into the Expense Tracker to access your payment history.</p>
      <a href="http://localhost:5173/login" target="_blank" rel="noopener noreferrer">Log In ↗</a>
    </div>
  );

  const total = txns.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="page-content">
      {/* Summary banner */}
      <div className="profile-widget" style={{ background: 'linear-gradient(135deg, #3d1467, #5f259f)' }}>
        <div className="label">Total Payments Made</div>
        <div className="value">₹{total.toLocaleString('en-IN')}</div>
        <div style={{ fontSize:12, opacity:0.75, marginTop:4 }}>{txns.length} transactions</div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>Loading transactions…</div>
      ) : txns.length === 0 ? (
        <div style={{ textAlign:'center', padding:40 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>💳</div>
          <p className="text-muted">No transactions yet. Make your first payment!</p>
        </div>
      ) : (
        <div className="card">
          {txns.map(t => (
            <div key={t._id} className="history-item">
              <div className="history-avatar">
                {(t.receiver || '?')[0].toUpperCase()}
              </div>
              <div className="history-info">
                <div className="history-name">{t.receiver}</div>
                <div className="history-meta">
                  {modeIcon[t.paymentMode] || '💳'} {t.paymentMode} &nbsp;·&nbsp;
                  {new Date(t.timestamp).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                </div>
                <span className="category-pill">{t.category || 'Other'}</span>
                {t.expenseId && (
                  <span className="category-pill" style={{ background:'#d1fae5', color:'#065f46', marginLeft:4 }}>✓ Expense Linked</span>
                )}
              </div>
              <div className="history-amount">-₹{t.amount.toLocaleString('en-IN')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
