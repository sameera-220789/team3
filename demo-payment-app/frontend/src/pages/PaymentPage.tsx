import React, { useState, useEffect } from "react";
import { ThemeToggle } from "../components/ThemeToggle";
import { PAYMENT_API, EXPENSE_TRACKER_URL, getUser } from "../utils/config";

// Modern UI theme definitions
const THEME = {
  primary: "var(--primary)",
  primaryLight: "var(--primary-light)",
  success: "var(--success)",
  background: "var(--bg)",
  surface: "var(--surface)",
  textHeader: "var(--text)",
  textSub: "var(--text-muted)",
  border: "var(--border)",
};

interface SenderProfile {
  phone: string;
  bank: string;
  accNo: string;
  balance: number;
  upiPin: string;
}

export default function PaymentPage() {
  const user = getUser();
  
  // Stages: 'setup' | 'select' | 'details' | 'amount' | 'auth' | 'processing' | 'success'
  const [step, setStep] = useState<"setup" | "select" | "details" | "amount" | "auth" | "processing" | "success">("setup");
  const [senderProfile, setSenderProfile] = useState<SenderProfile | null>(null);

  // Setup form states
  const [setupPhone, setSetupPhone] = useState("");
  const [setupBank, setSetupBank] = useState("HDFC Bank");
  const [setupAccNo, setSetupAccNo] = useState("");
  const [setupBalance, setSetupBalance] = useState("");
  const [setupPin, setSetupPin] = useState("");

  // Payment Selection & Form States
  const [paymentMode, setPaymentMode] = useState<"mobile"| "bank" | "qr">("mobile");
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
    // Optionally sync balance from main DB if user is provided
    const syncBalance = async () => {
      if (senderProfile && user) {
        try {
          // Cross-origin request to Expense Tracker
          const res = await fetch(`${EXPENSE_TRACKER_URL}/api/auth/profile?userId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            setSenderProfile(prev => prev ? { ...prev, balance: data.totalSavings || 0 } : null);
          }
        } catch (e) {
          console.error("Sync error", e);
        }
      }
    };
    syncBalance();
  }, [user?.id]);

  const recentContacts = [
    { name: "Rahul", initial: "R", phone: "9876543210" },
    { name: "Swiggy", initial: "S", phone: "9999988888" },
    { name: "Airtel", initial: "A", phone: "9876512345" },
    { name: "Priya", initial: "P", phone: "9123456789" },
  ];

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupPhone || !setupBank || !setupAccNo || !setupBalance || setupPin.length !== 4) {
      return setError("Please fill all details and set a 4-digit UPI PIN");
    }

    try {
      // If user exists, sync initial balance to DB
      if (user) {
        await fetch(`${EXPENSE_TRACKER_URL}/api/auth/profile`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, totalSavings: Number(setupBalance) })
        });
      }

      setSenderProfile({
        phone: setupPhone,
        bank: setupBank,
        accNo: setupAccNo,
        balance: Number(setupBalance),
        upiPin: setupPin
      });
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
    setTimeout(() => {
      setReceiverName("Starbucks Outlet");
      setStep("amount");
    }, 2500);
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
      setError("Insufficient Bank Balance!");
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
          userId: user?.id || "demo", // Backend handles "demo" natively
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

      // Deduct Balance
      setSenderProfile((prev) => prev ? { ...prev, balance: prev.balance - Number(amount) } : null);

      // 🔔 Dispatch custom event for Chrome Extension to detect payment success
      // The extension listens for 'payment:success' and forwards to Smart Expense Tracker
      window.dispatchEvent(new CustomEvent("payment:success", {
        detail: {
          amount: Number(amount),
          receiver: finalReceiver,
          category: savedData.category || ""
        }
      }));

      setTimeout(() => {
        setStep("success");
      }, 3500);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Payment failed");
      setStep("amount");
    }
  };

  // ------------------------------------------------------------------
  // RENDER SETUP (STEP: setup)
  // ------------------------------------------------------------------
  if (step === "setup") {
    return (
      <div className="page-content">
        <header className="topbar">
          <button onClick={() => senderProfile ? setStep("select") : null} style={{ background: 'none', border: 'none', color: 'white', cursor: senderProfile ? 'pointer' : 'default', padding: 0, opacity: senderProfile ? 1 : 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          <div className="topbar-title">{senderProfile ? "Edit Account" : "Link Bank"}</div>
          <ThemeToggle />
        </header>

        <div className="scroll-container">
          <div className="card" style={{ marginBottom: '24px', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px', boxShadow: 'var(--shadow)' }}>
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Setup Payment ID</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Link your bank to enable seamless one-click transfers.</p>
          </div>
          
          <form onSubmit={handleSetupSubmit} className="card" style={{ padding: '24px' }}>
            {error && <div className="error-box">{error}</div>}
            
            <div className="field">
              <label>Phone Number</label>
              <input type="text" value={setupPhone} onChange={e => setSetupPhone(e.target.value)} placeholder="9876543210" required />
            </div>

            <div className="field">
              <label>Link Bank</label>
              <select value={setupBank} onChange={e => setSetupBank(e.target.value)}>
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="SBI Bank">SBI Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="Axis Bank">Axis Bank</option>
              </select>
            </div>

            <div className="field">
              <label>Last 4 Digits of A/C</label>
              <input type="text" maxLength={4} value={setupAccNo} onChange={e => setSetupAccNo(e.target.value)} placeholder="1234" required />
            </div>

            <div className="field">
              <label>Initial Balance (₹)</label>
              <input type="number" value={setupBalance} onChange={e => setSetupBalance(e.target.value)} placeholder="50000" required />
            </div>

            <div className="field">
               <label>Set 4-Digit UPI PIN</label>
               <input type="password" maxLength={4} value={setupPin} onChange={e => setSetupPin(e.target.value)} style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '20px' }} placeholder="****" required />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
              {senderProfile ? "Save Changes" : "Create Profile"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // RENDER SELECTIONS (STEP: select)
  // ------------------------------------------------------------------
  if (step === "select" && senderProfile) {
    return (
      <div className="page-content">
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
            <div className="topbar-title">Demo Pay</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ThemeToggle />
            <button className="btn btn-ghost btn-sm" onClick={() => setStep("setup")} style={{ border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}>Edit</button>
          </div>
        </header>

        <div className="scroll-container">
          <div className="profile-widget">
            <div className="row">
               <div>
                  <div className="label">Linked Account</div>
                  <div className="value">{senderProfile.bank} • {senderProfile.accNo}</div>
               </div>
               <div style={{ textAlign: 'right' }}>
                  <div className="label">Balance</div>
                  {balanceVisible ? (
                    <div className="value" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                      ₹{senderProfile.balance.toLocaleString('en-IN')}
                      <button onClick={() => setBalanceVisible(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      </button>
                    </div>
                  ) : checkingBalance ? (
                    <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input type="password" value={balancePin} onChange={e => setBalancePin(e.target.value)} maxLength={4} style={{ width: '60px', padding: '4px', borderRadius: '6px', border: 'none', textAlign: 'center', color: '#000', fontWeight: 'bold' }} placeholder="PIN" autoFocus />
                      <button onClick={() => { if (balancePin === senderProfile.upiPin) { setBalanceVisible(true); setCheckingBalance(false); setBalancePin(""); } else { alert("Incorrect PIN"); setBalancePin(""); } }} style={{ background: 'white', color: 'var(--primary)', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }}>OK</button>
                    </div>
                  ) : (
                    <button onClick={() => setCheckingBalance(true)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer', fontWeight: 600, marginTop: '4px' }}>Show</button>
                  )}
               </div>
            </div>
          </div>

          <div className="section-title">Transfer Options</div>
          <div className="mode-grid">
            <div className="mode-btn" onClick={() => { setPaymentMode("mobile"); setStep("details"); }}>
              <div className="mode-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
              </div>
              <div className="mode-label">To Mobile</div>
            </div>
            <div className="mode-btn" onClick={() => { setPaymentMode("bank"); setStep("details"); }}>
              <div className="mode-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>
              </div>
              <div className="mode-label">To Bank</div>
            </div>
            <div className="mode-btn" onClick={handleScanClick}>
              <div className="mode-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </div>
              <div className="mode-label">Scan QR</div>
            </div>
          </div>

          <div className="section-title" style={{ marginTop: '24px' }}>Recent Contacts</div>
          <div className="contacts-row">
            {recentContacts.map(c => (
              <div key={c.phone} className="contact-chip" onClick={() => { setPhoneNumber(c.phone); setReceiverName(c.name); setPaymentMode("mobile"); setStep("amount"); }}>
                <div className="contact-avatar">{c.initial}</div>
                <div className="contact-name">{c.name}</div>
              </div>
            ))}
          </div>

          <button className="btn btn-ghost btn-sm" onClick={handleResetProfile} style={{ marginTop: '30px', opacity: 0.6 }}>Reset App Data</button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // RENDER DETAILS FORM (STEP: details)
  // ------------------------------------------------------------------
  if (step === "details") {
    return (
      <div className="page-content">
        <header className="topbar">
          <button onClick={() => setStep("select")} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          <div className="topbar-title">{paymentMode === 'mobile' ? 'Mobile Pay' : paymentMode === 'bank' ? 'Bank Transfer' : 'Scan QR'}</div>
          <ThemeToggle />
        </header>

        <div className="scroll-container">
          {paymentMode === "qr" && (
            <div className="card" style={{ backgroundColor: "#000", padding: '30px', height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <div style={{ width: "220px", height: "220px", border: "2px solid rgba(255,255,255,0.4)", borderRadius: "24px", position: "relative" }}>
                 <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", backgroundColor: "var(--success)", animation: "scanLine 2.5s linear infinite", boxShadow: '0 0 15px var(--success)' }}></div>
              </div>
              <p style={{ color: "white", marginTop: "32px", fontWeight: 600, fontSize: '16px', letterSpacing: '0.5px' }}>Position QR code in the frame</p>
              <style>{`@keyframes scanLine { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }`}</style>
            </div>
          )}

          {paymentMode !== "qr" && (
            <form onSubmit={handleDetailsSubmit} className="card" style={{ padding: '24px' }}>
              {error && <div className="error-box">{error}</div>}
              
              {paymentMode === "mobile" && (
                <>
                  <div className="field" style={{ marginBottom: '32px' }}>
                    <label>Mobile Number</label>
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: `2.5px solid var(--primary)`, paddingBottom: '8px' }}>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginRight: '10px' }}>+91</span>
                      <input type="text" value={phoneNumber} onChange={(e) => { setPhoneNumber(e.target.value); setReceiverName(""); }} placeholder="00000 00000" style={{ width: '100%', fontSize: '20px', fontWeight: 700, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text)' }} autoFocus/>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ marginBottom: '32px' }}>Proceed</button>
                  
                  <div className="section-title">Recent Payments</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {recentContacts.map(c => (
                      <div key={c.phone} onClick={() => { setPhoneNumber(c.phone); setReceiverName(c.name); setStep("amount"); }} style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', padding: '12px', borderRadius: '12px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>{c.initial}</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '15px', fontWeight: 700 }}>{c.name}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.phone}</span>
                        </div>
                        <div style={{ marginLeft: 'auto' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {paymentMode === "bank" && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="field">
                    <label>Account Number</label>
                    <input type="text" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="000000000000" autoFocus/>
                  </div>
                  <div className="field">
                    <label>IFSC Code</label>
                    <input type="text" value={ifsc} onChange={(e) => setIfsc(e.target.value)} placeholder="BANK0001234"/>
                  </div>
                  <div className="field">
                    <label>Account Holder Name</label>
                    <input type="text" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} placeholder="Full Name"/>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>Verify & Proceed</button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // RENDER AMOUNT ENTRY (STEP: amount)
  // ------------------------------------------------------------------
  if (step === "amount") {
    return (
      <div className="page-content">
        <header className="topbar">
          <button onClick={() => setStep("details")} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          <div className="topbar-title">Pay Money</div>
          <ThemeToggle />
        </header>

        <div className="scroll-container">
          <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px', fontWeight: 700, boxShadow: 'var(--shadow)' }}>
              {(receiverName || "U")[0].toUpperCase()}
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{receiverName || phoneNumber}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{paymentMode === 'bank' ? bankAccount : (phoneNumber || 'UPI ID Linked')}</p>

            <div className="divider" style={{ margin: '30px 0' }}></div>

            {error && <div className="error-box">{error}</div>}
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-muted)' }}>₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                style={{ fontSize: '56px', fontWeight: 800, width: '100%', maxWidth: '200px', textAlign: 'center', border: 'none', outline: 'none', color: 'var(--text)', background: 'transparent' }}
                autoFocus
              />
            </div>
            
            <div style={{ marginTop: '24px' }}>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What's this for? (optional)" className="field" style={{ textAlign: 'center', borderRadius: '24px', border: '1.5px solid var(--border)', padding: '12px 20px', background: 'var(--bg)', fontSize: '14px' }}/>
            </div>
          </div>

          <div className="bank-row">
            <div className="bank-icon">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>
            </div>
            <div className="bank-meta">
              <div className="bank-name">{senderProfile?.bank}</div>
              <div className="bank-acno">**** {senderProfile?.accNo.slice(-4)}</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          <button 
            className="btn btn-primary"
            onClick={() => {
              if (!amount || Number(amount) <= 0) return setError("Enter amount");
              if (Number(amount) > (senderProfile?.balance || 0)) return setError("Insufficient Balance!");
              setError("");
              setStep("auth");
            }}
            style={{ marginTop: '20px', padding: '20px' }}
          >
            Pay Securely ₹{amount || "0"}
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // RENDER AUTH (STEP: auth)
  // ------------------------------------------------------------------
  if (step === "auth") {
    return (
      <div className="page-content">
        <header className="topbar">
          <button onClick={() => setStep("amount")} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          <div className="topbar-title">UPI PIN</div>
          <ThemeToggle />
        </header>

        <div className="scroll-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <div className="card" style={{ width: '100%', textAlign: 'center', padding: '32px 24px', marginBottom: '24px' }}>
              <div className="bank-name" style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Paying to {receiverName || phoneNumber}</div>
              <div style={{ fontSize: '32px', fontWeight: 800 }}>₹{amount}</div>
              
              <div className="divider" style={{ margin: '24px 0' }}></div>
              
              <div className="label" style={{ marginBottom: '16px' }}>Enter 4-Digit UPI PIN</div>
              <div className="pin-dots">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className={`pin-dot ${upiPin.length > i ? 'filled' : ''}`}></div>
                ))}
              </div>
              {error && <div style={{ color: 'var(--danger)', fontSize: '13px', fontWeight: 600 }}>{error}</div>}
           </div>

           <div className="pin-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button key={num} className="pin-key" onClick={() => upiPin.length < 4 && setUpiPin(p => p + num)}>{num}</button>
              ))}
              <div />
              <button className="pin-key" onClick={() => upiPin.length < 4 && setUpiPin(p => p + "0")}>0</button>
              <button className="pin-key" style={{ border: 'none', background: 'none', boxShadow: 'none' }} onClick={() => setUpiPin(p => p.slice(0, -1))}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2.5"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
              </button>
           </div>

           <button 
             className="btn btn-success" 
             disabled={upiPin.length !== 4} 
             onClick={executePayment}
             style={{ marginTop: '40px', maxWidth: '280px' }}
           >
             Confirm Payment
           </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // RENDER PROCESSING (STEP: processing)
  // ------------------------------------------------------------------
  if (step === "processing") {
    return (
      <div className="processing-screen">
        <div className="spinner-ring"></div>
        <h2 style={{ fontSize: '24px', fontWeight: 800 }}>{processStage}</h2>
        <p style={{ opacity: 0.7 }}>Securely communicating with bank...</p>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // RENDER SUCCESS (STEP: success)
  // ------------------------------------------------------------------
  if (step === "success") {
    return (
      <div className="success-screen">
        <div className="success-card">
          <div className="success-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div className="success-amount">₹{amount}</div>
          <div className="success-label">Payment Successful</div>
          <div style={{ color: '#10B981', fontSize: '14px', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Synced to Smart Expense Tracker
          </div>
          
          <div className="divider"></div>
          
          <div id="payment-success-msg" data-amount={amount} data-receiver={receiverName || phoneNumber || bankAccount} className="receipt-row">
            <span className="key">To</span>
            <span className="val">{receiverName || phoneNumber || bankAccount}</span>
          </div>
          <div className="receipt-row">
            <span className="key">From</span>
            <span className="val">{senderProfile?.bank} ({senderProfile?.accNo.slice(-4)})</span>
          </div>
          <div className="receipt-row">
             <span className="key">Ref No.</span>
             <span className="val">{Math.floor(Math.random() * 9000000000) + 1000000000}</span>
          </div>

          <div className="category-badge">
             <div className="badge-label">Auto-Categorized</div>
             <div className="badge-value">{detectedCategory} ✨</div>
          </div>

          <button onClick={() => { setStep("select"); setAmount(""); setReceiverName(""); setPhoneNumber(""); setBankAccount(""); setIfsc(""); setNote(""); }} className="btn btn-primary" style={{ marginTop: '32px' }}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return null;
}
