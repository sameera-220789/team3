const fs = require('fs');
const path = require('path');

const expenseLogoAuth = `                <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" rx="12" fill="url(#expense-logo-bg-auth)" />
                  <path d="M12 28L18 20L22 24L28 14" stroke="url(#expense-logo-line-auth)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="28" cy="14" r="3" fill="#ffffff" />
                  <path d="M12 14L12 28L28 28" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <defs>
                    <linearGradient id="expense-logo-bg-auth" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#4F46E5" />
                      <stop offset="50%" stopColor="#7C3AED" />
                      <stop offset="100%" stopColor="#DB2777" />
                    </linearGradient>
                    <linearGradient id="expense-logo-line-auth" x1="12" y1="28" x2="28" y2="14" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#A78BFA" />
                      <stop offset="100%" stopColor="#FDF4FF" />
                    </linearGradient>
                  </defs>
                </svg>`;

const expenseTrackerDir = path.join(__dirname, 'frontend/expensetracker/src/app/pages');

const authFiles = [
  'Login.tsx',
  'Signup.tsx',
  'AdminLogin.tsx',
  'OAuthCallback.tsx'
];

authFiles.forEach(file => {
  const filePath = path.join(expenseTrackerDir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex to match the old basic SVG within these files
  const regex = /<svg width="48"[\s\S]*?<\/svg>/g;
  
  if (regex.test(content)) {
    content = content.replace(regex, expenseLogoAuth);
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  } else {
    // maybe it has width="40" if they changed it
    const regex2 = /<svg width="40" height="40" viewBox="0 0 40 40" fill="none">[\s\S]*?<\/svg>/g;
    if (regex2.test(content)) {
        content = content.replace(regex2, expenseLogoAuth.replace('width="48" height="48"', 'width="40" height="40"'));
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    }
  }
});
