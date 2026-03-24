import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../utils/api";
import { API_BASE_URL } from "../utils/config";
import { ThemeToggle } from "../components/ThemeToggle";

// PhonePe strict brand colors
// PhonePe strict brand colors + Dark Mode Support
const THEME = {
  primary: "var(--pay-primary, #5f259f)",
  primaryLight: "var(--pay-primary-light, #7b36c7)",
  success: "var(--color-success, #10b981)", 
  background: "var(--pay-bg, #f4f6f8)",
  surface: "var(--pay-surface, #ffffff)",
  textHeader: "var(--pay-text-header, #1f2937)",
  textSub: "var(--pay-text-sub, #6b7280)",
  border: "var(--pay-border, #e5e7eb)"
};

interface SenderProfile {
  phone: string;
  bank: string;
  accNo: string;
  balance: number;
  upiPin: string;
}

export default function MakePayment() {
  const navigate = useNavigate();
  const user = getUser();

  const [senderProfile, setSenderProfile] = useState<SenderProfile | null>((() => {
    const saved = localStorage.getItem("demoSenderProfile");
    return saved ? JSON.parse(saved) : null;
  })());

  // "setup" | "select" | "details" | "amount" | "auth" | "processing" | "success"
  const [step, setStep] = useState<"setup" | "select" | "details" | "amount" | "auth" | "processing" | "success">(
    senderProfile ? "select" : "setup"
  );
  const [paymentMode, setPaymentMode] = useState<"mobile" | "bank" | "qr" | null>(null);

  // Setup Form State
  const [setupPhone, setSetupPhone] = useState("");
  const [setupBank, setSetupBank] = useState("HDFC Bank");
  const [setupAccNo, setSetupAccNo] = useState("");
  const [setupBalance, setSetupBalance] = useState("");
  const [setupPin, setSetupPin] = useState("");

  // Payment Form State
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [upiPin, setUpiPin] = useState("");
  
  // Processing State
  const [processStage, setProcessStage] = useState("Connecting securely...");
  const [error, setError] = useState("");
  const [detectedCategory, setDetectedCategory] = useState("");

  // Balance Check State
  const [checkingBalance, setCheckingBalance] = useState(false);
  const [balancePin, setBalancePin] = useState("");
  const [balanceVisible, setBalanceVisible] = useState(false);

  useEffect(() => {
    if (senderProfile) {
      localStorage.setItem("demoSenderProfile", JSON.stringify(senderProfile));
    }
  }, [senderProfile]);

  useEffect(() => {
    // Sync balance from DB on load if profile exists
    const syncBalance = async () => {
      if (senderProfile && user) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/profile?userId=${user.id}`);
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
      // Sync initial balance to DB
      if (user) {
        await fetch(`${API_BASE_URL}/api/auth/profile`, {
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
    
    // Simulate PhonePe processing stages
    setTimeout(() => setProcessStage("Requesting Bank..."), 1000);
    setTimeout(() => setProcessStage("Processing Payment..."), 2000);

    let finalReceiver = receiverName;
    if (paymentMode === "mobile") finalReceiver = receiverName || `Mobile: ${phoneNumber}`;
    else if (paymentMode === "bank") finalReceiver = receiverName || `Bank AC: ${bankAccount}`;
    else if (paymentMode === "qr") finalReceiver = receiverName || "Merchant";

    try {
      const paymentRes = await fetch(`${API_BASE_URL}/api/payments/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          amount: Number(amount),
          receiver: finalReceiver,
          category: "", 
          note,
          phoneNumber: paymentMode === "mobile" ? phoneNumber : "",
          bankDetails: paymentMode === "bank" ? `${bankAccount} (${ifsc})` : ""
        })
      });

      if (!paymentRes.ok) throw new Error("Payment processing failed");

      const expenseRes = await fetch(`${API_BASE_URL}/api/expenses/auto-add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          amount: Number(amount),
          description: finalReceiver + (note ? ` - ${note}` : ""),
          category: "", 
          source: `demo-payment-app (${senderProfile.bank} **** ${senderProfile.accNo.slice(-4)})`
        })
      });

      if (!expenseRes.ok) throw new Error("Auto-expense failed");

      const savedExpense = await expenseRes.json();
      setDetectedCategory(savedExpense.category || "Other");

      // Deduct Balance
      setSenderProfile((prev) => prev ? { ...prev, balance: prev.balance - Number(amount) } : null);

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
      <div style={{ minHeight: '80vh', backgroundColor: THEME.background }}>
        <header style={{ backgroundColor: THEME.primary, padding: '16px 20px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600 }}>Link Bank Account</h1>
          <ThemeToggle />
        </header>

        <div style={{ maxWidth: '450px', margin: '30px auto', padding: '0 20px' }}>
          <p style={{ color: THEME.textSub, fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>To send money dynamically, please link your bank account and set a UPI PIN for this demo app.</p>
          
          <form onSubmit={handleSetupSubmit} style={{ backgroundColor: THEME.surface, borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            {error && <div style={{ color: '#DC2626', backgroundColor: '#FEE2E2', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: THEME.textSub, marginBottom: '6px', fontWeight: 600 }}>Your Phone Number</label>
              <input type="text" value={setupPhone} onChange={e => setSetupPhone(e.target.value)} style={{ width: '100%', padding: '12px', border: `1px solid ${THEME.border}`, borderRadius: '8px', fontSize: '15px' }} placeholder="e.g. 9876543210" required />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: THEME.textSub, marginBottom: '6px', fontWeight: 600 }}>Select Bank</label>
              <select value={setupBank} onChange={e => setSetupBank(e.target.value)} style={{ width: '100%', padding: '12px', border: `1px solid ${THEME.border}`, borderRadius: '8px', fontSize: '15px' }}>
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="SBI Bank">SBI Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="Axis Bank">Axis Bank</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: THEME.textSub, marginBottom: '6px', fontWeight: 600 }}>Last 4 Digits of Account</label>
              <input type="text" maxLength={4} value={setupAccNo} onChange={e => setSetupAccNo(e.target.value)} style={{ width: '100%', padding: '12px', border: `1px solid ${THEME.border}`, borderRadius: '8px', fontSize: '15px' }} placeholder="e.g. 1234" required />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: THEME.textSub, marginBottom: '6px', fontWeight: 600 }}>Initial Bank Balance (₹)</label>
              <input type="number" value={setupBalance} onChange={e => setSetupBalance(e.target.value)} style={{ width: '100%', padding: '12px', border: `1px solid ${THEME.border}`, borderRadius: '8px', fontSize: '15px' }} placeholder="e.g. 50000" required />
            </div>

            <div style={{ marginBottom: '24px' }}>
               <label style={{ display: 'block', fontSize: '13px', color: THEME.textSub, marginBottom: '6px', fontWeight: 600 }}>Set 4-Digit UPI PIN</label>
               <input type="password" maxLength={4} value={setupPin} onChange={e => setSetupPin(e.target.value)} style={{ width: '100%', padding: '12px', border: `1px solid ${THEME.border}`, borderRadius: '8px', fontSize: '15px', letterSpacing: '8px', textAlign: 'center' }} placeholder="****" required />
            </div>

            <button type="submit" style={{ width: '100%', padding: '16px', backgroundColor: THEME.primary, color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>Generate Payment Profile</button>
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
      <div style={{ minHeight: '80vh', backgroundColor: THEME.background }}>
        <header style={{ backgroundColor: THEME.primary, padding: '16px 20px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600 }}>Transfer Money</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ThemeToggle />
            <button onClick={handleResetProfile} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>Reset Setup</button>
          </div>
        </header>

        {/* Sender Profile Header Widget */}
        <div style={{ backgroundColor: THEME.primaryLight, padding: '20px', color: 'white' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
                <span style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Linked Account</span>
                <div style={{ fontSize: '16px', fontWeight: 600, marginTop: '4px' }}>{senderProfile.bank} - {senderProfile.accNo}</div>
                <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '2px' }}>+91 {senderProfile.phone}</div>
             </div>
             
             <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
               <span style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bank Balance</span>
               {balanceVisible ? (
                  <div style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ₹{senderProfile.balance.toLocaleString('en-IN')}
                    <button onClick={() => setBalanceVisible(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}>
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    </button>
                  </div>
               ) : checkingBalance ? (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="password" value={balancePin} onChange={e => setBalancePin(e.target.value)} maxLength={4} style={{ width: '60px', padding: '4px 8px', borderRadius: '4px', border: 'none', textAlign: 'center', letterSpacing: '4px' }} placeholder="PIN" autoFocus />
                    <button onClick={() => { if (balancePin === senderProfile.upiPin) { setBalanceVisible(true); setCheckingBalance(false); setBalancePin(""); } else { alert("Incorrect PIN"); setBalancePin(""); } }} style={{ background: 'white', color: THEME.primary, border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>GO</button>
                    <button onClick={() => { setCheckingBalance(false); setBalancePin(""); }} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer' }}>✕</button>
                  </div>
               ) : (
                  <button onClick={() => setCheckingBalance(true)} style={{ marginTop: '8px', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', padding: '6px 12px', borderRadius: '16px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>Check Balance</button>
               )}
             </div>
           </div>
        </div>

        <div style={{ maxWidth: '450px', margin: '20px auto', padding: '0 20px' }}>
          <h2 style={{ fontSize: '1rem', color: THEME.textSub, marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Send Money To</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <button 
              onClick={() => { setPaymentMode("mobile"); setStep("details"); }}
              style={{ backgroundColor: THEME.surface, border: '1px solid ' + THEME.border, borderRadius: '12px', padding: '20px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}
            >
              <div style={{ background: '#F3E8FF', padding: '14px', borderRadius: '50%', color: THEME.primary }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: THEME.textHeader }}>To Mobile<br/>Number</span>
            </button>
            
            <button 
              onClick={() => { setPaymentMode("bank"); setStep("details"); }}
              style={{ backgroundColor: THEME.surface, border: '1px solid ' + THEME.border, borderRadius: '12px', padding: '20px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}
            >
              <div style={{ background: '#F3E8FF', padding: '14px', borderRadius: '50%', color: THEME.primary }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: THEME.textHeader }}>To Bank /<br/>UPI ID</span>
            </button>

            <button 
              onClick={handleScanClick}
              style={{ backgroundColor: THEME.surface, border: '1px solid ' + THEME.border, borderRadius: '12px', padding: '20px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}
            >
              <div style={{ background: '#F3E8FF', padding: '14px', borderRadius: '50%', color: THEME.primary }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><rect x="7" y="7" width="10" height="10" rx="1"></rect></svg>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: THEME.textHeader }}>Scan QR<br/>Code</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // RENDER DETAILS FORM (STEP: details)
  // ------------------------------------------------------------------
  if (step === "details") {
    return (
      <div style={{ minHeight: '80vh', backgroundColor: THEME.background }}>
        <header style={{ backgroundColor: THEME.primary, padding: '16px 20px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={() => setStep("select")} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600 }}>{paymentMode === 'mobile' ? 'Send Money' : paymentMode === 'bank' ? 'Bank Transfer' : 'Scan QR'}</h1>
          </div>
          <ThemeToggle />
        </header>

        <div style={{ maxWidth: '450px', margin: '20px auto', padding: '0 20px' }}>
          {paymentMode === "qr" && (
            <div style={{ backgroundColor: "black", borderRadius: "16px", height: "350px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ width: "220px", height: "220px", border: "2px solid rgba(255,255,255,0.4)", borderRadius: "16px", position: "relative" }}>
                 <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", backgroundColor: THEME.success, animation: "scanLine 2s linear infinite", boxShadow: '0 0 10px #10b981' }}></div>
              </div>
              <p style={{ color: "white", marginTop: "24px", fontWeight: 500, fontSize: '15px' }}>Scanning QR Code...</p>
              <style>{`@keyframes scanLine { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }`}</style>
            </div>
          )}

          {paymentMode !== "qr" && (
            <form onSubmit={handleDetailsSubmit} style={{ backgroundColor: THEME.surface, borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              {error && <div style={{ color: '#DC2626', backgroundColor: '#FEE2E2', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
              
              {paymentMode === "mobile" && (
                <>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: THEME.textSub, marginBottom: '8px', fontWeight: 600 }}>Enter Mobile Number</label>
                    <div style={{ display: 'flex', borderBottom: `2px solid ${THEME.primary}` }}>
                      <span style={{ fontSize: '18px', fontWeight: 600, color: THEME.textHeader, padding: '10px 8px 10px 0' }}>+91</span>
                      <input type="text" value={phoneNumber} onChange={(e) => { setPhoneNumber(e.target.value); setReceiverName(""); }} placeholder="98765 43210" style={{ width: '100%', fontSize: '18px', fontWeight: 600, border: 'none', outline: 'none', background: 'transparent' }} autoFocus/>
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: THEME.textSub, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent Transfers</span>
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {recentContacts.map(c => (
                        <div key={c.phone} onClick={() => { setPhoneNumber(c.phone); setReceiverName(c.name); setStep("amount"); }} style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>{c.initial}</div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '16px', fontWeight: 600, color: THEME.textHeader }}>{c.name}</span>
                            <span style={{ fontSize: '13px', color: THEME.textSub }}>{c.phone}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {paymentMode === "bank" && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: THEME.textSub, marginBottom: '6px', fontWeight: 600 }}>Account Number</label>
                    <input type="text" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} style={{ width: '100%', padding: '12px 0', border: 'none', borderBottom: `2px solid ${THEME.primary}`, fontSize: '16px', fontWeight: 500, outline: 'none' }} placeholder="Enter Account Number" autoFocus/>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: THEME.textSub, marginBottom: '6px', fontWeight: 600 }}>IFSC Code</label>
                    <input type="text" value={ifsc} onChange={(e) => setIfsc(e.target.value)} style={{ width: '100%', padding: '12px 0', border: 'none', borderBottom: `2px solid ${THEME.border}`, fontSize: '16px', fontWeight: 500, outline: 'none' }} placeholder="SBIN0001234"/>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: THEME.textSub, marginBottom: '6px', fontWeight: 600 }}>Receiver Name</label>
                    <input type="text" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} style={{ width: '100%', padding: '12px 0', border: 'none', borderBottom: `2px solid ${THEME.border}`, fontSize: '16px', fontWeight: 500, outline: 'none' }} placeholder="Account Holder Name"/>
                  </div>
                  <button type="submit" style={{ marginTop: '20px', padding: '16px', backgroundColor: THEME.primary, color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>Proceed</button>
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
      <div style={{ minHeight: '80vh', backgroundColor: THEME.background }}>
        <header style={{ backgroundColor: THEME.primary, padding: '16px 20px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={() => setStep("details")} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'white', color: THEME.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {(receiverName || "U")[0].toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1rem', fontWeight: 600 }}>{receiverName || phoneNumber}</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{paymentMode === 'bank' ? bankAccount : (phoneNumber || 'Verified UPI')}</span>
              </div>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <div style={{ maxWidth: '450px', margin: '20px auto', padding: '0 20px' }}>
          <div style={{ backgroundColor: THEME.surface, borderRadius: '16px', padding: '30px 20px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', textAlign: 'center' }}>
            {error && <div style={{ color: '#DC2626', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
            
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <span style={{ fontSize: '36px', fontWeight: 'bold', color: THEME.textSub, position: 'absolute', left: '-30px', top: '12px' }}>₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                style={{ fontSize: '56px', fontWeight: 700, width: '180px', textAlign: 'center', border: 'none', outline: 'none', color: THEME.textHeader, background: 'transparent' }}
                autoFocus
              />
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note" style={{ padding: '12px 20px', borderRadius: '20px', border: '1px solid ' + THEME.border, backgroundColor: THEME.background, width: '80%', fontSize: '14px', outline: 'none', textAlign: 'center' }}/>
            </div>
          </div>

          {/* User's Bank Selection */}
          <div style={{ marginTop: '20px', backgroundColor: THEME.surface, borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: THEME.textSub, fontWeight: 600 }}>Paying from</span>
                <span style={{ fontSize: '15px', fontWeight: 600, color: THEME.textHeader, marginTop: '2px' }}>
                  {senderProfile?.bank} **** {senderProfile?.accNo.slice(-4) || "1234"}
                </span>
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={THEME.textSub} strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          <button 
            onClick={() => {
              if (!amount || Number(amount) <= 0) return setError("Enter a valid amount");
              if (Number(amount) > (senderProfile?.balance || 0)) return setError("Insufficient Balance in your specific linked account!");
              setError("");
              setStep("auth");
            }}
            style={{ width: '100%', padding: '18px', borderRadius: '12px', border: 'none', backgroundColor: THEME.primary, color: 'white', fontSize: '18px', fontWeight: 'bold', marginTop: '20px', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(95, 37, 159, 0.3)' }}
          >
            Pay ₹{amount || "0"}
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
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh', backgroundColor: THEME.background }}>
        <header style={{ backgroundColor: THEME.primary, padding: '16px 20px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={() => setStep("amount")} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <span style={{ fontSize: '1rem', fontWeight: 600 }}>{senderProfile?.bank} **** {senderProfile?.accNo.slice(-4)}</span>
               <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Secure Verification</span>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
           <h2 style={{ fontSize: '18px', fontWeight: 600, color: THEME.textHeader, marginBottom: '8px' }}>Enter 4-digit UPI PIN</h2>
           {error ? (
              <p style={{ fontSize: '14px', color: '#DC2626', marginBottom: '30px', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>
           ) : (
              <p style={{ fontSize: '14px', color: THEME.textSub, marginBottom: '30px', textAlign: 'center' }}>To send ₹{amount} to {receiverName || phoneNumber || bankAccount || 'Verified Merchant'}</p>
           )}

           <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ width: '16px', height: '16px', borderRadius: '50%', border: `1px solid ${THEME.border}`, backgroundColor: upiPin.length > i ? THEME.textHeader : 'transparent' }}></div>
              ))}
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', maxWidth: '280px', width: '100%' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button key={num} onClick={() => upiPin.length < 4 && setUpiPin(p => p + num)} style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: '50%', width: '64px', height: '64px', fontSize: '24px', fontWeight: 500, color: THEME.textHeader, cursor: 'pointer', margin: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  {num}
                </button>
              ))}
              <div></div>
              <button onClick={() => upiPin.length < 4 && setUpiPin(p => p + "0")} style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: '50%', width: '64px', height: '64px', fontSize: '24px', fontWeight: 500, color: THEME.textHeader, cursor: 'pointer', margin: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                0
              </button>
              <button 
                onClick={() => setUpiPin(p => p.slice(0, -1))} 
                style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', width: '64px', height: '64px', margin: 'auto' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={THEME.textSub} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
              </button>
           </div>

           <button 
             disabled={upiPin.length !== 4} 
             onClick={executePayment}
             style={{ marginTop: '40px', padding: '16px 40px', backgroundColor: upiPin.length === 4 ? THEME.success : '#E5E7EB', color: upiPin.length === 4 ? 'white' : '#9CA3AF', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: upiPin.length === 4 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: upiPin.length === 4 ? '0 4px 10px rgba(16,185,129,0.3)' : 'none', transition: 'all 0.2s' }}
           >
             Submit Securely <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', backgroundColor: THEME.primary, color: 'white', padding: '20px', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
          <div style={{ width: '60px', height: '60px', border: '4px solid rgba(255,255,255,0.3)', borderTop: '4px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>{processStage}</h2>
        <p style={{ opacity: 0.8, fontSize: '1rem' }}>Please do not press back or close the app</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // RENDER SUCCESS (STEP: success)
  // ------------------------------------------------------------------
  if (step === "success") {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', backgroundColor: THEME.background, padding: '20px' }}>
        <div style={{ backgroundColor: THEME.surface, padding: '40px 24px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: THEME.success, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '20px', animation: 'bounceScale 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: THEME.textHeader }}>Payment of ₹{amount}<br/>Successful.</h2>
          
          <div style={{ width: '100%', height: '1px', backgroundColor: THEME.border, margin: '24px 0' }}></div>
          
          <div style={{ width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: THEME.textSub, fontSize: '14px' }}>Paid to</span>
              <span style={{ color: THEME.textHeader, fontWeight: 600, fontSize: '14px' }}>{receiverName || phoneNumber || bankAccount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: THEME.textSub, fontSize: '14px' }}>Debited from</span>
              <span style={{ color: THEME.textHeader, fontWeight: 600, fontSize: '14px' }}>{senderProfile?.bank} **** {senderProfile?.accNo.slice(-4)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: THEME.textSub, fontSize: '14px' }}>Remaining Balance</span>
              <span style={{ color: THEME.textHeader, fontWeight: 600, fontSize: '14px' }}>₹{senderProfile?.balance.toLocaleString('en-IN')}</span>
            </div>
          </div>
          
          {/* Smart Categorization Badge */}
          <div style={{ position: 'relative', overflow: 'hidden', marginTop: '30px', padding: '16px', backgroundImage: 'linear-gradient(to right, #4338ca, #6366f1)', borderRadius: '12px', color: 'white', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.2 }}><svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, opacity: 0.8, marginBottom: '6px' }}>Smart Expense Tracked ✨</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Categorized as: {detectedCategory}</span>
          </div>
        </div>
        
        <button onClick={() => navigate("/dashboard")} style={{ marginTop: '30px', background: 'none', border: `1px solid ${THEME.primary}`, color: THEME.primary, padding: '12px 24px', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>
          Back to Dashboard
        </button>

        <style>{`@keyframes bounceScale { 0% { transform: scale(0); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }`}</style>
      </div>
    );
  }

  return null;
}
