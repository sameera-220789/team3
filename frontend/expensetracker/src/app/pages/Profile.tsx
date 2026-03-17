import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser } from "../utils/api";
import { ThemeToggle } from "../components/ThemeToggle";

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  currency: string;
  memberSince: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const localUser = getUser();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localUser) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/auth/profile?userId=${localUser.id}`
        );
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          const errData = await res.json();
          setError(errData.message || "Failed to load profile.");
        }
      } catch (err) {
        setError("Network error. Could not load profile.");
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [localUser, navigate]);

  return (
    <div className="dashboard-page profile-modern-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="8" fill="url(#gradient-sidebar-p)" />
              <path d="M20 10L28 20L20 30L12 20L20 10Z" fill="white" opacity="0.9" />
              <defs>
                <linearGradient id="gradient-sidebar-p" x1="0" y1="0" x2="40" y2="40">
                  <stop offset="0%" style={{ stopColor: "#6366f1" }} />
                  <stop offset="100%" style={{ stopColor: "#8b5cf6" }} />
                </linearGradient>
              </defs>
            </svg>
            <span className="logo-text">ExpenseFlow</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="sidebar-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 7L10 3L17 7V17C17 17.5304 16.7893 18.0391 16.4142 18.4142C16.0391 18.7893 15.5304 19 15 19H5C4.46957 19 3.96086 18.7893 3.58579 18.4142C3.21071 18.0391 3 17.5304 3 17V7Z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Dashboard</span>
          </Link>
          <Link to="/add-expense" className="sidebar-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 5V15M5 10H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Add Expense</span>
          </Link>
          <Link to="/budget" className="sidebar-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 6V10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Budgets</span>
          </Link>
          <Link to="/dashboard/transactions" className="sidebar-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 8H17" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Transactions</span>
          </Link>
          <Link to="/dashboard/reports" className="sidebar-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 4H17V16H3V4Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 8L12 12M12 8L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Reports</span>
          </Link>
        </nav>
        <div className="sidebar-footer">
          <Link to="/profile" className="sidebar-link active">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 11C12.2091 11 14 9.20914 14 7C14 4.79086 12.2091 3 10 3C7.79086 3 6 4.79086 6 7C6 9.20914 7.79086 11 10 11Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 17V16C3 14.3431 4.34315 13 6 13H14C15.6569 13 17 14.3431 17 16V17" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Profile</span>
          </Link>
          <button
            className="sidebar-link logout-btn"
            onClick={() => { localStorage.clear(); navigate("/login"); }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M13 3H15C15.5304 3 16.0391 3.21071 16.4142 3.58579C16.7893 3.96086 17 4.46957 17 5V15C17 15.5304 16.7893 16.0391 16.4142 16.4142C16.0391 16.7893 15.5304 17 15 17H13M7 13L3 10M3 10L7 7M3 10H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{ padding: 0 }}>
        
        {/* Dynamic Header Over Hero */}
        <div style={{ position: 'relative', width: '100%' }}>
          {/* Stunning Gradients Background */}
          <div className="profile-hero-bg" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '350px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            overflow: 'hidden',
            zIndex: 0,
            borderBottomLeftRadius: '2rem',
            borderBottomRightRadius: '2rem'
          }}>
            {/* Ambient Lighting Orbs */}
            <div style={{ position: 'absolute', top: '-100px', left: '-50px', width: '400px', height: '400px', background: 'var(--color-info)', filter: 'blur(100px)', opacity: 0.4, borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', bottom: '-50px', right: '10%', width: '300px', height: '300px', background: '#ec4899', filter: 'blur(100px)', opacity: 0.3, borderRadius: '50%' }}></div>
            
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position:'absolute', opacity:0.1, top:0, left:0 }}>
              <defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="#fff" /></pattern></defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>

          <header style={{
            position: 'relative',
            zIndex: 10,
            padding: '2rem 3rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white'
          }}>
            <div>
              <h1 className="profile-hero-text" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>My Profile</h1>
              <p className="profile-hero-text" style={{ margin: '0.25rem 0 0', opacity: 0.8, fontSize: '0.95rem' }}>Manage your personal details and app preferences</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '6px', borderRadius: '50%' }}>
                <ThemeToggle />
              </div>
            </div>
          </header>

          <div style={{ position: 'relative', zIndex: 10, padding: '0 3rem', marginTop: '1.5rem', minHeight: 'calc(100vh - 180px)' }}>

            {loading && (
              <div style={{ padding: "4rem", textAlign: "center", color: 'var(--color-gray-900)' }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem", animation: 'pulse 2s infinite' }}>⏳</div>
                <p style={{ fontWeight: 500, opacity: 0.9 }}>Syncing data...</p>
              </div>
            )}

            {error && !loading && (
              <div style={{ 
                padding: "2rem", 
                textAlign: "center", 
                background: 'var(--color-danger-light)', 
                backdropFilter: 'blur(12px)',
                borderRadius: '1rem',
                color: 'var(--color-gray-900)',
                boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.4)',
                marginTop: '2rem'
              }}>
                <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>⚠️ {error}</p>
              </div>
            )}

            {profile && !loading && (
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 2fr", 
                gap: "2rem", 
                alignItems: "start",
                paddingBottom: '3rem'
              }}>

                {/* Left Column: Glassmorphism ID Card */}
                <div className="profile-id-card profile-glass-card">
                  {/* Floating Avatar */}
                  <div style={{
                    position: 'relative',
                    width: '120px',
                    height: '120px',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                      borderRadius: '50%',
                      filter: 'blur(15px)',
                      opacity: 0.6,
                      animation: 'pulse 3s infinite alternate'
                    }}></div>
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      background: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      fontWeight: 800,
                      color: 'var(--color-primary)',
                      border: '4px solid rgba(255,255,255,0.9)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      zIndex: 2
                    }}>
                       {profile.firstName?.[0]?.toUpperCase()}{profile.lastName?.[0]?.toUpperCase()}
                    </div>
                  </div>

                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.25rem 0', letterSpacing: '-0.01em', color: 'inherit' }}>
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p style={{ fontSize: '1rem', opacity: 0.8, margin: '0 0 1.5rem 0' }}>{profile.email}</p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1.25rem',
                    background: 'var(--color-gray-100)',
                    color: 'var(--color-gray-900)',
                    borderRadius: '2rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    <span style={{ width: '8px', height: '8px', background: '#34d399', borderRadius: '50%', boxShadow: '0 0 8px #34d399' }}></span>
                    Active Member
                  </div>
                </div>

                {/* Right Column: Premium Details Grid */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr", 
                  gap: "1.5rem",
                  marginTop: '4rem' 
                }}>
                  
                  <DetailCard 
                    icon={
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    }
                    title="Identity"
                    items={[
                      { label: "First Name", value: profile.firstName },
                      { label: "Last Name", value: profile.lastName },
                    ]}
                  />

                  <DetailCard 
                    icon={
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    }
                    title="Contact"
                    items={[
                      { label: "Email Address", value: profile.email },
                    ]}
                  />

                  <DetailCard 
                    icon={
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                         <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                         <path d="M12 16V12L14.5 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    }
                    title="Platform Activity"
                    items={[
                      { label: "Member Since", value: new Date(profile.memberSince).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) },
                      { label: "Account Status", value: "Verified" }
                    ]}
                  />

                  <DetailCard 
                    icon={
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12C13.1046 12 14 12.8954 14 14C14 15.1046 13.1046 16 12 16M12 8C13.1046 8 14 8.89543 14 10M12 8V6M12 16C10.8954 16 10 15.1046 10 14M12 16V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    }
                    title="Preferences"
                    items={[
                      { label: "Primary Currency", value: profile.currency || "USD ($)" },
                      { label: "Billing Tier", value: "Free Plan" }
                    ]}
                  />

                </div>

              </div>
            )}
          </div>
        </div>
      </main>

      {/* Internal CSS for hover effects that can't be easily done inline */}
      <style>{`
        .profile-id-card {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .profile-id-card:hover {
          transform: translateY(-8px);
        }
        .detail-card {
          background: var(--color-gray-50);
          border: 1px solid var(--color-gray-200);
          border-radius: 1.25rem;
          padding: 1.75rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .dark .detail-card {
          background: #1e1e1e;
          border-color: #3f3f3f;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        .detail-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 20px -5px rgba(0,0,0,0.1);
          border-color: var(--color-primary-light);
        }
        .dark .detail-card:hover {
          box-shadow: 0 12px 20px -5px rgba(0,0,0,0.4);
          border-color: #6366f1;
        }
        .detail-card-icon {
          color: var(--color-primary);
          background: var(--color-primary-light);
          background-opacity: 0.1;
          padding: 10px;
          border-radius: 12px;
          display: inline-flex;
          margin-bottom: 1rem;
        }
        .dark .detail-card-icon {
          background: rgba(99, 102, 241, 0.15);
        }
      `}</style>
    </div>
  );
}

function DetailCard({ title, icon, items }: { title: string, icon: React.ReactNode, items: { label: string, value: string }[] }) {
  return (
    <div className="detail-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div className="detail-card-icon" style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '10px', color: '#6366f1' }}>
          {icon}
        </div>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--color-gray-900)' }}>{title}</h3>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.25rem',
            paddingBottom: idx === items.length - 1 ? 0 : '1rem',
            borderBottom: idx === items.length - 1 ? 'none' : '1px solid var(--color-gray-200)'
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 500, color: 'var(--color-gray-800)', wordBreak: 'break-word' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
