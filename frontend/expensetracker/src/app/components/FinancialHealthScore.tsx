import React from 'react';

interface FinancialHealthScoreProps {
  score: number;
  details: {
    budgetUsage: number;
    savingsScore: number;
    overspendingScore: number;
  };
  insight: string;
}

export const FinancialHealthScore: React.FC<FinancialHealthScoreProps> = ({ score, details, insight }) => {
  // SVG Circle properties
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getScoreColor = (s: number) => {
    if (s >= 80) return '#10B981'; // Green
    if (s >= 60) return '#6366F1'; // Indigo
    if (s >= 40) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  const getGradientId = (s: number) => {
    if (s >= 80) return 'grad-success';
    if (s >= 60) return 'grad-primary';
    if (s >= 40) return 'grad-warning';
    return 'grad-danger';
  };

  const scoreColor = getScoreColor(score);
  const gradId = getGradientId(score);

  return (
    <div className="card financial-health-card" style={{ 
      padding: '1.5rem', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1.5rem',
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>
        {`
          @keyframes dash {
            from { stroke-dashoffset: ${circumference}; }
            to { stroke-dashoffset: ${offset}; }
          }
          .score-circle {
            animation: dash 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          .financial-health-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.12);
          }
          .financial-health-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
        `}
      </style>
      
      <div className="card-header-section">
        <h3 className="card-title" style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em' }}>Financial Health Score</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', position: 'relative' }}>
        <div style={{ position: 'relative', width: '160px', height: '160px' }}>
          <svg width="160" height="160" viewBox="0 0 160 160">
            <defs>
              <linearGradient id="grad-success" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#4F46E5" />
              </linearGradient>
              <linearGradient id="grad-warning" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="grad-danger" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#DC2626" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="var(--color-gray-100)"
              strokeWidth="12"
            />
            {/* Progress circle */}
            <circle
              className="score-circle"
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              strokeLinecap="round"
              filter="url(#glow)"
              style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-gray-900)', lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: '1rem', color: 'var(--color-gray-400)', display: 'block', marginTop: '4px' }}>/ 100</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="score-detail-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)', fontWeight: 500 }}>Budget Usage</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-900)' }}>{details.budgetUsage} / 40</span>
          </div>
          <div style={{ height: '8px', background: 'var(--color-gray-100)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${(details.budgetUsage / 40) * 100}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #6366F1, #4F46E5)', 
              borderRadius: '4px',
              transition: 'width 1.5s ease-out'
            }}></div>
          </div>
        </div>

        <div className="score-detail-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)', fontWeight: 500 }}>Savings Score</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-900)' }}>{details.savingsScore} / 30</span>
          </div>
          <div style={{ height: '8px', background: 'var(--color-gray-100)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${(details.savingsScore / 30) * 100}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #10B981, #059669)', 
              borderRadius: '4px',
              transition: 'width 1.5s ease-out'
            }}></div>
          </div>
        </div>

        <div className="score-detail-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)', fontWeight: 500 }}>Overspending Frequency</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-900)' }}>{details.overspendingScore} / 30</span>
          </div>
          <div style={{ height: '8px', background: 'var(--color-gray-100)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${(details.overspendingScore / 30) * 100}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #EF4444, #DC2626)', 
              borderRadius: '4px',
              transition: 'width 1.5s ease-out'
            }}></div>
          </div>
        </div>
      </div>

      <div style={{ 
        marginTop: 'auto', 
        padding: '1rem', 
        borderRadius: '0.75rem', 
        background: 'rgba(99, 102, 241, 0.05)', 
        border: '1px solid rgba(99, 102, 241, 0.1)',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start'
      }}>
        <div style={{ 
          background: 'var(--color-primary)', 
          borderRadius: '50%', 
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 17L12 22L22 17" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-700)', fontWeight: 500, margin: 0, lineHeight: 1.5 }}>
          {insight}
        </p>
      </div>
    </div>
  );
};
