const fs = require('fs');

const file = 'c:/Users/saraw/team3/frontend/expensetracker/src/app/pages/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex1 = /const endpoints = \[\r?\n\s+fetch\(`\$\{API_BASE_URL\}\/api\/expenses\?userId=\$\{user\.id\}&month=\$\{selectedMonth\}`,\sfetchOpts\),\r?\n\s+fetch\(`\$\{API_BASE_URL\}\/api\/budgets\?userId=\$\{user\.id\}&month=\$\{selectedMonth\}`,\sfetchOpts\),\r?\n\s+fetch\(`\$\{API_BASE_URL\}\/api\/alerts\?userId=\$\{user\.id\}`,\sfetchOpts\)\r?\n\s+\]\);/g;

content = content.replace(regex1, `const [expenseSettled, budgetSettled, alertSettled] = await Promise.allSettled([\\n        fetch(\\\`\${API_BASE_URL}/api/expenses?userId=\${user.id}&month=\${selectedMonth}\\\`, fetchOpts),\\n        fetch(\\\`\${API_BASE_URL}/api/budgets?userId=\${user.id}&month=\${selectedMonth}\\\`, fetchOpts),\\n        fetch(\\\`\${API_BASE_URL}/api/alerts?userId=\${user.id}\\\`, fetchOpts)\\n      ]);`);

const regex2 = /if\s*\\(expenseRes\\.ok\s*&&\s*budgetRes\\.ok\s*&&\s*alertRes\\.ok\\)\s*\\{\r?\n\s*const\s+expenseData\s*=\s*await\s*expenseRes\\.json\\(\\);\r?\n\s*const\s+budgetData\s*=\s*await\s*budgetRes\\.json\\(\\);\r?\n\s*const\s+alertData\s*=\s*await\s*alertRes\\.json\\(\\);\r?\n\s*setExpenses\\(expenseData\\);\r?\n\s*setBudgets\\(budgetData\\);\r?\n\s*setAlerts\\(alertData\\);/g;

content = content.replace(regex2, `if (expenseSettled.status === 'fulfilled' && expenseSettled.value.ok) {\\n        setExpenses(await expenseSettled.value.json());\\n      }\\n      if (budgetSettled.status === 'fulfilled' && budgetSettled.value.ok) {\\n        setBudgets(await budgetSettled.value.json());\\n      }\\n      if (alertSettled.status === 'fulfilled' && alertSettled.value.ok) {\\n        setAlerts(await alertSettled.value.json());`);

fs.writeFileSync(file, content);
console.log("Replaced successfully!");
