import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import PaymentPage from './pages/PaymentPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isPayment = location.pathname === '/' || location.pathname === '/pay';
  const isHistory = location.pathname === '/history';

  return (
    <div className="app-shell">
      {/* Top Bar */}
      <header className="topbar">
        <div className="topbar-brand">
          <div className="topbar-logo">💜</div>
          <div>
            <div className="topbar-title">Demo Payment App</div>
            <div className="topbar-sub">Powered by Smart Expense Tracker</div>
          </div>
        </div>
        <a href="http://localhost:5173/dashboard" target="_blank" rel="noopener noreferrer"
          style={{ fontSize:11, color:'rgba(255,255,255,0.7)', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
          Dashboard
        </a>
      </header>

      {/* Page Content */}
      <Routes>
        <Route path="/"        element={<PaymentPage />} />
        <Route path="/pay"     element={<PaymentPage />} />
        <Route path="/history" element={<HistoryPage />} />
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
