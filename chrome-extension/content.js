/**
 * Chrome Extension: content.js
 * Detects payment actions and sends them to the Expense Tracker Backend.
 */

console.log("🚀 Smart Expense Tracker Extension Active");

const API_URL = "http://localhost:5000/api/expenses/auto-add";

// 1. Auto-categorization logic
const categorize = (receiver) => {
    const text = (receiver || "").toLowerCase();
    if (text.includes("swiggy") || text.includes("zomato") || text.includes("food") || text.includes("restaurant")) return "Food";
    if (text.includes("netflix") || text.includes("hotstar") || text.includes("prime") || text.includes("spotify")) return "Entertainment";
    if (text.includes("uber") || text.includes("ola") || text.includes("rapido") || text.includes("travel")) return "Travel";
    if (text.includes("amazon") || text.includes("flipkart") || text.includes("myntra") || text.includes("meesho") || text.includes("shopping")) return "Shopping";
    if (text.includes("recharge") || text.includes("jio") || text.includes("airtel") || text.includes("bill")) return "Bills";
    return "Other";
};

// 2. Prevent duplicate entries (Same amount + receiver within 5 seconds)
let lastTx = { amount: 0, receiver: "", time: 0 };

const sendToBackend = async (data) => {
    const now = Date.now();
    if (data.amount === lastTx.amount && data.description === lastTx.receiver && (now - lastTx.time) < 5000) {
        console.warn("🚫 Duplicate transaction ignored by extension");
        return;
    }

    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) {
        console.warn("❌ No JWT token found. Please log in to the Demo Payment App first.");
        return;
    }

    // Get userId from session storage (where the demo app stores it after login)
    const userStr = sessionStorage.getItem("user") || localStorage.getItem("user");
    let userId = null;
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            userId = user.id || user._id || user.userId;
            if (userId) userId = String(userId);
        } catch (e) { console.error(e); }
    }

    if (!userId) {
        console.warn("❌ No userId found in session. Cannot add expense.");
        return;
    }

    console.log("📤 Sending expense to tracker:", { ...data, userId });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...data,
                userId,
                source: "chrome-extension"
            })
        });

        if (response.ok) {
            const saved = await response.json();
            console.log("✅ Expense added automatically:", saved);
            showNotification(`₹${data.amount} spent on ${data.description} added to expenses!`);
            lastTx = { amount: data.amount, receiver: data.description, time: now };
        } else {
            const errText = await response.text();
            console.error("❌ Failed to add expense:", errText);
        }
    } catch (err) {
        console.error("❌ Network error while adding expense:", err);
    }
};

// 3. User Feedback Utility
const showNotification = (message) => {
    const div = document.createElement("div");
    div.style.position = "fixed";
    div.style.top = "20px";
    div.style.right = "20px";
    div.style.backgroundColor = "#111827";
    div.style.color = "white";
    div.style.padding = "16px 24px";
    div.style.borderRadius = "12px";
    div.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1)";
    div.style.zIndex = "99999";
    div.style.fontSize = "14px";
    div.style.fontWeight = "600";
    div.style.borderLeft = "4px solid #10b981";
    div.style.animation = "slideIn 0.3s ease-out";
    
    div.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px">
            <span style="font-size:20px">✨</span>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(div);
    
    const style = document.createElement("style");
    style.innerHTML = `@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
    document.head.appendChild(style);

    setTimeout(() => {
        div.style.opacity = "0";
        div.style.transition = "opacity 0.5s ease";
        setTimeout(() => div.remove(), 500);
    }, 4000);
};

// 4. PRIMARY LISTENER: Custom event dispatched by React PaymentPage on payment success
// This is reliable because React fires it directly, no DOM polling needed
window.addEventListener("payment:success", (e) => {
    const { amount, receiver } = e.detail || {};
    if (!amount || !receiver) {
        console.warn("⚠️ payment:success event missing data", e.detail);
        return;
    }
    console.log("🎯 Caught payment:success event:", { amount, receiver });
    sendToBackend({
        amount: Number(amount),
        description: receiver,
        category: categorize(receiver)
    });
});

// 5. FALLBACK: detect clicks on elements with class .pay-btn (for simulated payment pages)
document.addEventListener("click", (e) => {
    const btn = e.target.closest(".pay-btn");
    if (btn) {
        const amount = Number(btn.getAttribute("data-amount"));
        const receiver = btn.getAttribute("data-receiver");
        if (amount && receiver) {
            console.log("💰 Detected .pay-btn click:", { amount, receiver });
            sendToBackend({
                amount,
                description: receiver,
                category: categorize(receiver)
            });
        }
    }
});

// 6. SECONDARY FALLBACK: MutationObserver for #payment-success-msg (legacy / simulated pages)
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType !== 1) return;
                // Check the node itself or any descendant
                const successMsg = node.id === "payment-success-msg"
                    ? node
                    : node.querySelector && node.querySelector("#payment-success-msg");
                if (successMsg && !successMsg.hasAttribute("data-extension-detected")) {
                    const amount = Number(successMsg.getAttribute("data-amount"));
                    const receiver = successMsg.getAttribute("data-receiver");
                    if (amount && receiver) {
                        successMsg.setAttribute("data-extension-detected", "true");
                        console.log("🔍 MutationObserver detected #payment-success-msg:", { amount, receiver });
                        sendToBackend({
                            amount,
                            description: receiver,
                            category: categorize(receiver)
                        });
                    }
                }
            });
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });
console.log("👀 MutationObserver active on document.body");
