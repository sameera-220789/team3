const fs = require('fs');
const path = require('path');

const smallLogo = `<svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="url(#demo-pay-bg)" />
    <path d="M6 11C6 9.34315 7.34315 8 9 8H23C24.6569 8 26 9.34315 26 11V21C26 22.6569 24.6569 24 23 24H9C7.34315 24 6 22.6569 6 21V11Z" stroke="url(#demo-pay-wallet)" strokeWidth="2" />
    <path d="M26 14H22C20.8954 14 20 14.8954 20 16C20 17.1046 20.8954 18 22 18H26" stroke="url(#demo-pay-wallet)" strokeWidth="2" fill="#1E1B4B" />
    <circle cx="23" cy="16" r="1" fill="url(#demo-pay-wallet)" />
    <defs>
      <linearGradient id="demo-pay-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#A855F7" />
      </linearGradient>
      <linearGradient id="demo-pay-wallet" x1="6" y1="8" x2="26" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
  </svg>`;

const largeLogo = `<svg width="80" height="80" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="url(#demo-pay-lg-bg)" />
          <path d="M6 11C6 9.34315 7.34315 8 9 8H23C24.6569 8 26 9.34315 26 11V21C26 22.6569 24.6569 24 23 24H9C7.34315 24 6 22.6569 6 21V11Z" stroke="url(#demo-pay-lg-wallet)" strokeWidth="2" />
          <path d="M26 14H22C20.8954 14 20 14.8954 20 16C20 17.1046 20.8954 18 22 18H26" stroke="url(#demo-pay-lg-wallet)" strokeWidth="2" fill="#1E1B4B" />
          <circle cx="23" cy="16" r="1" fill="url(#demo-pay-lg-wallet)" />
          <defs>
            <linearGradient id="demo-pay-lg-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
            <linearGradient id="demo-pay-lg-wallet" x1="6" y1="8" x2="26" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
        </svg>`;

const appFile = path.join(__dirname, 'demo-payment-app/frontend/src/App.tsx');
if (fs.existsSync(appFile)) {
    let content = fs.readFileSync(appFile, 'utf8');
    
    // The previous regex looked for width="80"
    content = content.replace(/<svg width="80"[\s\S]*?<\/svg>/, largeLogo);
    
    // Replace the small logo width="28"
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
