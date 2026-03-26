const fs = require('fs');
const path = require('path');

// A clean, outstanding currency "₹" coin icon
const smallLogo = `<svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  </svg>`;

const largeLogo = `<svg width="80" height="80" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="url(#demo-pay-lg-bg)" />
          <circle cx="16" cy="16" r="9" stroke="url(#demo-pay-lg-coin)" strokeWidth="1.5" fill="none"/>
          <path d="M12 11H20M12 14H20M14 14L18 21M12.5 11C12.5 11 12.5 13.2 15.5 14C18.5 14.8 18.5 14 18.5 14" stroke="url(#demo-pay-lg-coin)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <defs>
            <linearGradient id="demo-pay-lg-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
            <linearGradient id="demo-pay-lg-coin" x1="7" y1="7" x2="25" y2="25" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
        </svg>`;

const appFile = path.join(__dirname, 'demo-payment-app/frontend/src/App.tsx');
if (fs.existsSync(appFile)) {
    let content = fs.readFileSync(appFile, 'utf8');
    content = content.replace(/<svg width="80"[\s\S]*?<\/svg>/, largeLogo);
    content = content.replace(/<svg width="28"[\s\S]*?<\/svg>/, smallLogo);
    fs.writeFileSync(appFile, content);
    console.log('Updated App.tsx');
}

const paymentFile = path.join(__dirname, 'demo-payment-app/frontend/src/pages/PaymentPage.tsx');
if (fs.existsSync(paymentFile)) {
    let content = fs.readFileSync(paymentFile, 'utf8');
    content = content.replace(/<svg width="28"[\s\S]*?<\/svg>/, smallLogo);
    fs.writeFileSync(paymentFile, content);
    console.log('Updated PaymentPage.tsx');
}
