const fs = require('fs');
const path = require('path');

const smallLogo = `<svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="url(#demo-pay-bg)" />
    <rect x="6" y="10" width="20" height="12" rx="2" stroke="url(#demo-pay-currency)" strokeWidth="2.5"/>
    <circle cx="16" cy="16" r="2.5" stroke="url(#demo-pay-currency)" strokeWidth="2.5"/>
    <path d="M10 10V12 M22 10V12 M10 22V20 M22 22V20" stroke="url(#demo-pay-currency)" strokeWidth="2" strokeLinecap="round"/>
    <defs>
      <linearGradient id="demo-pay-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#A855F7" />
      </linearGradient>
      <linearGradient id="demo-pay-currency" x1="6" y1="10" x2="26" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
  </svg>`;

const largeLogo = `<svg width="80" height="80" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="16" fill="url(#demo-pay-lg-bg)" />
            <rect x="6" y="10" width="20" height="12" rx="2" stroke="url(#demo-pay-lg-currency)" strokeWidth="2.5"/>
            <circle cx="16" cy="16" r="2.5" stroke="url(#demo-pay-lg-currency)" strokeWidth="2.5"/>
            <path d="M10 10V12 M22 10V12 M10 22V20 M22 22V20" stroke="url(#demo-pay-lg-currency)" strokeWidth="2" strokeLinecap="round"/>
            <defs>
              <linearGradient id="demo-pay-lg-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
              <linearGradient id="demo-pay-lg-currency" x1="6" y1="10" x2="26" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
          </svg>`;

const appFile = path.join(__dirname, 'demo-payment-app/frontend/src/App.tsx');
if (fs.existsSync(appFile)) {
    let content = fs.readFileSync(appFile, 'utf8');
    
    // Replace the large logo
    content = content.replace(/<svg width="80"[\s\S]*?<\/svg>/, largeLogo);
    
    // Replace the small logo
    content = content.replace(/<svg width="28"[\s\S]*?<\/svg>/, smallLogo);
    
    fs.writeFileSync(appFile, content);
    console.log('Updated App.tsx');
}

const paymentFile = path.join(__dirname, 'demo-payment-app/frontend/src/pages/PaymentPage.tsx');
if (fs.existsSync(paymentFile)) {
    let content = fs.readFileSync(paymentFile, 'utf8');
    
    // Replace the small logo
    content = content.replace(/<svg width="28"[\s\S]*?<\/svg>/, smallLogo);
    
    fs.writeFileSync(paymentFile, content);
    console.log('Updated PaymentPage.tsx');
}
