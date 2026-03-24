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
      zIndex: 2000, backdropFilter: 'blur(8px)'
    }}>
      <div className="calendar-modal-content" style={{
        background: 'var(--color-background)', width: '90%', maxWidth: '600px',
        borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        padding: '2rem', position: 'relative', border: '1px solid var(--color-border)'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '1.5rem', right: '1.5rem',
          background: 'var(--color-muted)', border: 'none', borderRadius: '50%',
          width: '32px', height: '32px', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Spending Calendar 📅</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => navigateMonth(-1)} className="nav-btn">‹</button>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', minWidth: '140px', textAlign: 'center' }}>
              {monthName} {year}
            </span>
            <button onClick={() => navigateMonth(1)} className="nav-btn">›</button>
          </div>
        </div>

        {loading ? (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="calendar-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px'
          }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-gray-500)', padding: '4px' }}>
                {d}
              </div>
            ))}
            {daysArr.map((day, idx) => (
              <div 
                key={idx} 
                onClick={() => day && setSelectedDate(day.toString())}
                style={{
                  aspectRatio: '1', borderRadius: '12px', display: 'flex', 
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: day ? getDayColor(day) : 'transparent',
                  cursor: day ? 'pointer' : 'default',
                  position: 'relative', border: (day && selectedDate === day.toString()) ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  transition: 'all 0.2s',
                }}
                className={day ? 'calendar-day' : ''}
              >
                {day && (
                  <>
                    <span style={{ 
                      fontSize: '0.9rem', fontWeight: 700, 
                      color: (dailyTotals[day] || 0) > (maxDailySpend * 0.5) ? 'white' : 'inherit' 
                    }}>{day}</span>
                    {dailyTotals[day] > 0 && (
                      <span style={{ 
                        fontSize: '0.65rem', fontWeight: 600,
                        color: (dailyTotals[day] || 0) > (maxDailySpend * 0.5) ? 'rgba(255,255,255,0.9)' : 'var(--color-gray-500)'
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
            marginTop: '2rem', padding: '1.5rem', background: 'var(--color-muted)', 
            borderRadius: '16px', maxHeight: '200px', overflowY: 'auto' 
          }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>
              Transactions for {monthName} {selectedDate}
            </h3>
            {selectedTransactions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedTransactions.map(tx => (
                  <div key={tx._id} style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'var(--color-background)', padding: '10px 14px', borderRadius: '10px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{getEmoji(tx.category)}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{tx.description || tx.category}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>{tx.category}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--color-danger)' }}>-₹{tx.amount}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--color-gray-500)', fontSize: '0.9rem', textAlign: 'center' }}>No transactions recorded for this day.</p>
            )}
          </div>
        )}

        <style>{`
          .nav-btn {
            background: var(--color-muted);
            border: none;
            border-radius: 8px;
            width: 32px;
            height: 32px;
            cursor: pointer;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          }
          .nav-btn:hover { background: var(--color-accent); }
          .calendar-day:hover { transform: scale(1.05); filter: brightness(1.1); }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid var(--color-muted);
            border-top: 4px solid var(--color-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
};
