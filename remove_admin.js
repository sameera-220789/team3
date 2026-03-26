const fs = require('fs');
const path = require('path');

// Remove Admin Login link from Home.tsx
const homePath = path.join(__dirname, 'frontend/expensetracker/src/app/pages/Home.tsx');
if (fs.existsSync(homePath)) {
    let content = fs.readFileSync(homePath, 'utf8');
    // Replace the block containing '/admin-login'
    content = content.replace(/<li>[\s]*<Link to="\/admin-login" className="nav-link">[\s]*Admin Login[\s]*<\/Link>[\s]*<\/li>/, '');
    fs.writeFileSync(homePath, content);
    console.log('Fixed Home.tsx');
}

// Remove Admin user text from Login.tsx
const loginPath = path.join(__dirname, 'frontend/expensetracker/src/app/pages/Login.tsx');
if (fs.existsSync(loginPath)) {
    let content = fs.readFileSync(loginPath, 'utf8');
    // Replace the specific text at the bottom of the login form
    content = content.replace(/<p className="auth-footer-text" style=\{\{ marginTop: "0\.5rem" \}\}>[\s]*Admin user\?[\s]*<Link to="\/admin-login" className="auth-link">[\s]*Go to admin login[\s]*<\/Link>[\s]*<\/p>/, '');
    fs.writeFileSync(loginPath, content);
    console.log('Fixed Login.tsx');
}
