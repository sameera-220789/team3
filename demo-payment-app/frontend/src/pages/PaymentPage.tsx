import React, { useState, useEffect } from "react";
import { PAYMENT_API, EXPENSE_TRACKER_URL, getUser } from "../utils/config";

/* ── Inline NovaPay Icon (no external deps) ── */
function NovaIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="ni-bolt" x1="14" y1="6" x2="34" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="60%" stopColor="#00C9FF" />
          <stop offset="100%" stopColor="#F5A623" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="rgba(0,201,255,0.1)" />
      <path d="M27 8L16 26H24L21 40L32 22H24L27 8Z" fill="url(#ni-bolt)" />
    </svg>
  );
}

interface SenderProfile {
  phone: string;
  bank: string;
  accNo: string;
  balance: number;
  upiPin: string;
}

const BANKS = ["HDFC Bank", "SBI Bank", "ICICI Bank", "Axis Bank", "Kotak Bank", "Yes Bank"];

export default function PaymentPage() {
  const user = getUser();

  const [step, setStep] = useState<"setup" | "select" | "details" | "amount" | "auth" | "processing" | "success">("setup");
  const [senderProfile, setSenderProfile] = useState<SenderProfile | null>(null);

  // Setup form
  const [setupPhone, setSetupPhone] = useState("");
  const [setupBank, setSetupBank] = useState("HDFC Bank");
  const [setupAccNo, setSetupAccNo] = useState("");
  const [setupBalance, setSetupBalance] = useState("");
  const [setupPin, setSetupPin] = useState("");

  // Payment form
  const [paymentMode, setPaymentMode] = useState<"mobile" | "bank" | "qr">("mobile");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [upiPin, setUpiPin] = useState("");
  const [error, setError] = useState("");
  const [processStage, setProcessStage] = useState("Connecting Securely...");
  const [detectedCategory, setDetectedCategory] = useState("");
  const [checkingBalance, setCheckingBalance] = useState(false);
  const [balancePin, setBalancePin] = useState("");
  const [balanceVisible, setBalanceVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("demoSenderProfile");
    if (saved) {
      setSenderProfile(JSON.parse(saved));
      setStep("select");
    }
  }, []);

  useEffect(() => {
    if (senderProfile) {
      localStorage.setItem("demoSenderProfile", JSON.stringify(senderProfile));
    }
  }, [senderProfile]);

  useEffect(() => {
    const syncBalance = async () => {
      if (senderProfile && user) {
        try {
          const res = await fetch(`${EXPENSE_TRACKER_URL}/api/auth/profile?userId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            setSenderProfile(prev => prev ? { ...prev, balance: data.totalSavings || 0 } : null);
          }
        } catch (e) { console.error("Sync error", e); }
      }
    };
    syncBalance();
  }, [user?.id]);

  const recentContacts = [
    { name: "Rahul", initial: "R", phone: "9876543210", color: "#00C9FF" },
    { name: "Swiggy", initial: "S", phone: "9999988888", color: "#F5A623" },
    { name: "Airtel", initial: "A", phone: "9876512345", color: "#A259FF" },
    { name: "Priya", initial: "P", phone: "9123456789", color: "#00E5A0" },
    { name: "Netflix", initial: "N", phone: "9888877766", color: "#FF4D6D" },
  ];

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupPhone || !setupBank || !setupAccNo || !setupBalance || setupPin.length !== 4) {
      return setError("Please fill all details and set a 4-digit UPI PIN");
    }
    try {
      if (user) {
        await fetch(`${EXPENSE_TRACKER_URL}/api/auth/profile`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, totalSavings: Number(setupBalance) })
        });
      }
      setSenderProfile({ phone: setupPhone, bank: setupBank, accNo: setupAccNo, balance: Number(setupBalance), upiPin: setupPin });
      setError("");
      setStep("select");
    } catch (e) {
      setError("Failed to sync balance with server");
    }
  };

  const handleResetProfile = () => {
    localStorage.removeItem("demoSenderProfile");
    setSenderProfile(null);
    setStep("setup");
  };

  const handleScanClick = () => {
    setPaymentMode("qr");
    setStep("details");
    setTimeout(() => { setReceiverName("Starbucks Outlet"); setStep("amount"); }, 2500);
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMode === "mobile" && !phoneNumber && !receiverName) return setError("Enter Mobile Number");
    if (paymentMode === "bank" && (!bankAccount || !ifsc || !receiverName)) return setError("Fill all bank details");
    setError("");
    setStep("amount");
  };

  const executePayment = async () => {
    if (upiPin !== senderProfile?.upiPin) {
      setError("Incorrect UPI PIN!");
      setUpiPin("");
      return;
    }
    if (Number(amount) > (senderProfile.balance || 0)) {
      setError("Insufficient Balance!");
      setUpiPin("");
      return;
    }
    setError("");
    setStep("processing");
    setTimeout(() => setProcessStage("Requesting Bank..."), 1000);
    setTimeout(() => setProcessStage("Processing Payment..."), 2000);

    let finalReceiver = receiverName;
    if (paymentMode === "mobile") finalReceiver = receiverName || `Mobile: ${phoneNumber}`;
    else if (paymentMode === "bank") finalReceiver = receiverName || `Bank AC: ${bankAccount}`;
    else if (paymentMode === "qr") finalReceiver = receiverName || "Merchant";

    try {
      const paymentRes = await fetch(`${PAYMENT_API}/api/payments/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "demo",
          amount: Number(amount),
          receiver: finalReceiver,
          category: "",
          note,
          phoneNumber: paymentMode === "mobile" ? phoneNumber : "",
          bankDetails: paymentMode === "bank" ? `${bankAccount} (${ifsc})` : ""
        })
      });
      if (!paymentRes.ok) throw new Error("Payment processing failed");
      const savedData = await paymentRes.json();
      setDetectedCategory(savedData.category || "Other");
      setSenderProfile((prev) => prev ? { ...prev, balance: prev.balance - Number(amount) } : null);
      window.dispatchEvent(new CustomEvent("payment:success", {
        detail: { amount: Number(amount), receiver: finalReceiver, category: savedData.category || "" }
      }));
      setTimeout(() => { setStep("success"); }, 3500);
    } catch (err: any) {
      setError(err.message || "Payment failed");
      setStep("amount");
    }
  };

  /* ── Back arrow component ── */
  const BackBtn = ({ to }: { to: typeof step }) => (
    <button
      onClick={() => setStep(to)}
      style={{
        background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)',
        color: 'var(--text)', cursor: 'pointer', padding: '8px',
        borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s'
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
      </svg>
    </button>
  );

  /* ── SETUP ── */
  if (step === "setup") {
    return (
      <div className="page-content">
        <header className="topbar">
          <BackBtn to="select" />
          <div style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'Space Grotesk, sans-serif' }}>
            {senderProfile ? "Edit Account" : "Link Your Bank"}
          </div>
          <div style={{ width: 36 }} />
        </header>

        <div className="scroll-container">
          {/* Hero card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,201,255,0.1), rgba(162,89,255,0.08))',
            border: '1px solid rgba(0,201,255,0.15)',
            borderRadius: 20, padding: '28px 24px',
            textAlign: 'center', marginBottom: 20
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'linear-gradient(135deg, rgba(0,201,255,0.15), rgba(162,89,255,0.12))',
              border: '1px solid rgba(0,201,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 30px rgba(0,201,255,0.2)'
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, fontFamily: 'Space Grotesk, sans-serif' }}>
              Setup Your Payment ID
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
              Link your bank account to enable seamless, secure one-click transfers.
            </p>
          </div>

          <form onSubmit={handleSetupSubmit} style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
            borderRadius: 20, padding: '24px'
          }}>
            {error && <div className="error-box">{error}</div>}

            <div className="field">
              <label>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 13, fontWeight: 600, color: 'var(--primary)'
                }}>+91</span>
                <input
                  type="text" value={setupPhone}
                  onChange={e => setSetupPhone(e.target.value)}
                  placeholder="9876543210" required
                  style={{ paddingLeft: 46 }}
                />
              </div>
            </div>

            <div className="field">
              <label>Select Bank</label>
              <select value={setupBank} onChange={e => setSetupBank(e.target.value)}>
                {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="field">
              <label>Last 4 Digits of Account No.</label>
              <input
                type="text" maxLength={4} value={setupAccNo}
                onChange={e => setSetupAccNo(e.target.value)}
                placeholder="1234" required
                style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '20px', fontWeight: 700 }}
              />
            </div>

            <div className="field">
              <label>Account Balance (₹)</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 16, fontWeight: 700, color: 'var(--text-secondary)'
                }}>₹</span>
                <input
                  type="number" value={setupBalance}
                  onChange={e => setSetupBalance(e.target.value)}
                  placeholder="50000" required style={{ paddingLeft: 32 }}
                />
              </div>
            </div>

            <div className="field">
              <label>Set 4-Digit UPI PIN</label>
              <input
                type="password" maxLength={4} value={setupPin}
                onChange={e => setSetupPin(e.target.value)}
                style={{ letterSpacing: '14px', textAlign: 'center', fontSize: '24px', fontWeight: 800 }}
                placeholder="••••" required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              {senderProfile ? "Save Changes" : "Activate NovaPay"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── SELECT ── */
  if (step === "select" && senderProfile) {
    return (
      <div className="page-content">
        <div className="scroll-container" style={{ paddingTop: 16 }}>

          {/* Balance Card */}
          <div className="profile-widget">
            <div className="row" style={{ marginBottom: 16 }}>
              <div>
                <div className="label">Linked Account</div>
                <div className="value" style={{ fontSize: 16, marginTop: 2 }}>
                  {senderProfile.bank}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  •••• {senderProfile.accNo}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="label">Available Balance</div>
                {balanceVisible ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                    <div className="value" style={{ color: 'var(--success)' }}>
                      ₹{senderProfile.balance.toLocaleString('en-IN')}
                    </div>
                    <button
                      onClick={() => setBalanceVisible(false)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    </button>
                  </div>
                ) : checkingBalance ? (
                  <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                    <input
                      type="password" value={balancePin}
                      onChange={e => setBalancePin(e.target.value)}
                      maxLength={4} autoFocus
                      placeholder="PIN"
                      style={{
                        width: 64, padding: '5px 8px', borderRadius: 8, border: '1px solid rgba(0,201,255,0.3)',
                        textAlign: 'center', color: '#fff', fontWeight: 700,
                        background: 'rgba(0,0,0,0.4)', fontSize: 14
                      }}
                    />
                    <button
                      onClick={() => {
                        if (balancePin === senderProfile.upiPin) { setBalanceVisible(true); setCheckingBalance(false); setBalancePin(""); }
                        else { setError("Incorrect PIN"); setBalancePin(""); }
                      }}
                      style={{
                        background: 'var(--primary)', color: '#060818',
                        border: 'none', padding: '5px 10px',
                        borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 12
                      }}
                    >OK</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setCheckingBalance(true)}
                    style={{
                      background: 'rgba(0,201,255,0.15)', border: '1px solid rgba(0,201,255,0.25)',
                      color: 'var(--primary)', padding: '5px 14px',
                      borderRadius: 20, fontSize: 12, cursor: 'pointer', fontWeight: 600, marginTop: 6
                    }}
                  >
                    View Balance
                  </button>
                )}
              </div>
            </div>

            {/* UPI ID */}
            <div style={{
              background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
                UPI: {senderProfile.phone}@novapay
              </span>
              <button
                onClick={() => setStep("setup")}
                style={{
                  marginLeft: 'auto', background: 'none', border: 'none',
                  color: 'var(--primary)', fontSize: 11, cursor: 'pointer', fontWeight: 600
                }}
              >Edit</button>
            </div>
          </div>

          {/* Transfer Options */}
          <div className="section-title">Send Money</div>
          <div className="mode-grid">
            <div className="mode-btn" onClick={() => { setPaymentMode("mobile"); setStep("details"); }}>
              <div className="mode-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </div>
              <div className="mode-label">Mobile Pay</div>
            </div>
            <div className="mode-btn" onClick={() => { setPaymentMode("bank"); setStep("details"); }}>
              <div className="mode-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
                </svg>
              </div>
              <div className="mode-label">Bank Transfer</div>
            </div>
            <div className="mode-btn" onClick={handleScanClick}>
              <div className="mode-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="3" height="3" />
                  <rect x="18" y="14" width="3" height="3" /><rect x="14" y="18" width="3" height="3" />
                  <rect x="18" y="18" width="3" height="3" />
                </svg>
              </div>
              <div className="mode-label">Scan QR</div>
            </div>
          </div>

          {/* Recent Contacts */}
          <div className="section-title" style={{ marginTop: 24 }}>Recent Contacts</div>
          <div className="contacts-row">
            {recentContacts.map(c => (
              <div
                key={c.phone}
                className="contact-chip"
                onClick={() => { setPhoneNumber(c.phone); setReceiverName(c.name); setPaymentMode("mobile"); setStep("amount"); }}
              >
                <div className="contact-avatar" style={{ color: c.color, borderColor: `${c.color}40`, background: `${c.color}18` }}>
                  {c.initial}
                </div>
                <div className="contact-name">{c.name}</div>
              </div>
            ))}
          </div>

          {/* Security note */}
          <div style={{
            marginTop: 24, padding: '12px 16px',
            background: 'rgba(0,229,160,0.05)', border: '1px solid rgba(0,229,160,0.12)',
            borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" style={{ flexShrink: 0 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              All transactions are end-to-end encrypted & synced to your Expense Tracker
            </span>
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={handleResetProfile}
            style={{ marginTop: 24, opacity: 0.5, width: '100%' }}
          >Reset App Data</button>
        </div>
      </div>
    );
  }

  /* ── DETAILS ── */
  if (step === "details") {
    return (
      <div className="page-content">
        <header className="topbar">
          <BackBtn to="select" />
          <div style={{ fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
            {paymentMode === 'mobile' ? 'Pay to Mobile' : paymentMode === 'bank' ? 'Bank Transfer' : 'Scan QR Code'}
          </div>
          <div style={{ width: 36 }} />
        </header>

        <div className="scroll-container">
          {paymentMode === "qr" && (
            <div style={{
              background: '#000', borderRadius: 20, padding: '40px 30px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              minHeight: 380, position: 'relative', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at center, rgba(0,201,255,0.05) 0%, transparent 70%)'
              }} />
              {/* QR Frame with corner accents */}
              <div style={{ position: 'relative', width: 220, height: 220 }}>
                <div style={{
                  width: '100%', height: '100%',
                  border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 20,
                  position: 'relative', overflow: 'hidden'
                }}>
                  {/* Scan line */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                    background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
                    boxShadow: '0 0 20px var(--primary)',
                    animation: 'scanLine 2.5s linear infinite'
                  }} />
                </div>
                {/* Corner pieces */}
                {[
                  { top: -1, left: -1, borderTop: '3px solid var(--primary)', borderLeft: '3px solid var(--primary)', borderRadius: '8px 0 0 0' },
                  { top: -1, right: -1, borderTop: '3px solid var(--primary)', borderRight: '3px solid var(--primary)', borderRadius: '0 8px 0 0' },
                  { bottom: -1, left: -1, borderBottom: '3px solid var(--primary)', borderLeft: '3px solid var(--primary)', borderRadius: '0 0 0 8px' },
                  { bottom: -1, right: -1, borderBottom: '3px solid var(--primary)', borderRight: '3px solid var(--primary)', borderRadius: '0 0 8px 0' },
                ].map((style, i) => (
                  <div key={i} style={{ position: 'absolute', width: 24, height: 24, ...style as any }} />
                ))}
              </div>
              <p style={{ color: 'var(--text-secondary)', marginTop: 32, fontWeight: 600, fontSize: 15, textAlign: 'center' }}>
                Position QR code in the frame
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>Hold steady for best results</p>
              <style>{`@keyframes scanLine { 0% { top:0; } 50% { top:calc(100% - 3px); } 100% { top:0; } }`}</style>
            </div>
          )}

          {paymentMode !== "qr" && (
            <form onSubmit={handleDetailsSubmit} style={{
              background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
              border: '1px solid var(--glass-border)', borderRadius: 20, padding: '24px'
            }}>
              {error && <div className="error-box">{error}</div>}

              {paymentMode === "mobile" && (
                <>
                  <div className="field" style={{ marginBottom: 32 }}>
                    <label>Mobile Number</label>
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid var(--border-strong)', paddingBottom: 10 }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', marginRight: 10 }}>+91</span>
                      <input
                        type="text" value={phoneNumber}
                        onChange={(e) => { setPhoneNumber(e.target.value); setReceiverName(""); }}
                        placeholder="00000 00000" autoFocus
                        style={{
                          width: '100%', fontSize: 22, fontWeight: 700,
                          border: 'none', outline: 'none', background: 'transparent', color: 'var(--text)',
                          letterSpacing: '1px'
                        }}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ marginBottom: 32 }}>Continue</button>

                  <div className="section-title">Recent Contacts</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {recentContacts.map(c => (
                      <div
                        key={c.phone}
                        onClick={() => { setPhoneNumber(c.phone); setReceiverName(c.name); setStep("amount"); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                          padding: '12px 14px', borderRadius: 12, transition: 'background 0.2s'
                        }}
                        onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                        onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{
                          width: 44, height: 44, borderRadius: 13,
                          background: `${c.color}18`, border: `1px solid ${c.color}40`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: c.color, fontWeight: 700, fontSize: 17
                        }}>{c.initial}</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{c.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.phone}</div>
                        </div>
                        <div style={{ marginLeft: 'auto' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {paymentMode === "bank" && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div className="field">
                    <label>Account Number</label>
                    <input type="text" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="000000000000" autoFocus />
                  </div>
                  <div className="field">
                    <label>IFSC Code</label>
                    <input type="text" value={ifsc} onChange={(e) => setIfsc(e.target.value)} placeholder="BANK0001234" style={{ textTransform: 'uppercase' }} />
                  </div>
                  <div className="field">
                    <label>Account Holder Name</label>
                    <input type="text" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} placeholder="Full Name" />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ marginTop: 6 }}>Verify & Continue</button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    );
  }

  /* ── AMOUNT ── */
  if (step === "amount") {
    return (
      <div className="page-content">
        <header className="topbar">
          <BackBtn to="details" />
          <div style={{ fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>Enter Amount</div>
          <div style={{ width: 36 }} />
        </header>

        <div className="scroll-container">
          {/* Receiver card */}
          <div style={{
            background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)', borderRadius: 20,
            padding: '28px 24px', textAlign: 'center', marginBottom: 16
          }}>
            <div style={{
              width: 68, height: 68, borderRadius: 19,
              background: 'linear-gradient(135deg, rgba(0,201,255,0.15), rgba(162,89,255,0.1))',
              border: '1px solid rgba(0,201,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: 26, fontWeight: 800, color: 'var(--primary)',
              boxShadow: '0 0 24px rgba(0,201,255,0.15)'
            }}>
              {(receiverName || "U")[0].toUpperCase()}
            </div>
            <h2 style={{ fontSize: 19, fontWeight: 800, marginBottom: 4, fontFamily: 'Space Grotesk, sans-serif' }}>
              {receiverName || phoneNumber}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
              {paymentMode === 'bank' ? bankAccount : (phoneNumber || 'UPI ID')}
            </p>

            <div className="glow-divider" style={{ margin: '22px 0' }} />

            {error && <div className="error-box">{error}</div>}

            {/* Amount input */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-secondary)' }}>₹</span>
              <input
                type="number" value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                style={{
                  fontSize: 58, fontWeight: 900, width: '100%', maxWidth: 240,
                  textAlign: 'center', border: 'none', outline: 'none',
                  color: amount ? 'var(--primary)' : 'var(--text-muted)',
                  background: 'transparent', fontFamily: 'Space Grotesk, sans-serif'
                }}
                autoFocus
              />
            </div>

            {/* Quick amount chips */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 18 }}>
              {[100, 500, 1000, 2000].map(q => (
                <button
                  key={q}
                  onClick={() => setAmount(String(q))}
                  style={{
                    background: amount === String(q) ? 'rgba(0,201,255,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${amount === String(q) ? 'rgba(0,201,255,0.4)' : 'var(--glass-border)'}`,
                    borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 600,
                    color: amount === String(q) ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >₹{q}</button>
              ))}
            </div>

            <div style={{ marginTop: 18 }}>
              <input
                type="text" value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="💬 What's this for? (optional)"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12,
                  border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)',
                  color: 'var(--text)', fontSize: 14, fontFamily: 'Inter, sans-serif',
                  outline: 'none', transition: 'all 0.2s', textAlign: 'center'
                }}
              />
            </div>
          </div>

          {/* Bank row */}
          <div className="bank-row">
            <div className="bank-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
              </svg>
            </div>
            <div className="bank-meta">
              <div className="bank-name">{senderProfile?.bank}</div>
              <div className="bank-acno">•••• {senderProfile?.accNo.slice(-4)}</div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              if (!amount || Number(amount) <= 0) return setError("Please enter an amount");
              if (Number(amount) > (senderProfile?.balance || 0)) return setError("Insufficient Balance!");
              setError("");
              setStep("auth");
            }}
            style={{ marginTop: 16, padding: '18px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Pay Securely · ₹{amount || "0"}
          </button>
        </div>
      </div>
    );
  }

  /* ── AUTH / PIN ── */
  if (step === "auth") {
    return (
      <div className="page-content">
        <header className="topbar">
          <BackBtn to="amount" />
          <div style={{ fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>Authorize Payment</div>
          <div style={{ width: 36 }} />
        </header>

        <div className="scroll-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '100%', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)', borderRadius: 20,
            padding: '32px 24px', textAlign: 'center', marginBottom: 28
          }}>
            {/* Amount display */}
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
              Paying to
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
              {receiverName || phoneNumber}
            </div>
            <div style={{
              fontSize: 42, fontWeight: 900, color: 'var(--primary)',
              fontFamily: 'Space Grotesk, sans-serif', marginTop: 12, marginBottom: 4
            }}>
              ₹{amount}
            </div>

            <div className="glow-divider" style={{ margin: '22px 0' }} />

            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
              Enter 4-Digit UPI PIN
            </div>

            {/* PIN dots */}
            <div className="pin-dots">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`pin-dot ${upiPin.length > i ? 'filled' : ''}`} />
              ))}
            </div>

            {error && <div style={{ color: 'var(--danger)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{error}</div>}
          </div>

          {/* PIN Keypad */}
          <div className="pin-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                className="pin-key"
                onClick={() => upiPin.length < 4 && setUpiPin(p => p + num)}
              >{num}</button>
            ))}
            <div />
            <button className="pin-key" onClick={() => upiPin.length < 4 && setUpiPin(p => p + "0")}>0</button>
            <button
              className="pin-key"
              style={{ border: 'none', background: 'none', boxShadow: 'none' }}
              onClick={() => setUpiPin(p => p.slice(0, -1))}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                <line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" />
              </svg>
            </button>
          </div>

          <button
            className="btn btn-success"
            disabled={upiPin.length !== 4}
            onClick={executePayment}
            style={{ marginTop: 36, maxWidth: 300 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Confirm Payment
          </button>
        </div>
      </div>
    );
  }

  /* ── PROCESSING ── */
  if (step === "processing") {
    return (
      <div className="processing-screen">
        <div className="processing-pulse" />
        <div className="processing-pulse" style={{ animationDelay: '0.8s', opacity: 0.6 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 32 }}>
            <NovaIcon size={48} />
          </div>
          <div className="spinner-ring" style={{ margin: '0 auto 28px' }} />
          <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text)' }}>
            {processStage}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 14 }}>
            Securely communicating with bank...
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
            marginTop: 24, padding: '10px 16px',
            background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.15)',
            borderRadius: 12, fontSize: 12, color: 'var(--success)'
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            256-bit SSL Encrypted
          </div>
        </div>
      </div>
    );
  }

  /* ── SUCCESS ── */
  if (step === "success") {
    return (
      <div className="success-screen">
        <div className="success-card">
          {/* Icon */}
          <div className="success-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div className="success-amount">₹{amount}</div>
          <div className="success-label">Payment Successful!</div>

          {/* Synced badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,
            padding: '6px 14px', borderRadius: 20,
            background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)',
            fontSize: 12, color: 'var(--success)', fontWeight: 600
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Synced to Smart Expense Tracker
          </div>

          <div className="divider" />

          {/* Receipt */}
          <div id="payment-success-msg" data-amount={amount} data-receiver={receiverName || phoneNumber || bankAccount}>
            <div className="receipt-row">
              <span className="key">To</span>
              <span className="val">{receiverName || phoneNumber || bankAccount}</span>
            </div>
            <div className="receipt-row">
              <span className="key">From</span>
              <span className="val">{senderProfile?.bank} (••{senderProfile?.accNo.slice(-2)})</span>
            </div>
            <div className="receipt-row">
              <span className="key">Date</span>
              <span className="val">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="receipt-row">
              <span className="key">Ref No.</span>
              <span className="val" style={{ fontFamily: 'monospace', fontSize: 12 }}>
                {Math.floor(Math.random() * 9000000000) + 1000000000}
              </span>
            </div>
          </div>

          {/* Category badge */}
          <div className="category-badge">
            <div className="badge-label">Auto-Categorized</div>
            <div className="badge-value">{detectedCategory} ✨</div>
          </div>

          <button
            onClick={() => {
              setStep("select");
              setAmount(""); setReceiverName(""); setPhoneNumber("");
              setBankAccount(""); setIfsc(""); setNote(""); setUpiPin("");
            }}
            className="btn btn-primary"
            style={{ marginTop: 24 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Make Another Payment
          </button>
        </div>
      </div>
    );
  }

  return null;
}
