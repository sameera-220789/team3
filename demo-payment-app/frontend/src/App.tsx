import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import PaymentPage from './pages/PaymentPage';
import HistoryPage from './pages/HistoryPage';
import AuthCallback from './pages/AuthCallback';
import LoginPage from './pages/LoginPage';
import { getUser } from './utils/config';

/* ── NovaPay Brand Icon ── */
function NovaPayIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="np-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0A1628" />
          <stop offset="100%" stopColor="#0F1E3D" />
        </linearGradient>
        <linearGradient id="np-bolt" x1="14" y1="6" x2="34" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="50%" stopColor="#00C9FF" />
          <stop offset="100%" stopColor="#F5A623" />
        </linearGradient>
        <linearGradient id="np-ring" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00C9FF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#A259FF" stopOpacity="0.3" />
        </linearGradient>
        <filter id="np-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background */}
      <rect width="48" height="48" rx="14" fill="url(#np-bg)" />

      {/* Outer glow ring */}
      <circle cx="24" cy="24" r="19" stroke="url(#np-ring)" strokeWidth="1" fill="none" opacity="0.6" />

      {/* Inner ring */}
      <circle cx="24" cy="24" r="14" stroke="rgba(0,201,255,0.15)" strokeWidth="1" fill="none" />

      {/* Lightning bolt - the core icon */}
      <path
        d="M27 8L16 26H24L21 40L32 22H24L27 8Z"
        fill="url(#np-bolt)"
        filter="url(#np-glow)"
      />
    </svg>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();

  const isPayment = location.pathname === '/' || location.pathname === '/pay';
  const isHistory = location.pathname === '/history';
  const isAuthCallback = location.pathname === '/auth-callback';

  if (!user && !isAuthCallback) {
    return <LoginPage />;
  }

  return (
    <div className="app-shell">
      {/* Top Bar */}
      <header className="topbar">
        <div className="topbar-brand">
          <div className="topbar-logo">
            <NovaPayIcon size={24} />
          </div>
          <div>
            <div className="topbar-title">NovaPay</div>
            <div className="topbar-sub">by Smart Expense Tracker</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => {
              sessionStorage.removeItem('token');
              sessionStorage.removeItem('user');
              window.location.reload();
            }}
            style={{
              background: 'rgba(255,77,109,0.1)',
              border: '1px solid rgba(255,77,109,0.2)',
              color: '#FF6B85',
              padding: '6px 10px',
              borderRadius: 8,
              fontSize: 11,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontWeight: 600,
              letterSpacing: '0.3px',
              transition: 'all 0.2s'
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* Page Content */}
      <Routes>
        <Route path="/"        element={<PaymentPage />} />
        <Route path="/pay"     element={<PaymentPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/auth-callback" element={<AuthCallback />} />
      </Routes>

      {/* Bottom Tab Bar */}
      <nav className="bottom-nav">
        <button className={`tab-btn ${isPayment ? 'active' : ''}`} onClick={() => navigate('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m13 2-2 2.5h3L12 7" /><path d="M10 14v-3" />
            <path d="M14 14v-3" /><path d="M11 19c-1.7 0-3-1.3-3-3v-2h8v2c0 1.7-1.3 3-3 3z" />
            <path d="M5 12H4a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1" />
          </svg>
          Pay
        </button>
        <button className={`tab-btn ${isHistory ? 'active' : ''}`} onClick={() => navigate('/history')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          History
        </button>
      </nav>
    </div>
  );
}
