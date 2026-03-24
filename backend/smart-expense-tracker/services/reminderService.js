const RecurringBill = require("../models/RecurringBill");
const Alert = require("../models/Alert");
const User = require("../models/User");
const sendEmail = require("../config/email");

const checkReminders = async () => {
  try {
    const now = new Date();
    // Find all recurring bills that are pending or overdue
    const bills = await RecurringBill.find({
      status: { $in: ['pending', 'overdue'] }
    });

    for (const bill of bills) {
      const dueDate = new Date(bill.dueDate);
      
      // If due date is in the past or today
      if (dueDate <= now) {
        // Continuous reminders: check if it's been > reminderInterval since nextReminderDate
        // If nextReminderDate is null, we set it to now to send the first reminder
        if (!bill.nextReminderDate || new Date(bill.nextReminderDate) <= now) {
          
          const user = await User.findById(bill.userId);
          if (!user) continue;

          const message = `Reminder: Your ${bill.category} bill of ₹${bill.amount} is ${dueDate < now ? 'OVERDUE' : 'DUE TODAY'} (${dueDate.toDateString()}).`;
          
          // 1. Create UI Alert
          const alert = new Alert({
            userId: bill.userId,
            type: "bill_reminder",
            message: message,
            category: bill.category
          });
          await alert.save();

          // 2. Send Email
          if (user.email) {
            await sendEmail(user.email, "Bill Payment Reminder", message);
          }

          // 3. Update nextReminderDate
          const nextReminder = new Date(now.getTime() + (bill.reminderInterval || 24) * 60 * 60 * 1000);
          bill.nextReminderDate = nextReminder;
          if (dueDate < now) bill.status = 'overdue';
          await bill.save();
          
          console.log(`Sent reminder for bill: ${bill._id} to ${user.email}`);
        }
      }
    }
  } catch (error) {
    console.error("Error in checkReminders service:", error);
  }
};

module.exports = { checkReminders };
