const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, text) => {
  try {
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === "your_email@gmail.com") {
      console.warn("⚠️ Email not sent: EMAIL_USER is not configured in .env");
      return;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text
    });

    console.log("✅ Email sent successfully to:", to);
  } catch (error) {
    if (error.code === 'EAUTH') {
      console.error("❌ Email Auth Error: Invalid credentials or Gmail App Password required.");
    } else {
      console.error("❌ Email error:", error.message);
    }
  }
};


module.exports = sendEmail;