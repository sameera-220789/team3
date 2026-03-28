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

const MODE_COLORS: Record<string, string> = {
  mobile: '#00C9FF',
  bank: '#F5A623',
  qr: '#A259FF'
};

const MODE_ICONS: Record<string, React.ReactNode> = {
  mobile: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  bank: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
    </svg>
  ),
  qr: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  )
};

const INITIAL_COLOR = ['#00C9FF', '#F5A623', '#A259FF', '#00E5A0', '#FF4D6D', '#7B8CFF'];
const getColor = (name: string) => INITIAL_COLOR[name.charCodeAt(0) % INITIAL_COLOR.length];

export default function HistoryPage() {
  const token = getToken();
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'mobile' | 'bank' | 'qr'>('all');

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

  const filtered = filter === 'all' ? txns : txns.filter(t => t.paymentMode === filter);
  const total = txns.reduce((s, t) => s + t.amount, 0);
  const monthTotal = txns
    .filter(t => {
      const d = new Date(t.timestamp);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="page-content">
      <div className="scroll-container" style={{ paddingTop: 16 }}>

        {/* Stats Banner */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,201,255,0.12), rgba(0,201,255,0.05))',
            border: '1px solid rgba(0,201,255,0.2)',
            borderRadius: 18, padding: '18px 16px'
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: 4 }}>
              All Time
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
              ₹{total.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
              {txns.length} transactions
            </div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(245,166,35,0.1), rgba(245,166,35,0.05))',
            border: '1px solid rgba(245,166,35,0.2)',
            borderRadius: 18, padding: '18px 16px'
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: 4 }}>
              This Month
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#F5A623', fontFamily: 'Space Grotesk, sans-serif' }}>
              ₹{monthTotal.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
              {txns.filter(t => {
                const d = new Date(t.timestamp);
                const now = new Date();
                return d.getMonth() === now.getMonth();
              }).length} payments
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, overflowX: 'auto' }}>
          {(['all', 'mobile', 'bank', 'qr'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                background: filter === f ? 'rgba(0,201,255,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${filter === f ? 'rgba(0,201,255,0.35)' : 'var(--glass-border)'}` as any,
                color: filter === f ? 'var(--primary)' : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              {f === 'all' ? 'All' : f === 'mobile' ? '📱 Mobile' : f === 'bank' ? '🏦 Bank' : '📷 QR'}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && <div className="error-box">{error}</div>}

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{
              width: 36, height: 36, border: '2.5px solid rgba(0,201,255,0.15)',
              borderTopColor: 'var(--primary)', borderRadius: '50%',
              animation: 'spin 1s linear infinite', margin: '0 auto 16px'
            }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading transactions…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{
              width: 80, height: 80, borderRadius: 24,
              background: 'rgba(0,201,255,0.08)', border: '1px solid rgba(0,201,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', fontSize: 36
            }}>
              {filter === 'all' ? '💳' : filter === 'mobile' ? '📱' : filter === 'bank' ? '🏦' : '📷'}
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 8, fontFamily: 'Space Grotesk, sans-serif' }}>
              {filter === 'all' ? 'No transactions yet' : `No ${filter} transactions`}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>
              {filter === 'all' ? 'Make your first payment to see history here!' : `You haven't made any ${filter} payments yet.`}
            </p>
          </div>
        ) : (
          <div style={{
            background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)', borderRadius: 20, padding: '4px 16px'
          }}>
            {filtered.map((t, idx) => {
              const color = getColor(t.receiver);
              const modeCol = MODE_COLORS[t.paymentMode] || '#7B8CFF';
              return (
                <div
                  key={t._id}
                  className="history-item"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div style={{
                    width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                    background: `${color}18`, border: `1px solid ${color}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color, fontWeight: 700, fontSize: 18
                  }}>
                    {(t.receiver || '?')[0].toUpperCase()}
                  </div>

                  <div className="history-info">
                    <div className="history-name">{t.receiver}</div>
                    <div className="history-meta">
                      <span style={{ color: modeCol, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <span style={{ color: modeCol }}>{MODE_ICONS[t.paymentMode]}</span>
                        {t.paymentMode}
                      </span>
                      <span style={{ margin: '0 5px', color: 'var(--text-dim)' }}>·</span>
                      {new Date(t.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>
                      <span className="category-pill">{t.category || 'Other'}</span>
                      {t.expenseId && (
                        <span className="category-pill" style={{ background: 'rgba(0,229,160,0.12)', color: 'var(--success)', borderColor: 'rgba(0,229,160,0.2)' }}>
                          ✓ Linked
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="history-amount">-₹{t.amount.toLocaleString('en-IN')}</div>
                    <div style={{
                      fontSize: 10, fontWeight: 600, marginTop: 4,
                      color: t.status === 'success' ? 'var(--success)' : 'var(--danger)',
                      textTransform: 'uppercase', letterSpacing: '0.5px'
                    }}>
                      {t.status || 'success'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
