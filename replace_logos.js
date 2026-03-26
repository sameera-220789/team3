const fs = require('fs');
const path = require('path');

const expenseLogo = `<div className="logo">
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="12" fill="url(#expense-logo-bg)" />
    <path d="M12 28L18 20L22 24L28 14" stroke="url(#expense-logo-line)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="28" cy="14" r="3" fill="#ffffff" />
    <path d="M12 14L12 28L28 28" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="expense-logo-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="50%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#DB2777" />
      </linearGradient>
      <linearGradient id="expense-logo-line" x1="12" y1="28" x2="28" y2="14" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#A78BFA" />
        <stop offset="100%" stopColor="#FDF4FF" />
      </linearGradient>
    </defs>
  </svg>
  <span className="logo-text">ExpenseFlow</span>
</div>`;

const expenseLogoFooter = `<div className="logo">
  <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="12" fill="url(#expense-logo-bg2)" />
    <path d="M12 28L18 20L22 24L28 14" stroke="url(#expense-logo-line2)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="28" cy="14" r="3" fill="#ffffff" />
    <path d="M12 14L12 28L28 28" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="expense-logo-bg2" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="50%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#DB2777" />
      </linearGradient>
      <linearGradient id="expense-logo-line2" x1="12" y1="28" x2="28" y2="14" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#A78BFA" />
        <stop offset="100%" stopColor="#FDF4FF" />
      </linearGradient>
    </defs>
  </svg>
  <span className="logo-text">ExpenseFlow</span>
</div>`;

const expenseTrackerDir = path.join(__dirname, 'frontend/expensetracker/src/app/pages');

// Process all files that could have a logo
const targetFiles = [
  'Home.tsx',
  'Dashboard.tsx',
  'Budget.tsx',
  'Goals.tsx',
  'Profile.tsx',
  'Admin.tsx',
  'AddExpense.tsx',
  'Login.tsx',
  'Signup.tsx',
  'AdminLogin.tsx',
  'OAuthCallback.tsx'
];

targetFiles.forEach(file => {
  const filePath = path.join(expenseTrackerDir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let replaced = false;

  // The regex finds <div className="logo">...</div>
  // Because SVG can span multiple lines, we match everything until </div>
  const regex = /<div className="logo">[\s\S]*?<span className="logo-text">ExpenseFlow<\/span>\s*<\/div>/g;
  
  if (regex.test(content)) {
    content = content.replace(regex, (match) => {
      replaced = true;
      if (match.includes('width="32"')) {
        return expenseLogoFooter;
      }
      return expenseLogo;
    });
  }
  
  if (replaced) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});

// Demo Payment App Logo
const demoLogo = `<div className="topbar-logo" style={{ display: 'flex', alignItems: 'center' }}>
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="url(#demo-pay-bg)" />
    <path d="M16 6L9 18H15L14 26L23 14H17L18 6Z" fill="url(#demo-pay-bolt)" />
    <defs>
      <linearGradient id="demo-pay-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#A855F7" />
      </linearGradient>
      <linearGradient id="demo-pay-bolt" x1="9" y1="6" x2="23" y2="26" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
  </svg>
</div>`;

const paymentFile = path.join(__dirname, 'demo-payment-app/frontend/src/pages/PaymentPage.tsx');
if (fs.existsSync(paymentFile)) {
  let content = fs.readFileSync(paymentFile, 'utf8');
  if (content.includes('<div className="topbar-logo">💜</div>')) {
    content = content.replace(/<div className="topbar-logo">💜<\/div>/g, demoLogo);
    fs.writeFileSync(paymentFile, content);
    console.log('Updated PaymentPage.tsx');
  }
}

const appFile = path.join(__dirname, 'demo-payment-app/frontend/src/App.tsx');
if (fs.existsSync(appFile)) {
  let content = fs.readFileSync(appFile, 'utf8');
  if (content.includes('<div className="topbar-logo">💜</div>')) {
    content = content.replace(/<div className="topbar-logo">💜<\/div>/g, demoLogo);
    fs.writeFileSync(appFile, content);
    console.log('Updated App.tsx');
  }
}

console.log('Done!');
