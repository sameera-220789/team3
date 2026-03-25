import React, { useEffect, useState, useMemo } from 'react';
import { API_BASE_URL } from '../utils/config';
import { getUser } from '../utils/api';
import { getEmoji } from '../utils/formatters';

interface Transaction {
  _id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: string;
}

interface SpendingCalendarProps {
  initialMonth: string;
  onClose: () => void;
}

export const SpendingCalendar: React.FC<SpendingCalendarProps> = ({ initialMonth, onClose }) => {
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const user = getUser();

  const fetchMonthExpenses = async (month: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/expenses?userId=${user.id}&month=${month}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.filter((e: any) => e.type !== 'income'));
      }
    } catch (err) {
      console.error("Error fetching calendar data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthExpenses(selectedMonth);
  }, [selectedMonth]);

  const dailyTotals = useMemo(() => {
    const totals: Record<number, number> = {};
    expenses.forEach(exp => {
      const d = new Date(exp.date || (exp as any).createdAt).getDate();
      totals[d] = (totals[d] || 0) + exp.amount;
    });
    return totals;
  }, [expenses]);

  const maxDailySpend = useMemo(() => {
    const values = Object.values(dailyTotals);
    return values.length > 0 ? Math.max(...values) : 0;
  }, [dailyTotals]);

  const getDayColor = (day: number) => {
    const total = dailyTotals[day] || 0;
    if (total === 0) return 'transparent';
    const intensity = Math.min(0.9, (total / maxDailySpend) * 0.8 + 0.1);
    return `rgba(99, 102, 241, ${intensity})`; // Primary blue with varying opacity
  };

  const monthDate = new Date(`${selectedMonth}-01`);
  const monthName = monthDate.toLocaleString('default', { month: 'long' });
  const year = monthDate.getFullYear();
  const firstDay = new Date(year, monthDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(year, monthDate.getMonth() + 1, 0).getDate();

  const navigateMonth = (dir: number) => {
    const d = new Date(`${selectedMonth}-01`);
    d.setMonth(d.getMonth() + dir);
    setSelectedMonth(d.toISOString().slice(0, 7));
    setSelectedDate(null);
  };

  const daysArr = [];
  for (let i = 0; i < firstDay; i++) daysArr.push(null);
  for (let i = 1; i <= daysInMonth; i++) daysArr.push(i);

  const selectedTransactions = useMemo(() => {
    if (!selectedDate) return [];
    const day = parseInt(selectedDate);
    return expenses.filter(exp => new Date(exp.date || (exp as any).createdAt).getDate() === day);
  }, [selectedDate, expenses]);

  return (
    <div className="calendar-modal-overlay" style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      zIndex: 3000, backdropFilter: 'blur(12px)'
    }}>
      <div className="calendar-modal-content" style={{
        background: 'var(--color-gray-50)', width: '92%', maxWidth: '700px',
        borderRadius: '24px', boxShadow: 'var(--shadow-2xl)',
        padding: '2.5rem', position: 'relative', border: '1px solid var(--color-gray-200)',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        {/* Modern Close Button */}
        <button 
          onClick={onClose} 
          style={{
            position: 'absolute', top: '1.5rem', right: '1.5rem',
            background: 'var(--color-gray-100)', border: '1px solid var(--color-gray-200)', 
            borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-gray-500)', transition: 'all 0.2s',
            boxShadow: 'var(--shadow-sm)'
          }}
          className="close-modal-btn"
          title="Close Calendar"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', paddingRight: '3rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--color-gray-900)' }}>Spending Calendar 📅</h2>
            <p style={{ color: 'var(--color-gray-500)', margin: '4px 0 0', fontSize: '0.9rem' }}>Track your daily spending patterns</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--color-gray-100)', padding: '6px', borderRadius: '12px', border: '1px solid var(--color-gray-200)' }}>
            <button onClick={() => navigateMonth(-1)} className="nav-btn">‹</button>
            <span style={{ fontWeight: 700, fontSize: '1rem', minWidth: '120px', textAlign: 'center', color: 'var(--color-gray-800)' }}>
              {monthName} {year}
            </span>
            <button onClick={() => navigateMonth(1)} className="nav-btn">›</button>
          </div>
        </div>

        {loading ? (
          <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="calendar-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px'
          }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: '8px' }}>
                {d}
              </div>
            ))}
            {daysArr.map((day, idx) => (
              <div 
                key={idx} 
                onClick={() => day && setSelectedDate(day.toString())}
                style={{
                  aspectRatio: '1', borderRadius: '14px', display: 'flex', 
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: day ? getDayColor(day) : 'transparent',
                  cursor: day ? 'pointer' : 'default',
                  position: 'relative', 
                  border: (day && selectedDate === day.toString()) ? '2.5px solid var(--color-primary)' : '1px solid var(--color-gray-100)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: day ? 'var(--shadow-sm)' : 'none'
                }}
                className={day ? 'calendar-day' : ''}
              >
                {day && (
                  <>
                    <span style={{ 
                      fontSize: '0.95rem', fontWeight: 700, 
                      color: (dailyTotals[day] || 0) > (maxDailySpend * 0.5) ? 'white' : 'var(--color-gray-800)' 
                    }}>{day}</span>
                    {dailyTotals[day] > 0 && (
                      <span style={{ 
                        fontSize: '0.6rem', fontWeight: 800,
                        color: (dailyTotals[day] || 0) > (maxDailySpend * 0.5) ? 'rgba(255,255,255,0.9)' : 'var(--color-primary)',
                        marginTop: '2px'
                      }}>₹{dailyTotals[day] >= 1000 ? (dailyTotals[day]/1000).toFixed(1)+'k' : dailyTotals[day]}</span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedDate && (
          <div style={{ 
            marginTop: '2.5rem', padding: '1.5rem', background: 'var(--color-gray-100)', 
            borderRadius: '20px', border: '1px solid var(--color-gray-200)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-gray-900)' }}>
                Transactions on {monthName} {selectedDate}
              </h3>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 10px', borderRadius: '20px' }}>
                Total: ₹{dailyTotals[parseInt(selectedDate)]?.toLocaleString()}
              </span>
            </div>
            {selectedTransactions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedTransactions.map(tx => (
                  <div key={tx._id} style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'white', padding: '12px 16px', borderRadius: '12px',
                    boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-gray-200)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '1.5rem', padding: '8px', background: 'var(--color-gray-50)', borderRadius: '10px' }}>{getEmoji(tx.category)}</div>
                      <div>
                        <div style={{ fontWeight: 650, fontSize: '0.95rem', color: 'var(--color-gray-900)' }}>{tx.description || tx.category}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', textTransform: 'capitalize' }}>{tx.category}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--color-danger)', fontSize: '1rem' }}>-₹{tx.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'var(--color-gray-400)', fontSize: '0.9rem', margin: 0 }}>No transactions recorded for this day.</p>
              </div>
            )}
          </div>
        )}

        <style>{`
          .nav-btn {
            background: white;
            border: 1px solid var(--color-gray-300);
            border-radius: 8px;
            width: 32px;
            height: 32px;
            cursor: pointer;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            color: var(--color-gray-700);
          }
          .nav-btn:hover { background: var(--color-gray-50); border-color: var(--color-primary); color: var(--color-primary); }
          .calendar-day:hover { transform: scale(1.08); filter: brightness(1.05); z-index: 10; cursor: pointer; }
          .close-modal-btn:hover { background: var(--color-gray-200) !important; color: var(--color-danger) !important; transform: rotate(90deg); }
          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid var(--color-gray-200);
            border-top: 4px solid var(--color-primary);
            border-radius: 50%;
            animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }
          @keyframes spin { 100% { transform: rotate(360deg); } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .dark .calendar-modal-content { background: #1e1e1e !important; border-color: #333 !important; }
          .dark .nav-btn { background: #2a2a2a !important; color: #ccc !important; border-color: #444 !important; }
          .dark .calendar-modal-content select, .dark .calendar-modal-content button { color: #eee !important; }
        `}</style>
      </div>
    </div>
  );
};
