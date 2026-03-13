const USER_ID = "69b41faaf18325e044643887"; 

const BASE_URL = "http://localhost:5000/api";

async function testBudgetLogic() {
  try {
    console.log("--- Starting Budget Logic Verification ---");

    const userId = USER_ID;
    const testCategory = "travel";
    const budgetLimit = 1000;


    console.log(`Step 1: Setting budget for ${testCategory} to ₹${budgetLimit}`);
    const bRes = await fetch(`${BASE_URL}/budgets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, category: testCategory, limit: budgetLimit })
    });
    console.log("Budget set:", bRes.status);

    console.log("Step 2: Adding an expense within budget (₹600 - should hit 60% milestone)");
    const eRes1 = await fetch(`${BASE_URL}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        amount: 600,
        category: testCategory,
        description: "Test 60% milestone",
        date: new Date()
      })
    });
    const data1 = await eRes1.json();
    console.log("Expense 1 added:", eRes1.status, data1.message || "");

    console.log("Step 3: Adding an expense that exceeds CATEGORY budget (₹500 more, total 1100 > 1000)");
    const eRes2 = await fetch(`${BASE_URL}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        amount: 500,
        category: testCategory,
        description: "Test exceeding budget",
        date: new Date()
      })
    });
    const data2 = await eRes2.json();
    console.log("Expense 2 result (EXPECTED 400):", eRes2.status, data2.message);

    console.log("Step 4: Checking if alerts were created");
    const aRes = await fetch(`${BASE_URL}/alerts?userId=${userId}`);
    const alerts = await aRes.json();
    console.log("Recent Alerts:", alerts.map(a => a.message));

    console.log("--- Verification Complete ---");
  } catch (error) {
    console.error("Error during verification:", error);
  }
}

testBudgetLogic();
