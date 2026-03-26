import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import PaymentPage from './pages/PaymentPage';
import HistoryPage from './pages/HistoryPage';
import AuthCallback from './pages/AuthCallback';
import { getUser } from './utils/config';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  
  const isPayment = location.pathname === '/' || location.pathname === '/pay';
  const isHistory = location.pathname === '/history';
  const isAuthCallback = location.pathname === '/auth-callback';

  // Landing Page for unauthenticated users
  if (!user && !isAuthCallback) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
          <svg width="80" height="80" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="url(#demo-pay-lg-bg)" />
          <circle cx="16" cy="16" r="9" stroke="url(#demo-pay-lg-coin)" strokeWidth="1.5" fill="none"/>
          <path d="M12 11H20M12 14H20M14 14L18 21M12.5 11C12.5 11 12.5 13.2 15.5 14C18.5 14.8 18.5 14 18.5 14" stroke="url(#demo-pay-lg-coin)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <defs>
            <linearGradient id="demo-pay-lg-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
            <linearGradient id="demo-pay-lg-coin" x1="7" y1="7" x2="25" y2="25" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
        </svg>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', marginBottom: '12px', letterSpacing: '-0.025em' }}>Demo Payment App</h1>
        <p style={{ color: '#6B7280', textAlign: 'center', marginBottom: '32px', maxWidth: '320px', fontSize: '16px', lineHeight: '1.5' }}>
          Experience seamless payments. Connect your Smart Expense Tracker account to get started.
        </p>
        <button 
          onClick={() => window.location.href = 'http://localhost:5173/login?redirect=http://localhost:3001/auth-callback'}
          style={{ 
            padding: '16px 32px', 
            backgroundColor: '#111827', 
            color: 'white', 
            borderRadius: '12px', 
            border: 'none', 
            fontSize: '16px', 
            fontWeight: '700', 
            cursor: 'pointer', 
            boxShadow: '0 4px 12px rgba(17, 24, 39, 0.25)',
            transition: 'transform 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Log In with Smart Expense Tracker
        </button>
        <div style={{ marginTop: '40px', color: '#9CA3AF', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Powered by Smart Expense Tracker
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Top Bar */}
      <header className="topbar">
        <div className="topbar-brand">
          <div className="topbar-logo" style={{ display: 'flex', alignItems: 'center' }}>
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="url(#demo-pay-bg)" />
    <circle cx="16" cy="16" r="9" stroke="url(#demo-pay-coin)" strokeWidth="1.5" fill="none"/>
    <path d="M12 11H20M12 14H20M14 14L18 21M12.5 11C12.5 11 12.5 13.2 15.5 14C18.5 14.8 18.5 14 18.5 14" stroke="url(#demo-pay-coin)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="demo-pay-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#A855F7" />
      </linearGradient>
      <linearGradient id="demo-pay-coin" x1="7" y1="7" x2="25" y2="25" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
  </svg>
</div>
          <div>
            <div className="topbar-title">Demo Payment App</div>
            <div className="topbar-sub">Powered by Smart Expense Tracker</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="http://localhost:5173/dashboard" target="_blank" rel="noopener noreferrer"
            style={{ fontSize:11, color:'rgba(255,255,255,0.7)', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
            Dashboard
          </a>
          <button 
            onClick={() => { sessionStorage.removeItem('token'); sessionStorage.removeItem('user'); window.location.reload(); }}
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              border: 'none', 
              color: 'white', 
              padding: '4px 8px', 
              borderRadius: '4px', 
              fontSize: '10px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 600
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          Pay
        </button>
        <button className={`tab-btn ${isHistory ? 'active' : ''}`} onClick={() => navigate('/history')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
          History
        </button>
      </nav>
    </div>
  );
}
