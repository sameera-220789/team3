async function testPayment() {
    try {
        // Find a real user first
        const mongoose = require('mongoose');
        await mongoose.connect('mongodb://localhost:27017/SmartExpenseTracker', { useNewUrlParser: true, useUnifiedTopology: true });
        
        const User = mongoose.connection.collection('users');
        const demoUser = await User.findOne({});
        if (!demoUser) {
            console.log("No demo user found in database!");
            process.exit(1);
        }
        console.log("Found user ID:", demoUser._id.toString());
        mongoose.disconnect();

        // Simulate request to Demo Payment App
        console.log("\nAttempting to create payment...");
        const response = await fetch('http://localhost:6000/api/payments/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: demoUser._id.toString(),
                amount: 50,
                receiver: "Swiggy Test",
                category: "Food",
                note: "Dinner",
                phoneNumber: "9876543210",
                bankDetails: "HDFC"
            })
        });

        const data = await response.json();
        console.log("\nResponse from Demo Payment App:", data);
        console.log("\nCheck backend terminals to see if `✅ forwarded to expense tracker` appeared.");

    } catch (e) {
        console.error("Error connecting to Demo Payment App:", e.message);
    }
}

testPayment();
