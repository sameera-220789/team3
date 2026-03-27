const nodemailer = require('nodemailer');

exports.sendGroupInviteEmail = async (email, groupId, groupPassword, groupName) => {
  try {
    // Utilize actual environmental Gmail credentials to send real outbound invitations
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const magicLink = `http://localhost:5173/guest/group/${groupId}?pwd=${encodeURIComponent(groupPassword)}`;

    let info = await transporter.sendMail({
      from: '"Smart Expense Tracker" <no-reply@smartexpensetracker.com>',
      to: email,
      subject: `You're invited to join group: ${groupName}!`,
      text: `You've been invited to join ${groupName}.\n\nGroup ID: ${groupId}\nPassword: ${groupPassword}\n\nClick here to securely join as a guest instantly: ${magicLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #4f46e5;">Expense Tracker Invitation</h2>
          <p>You have been invited to join the group <strong>${groupName}</strong> to track split expenses and chat seamlessly!</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Group ID:</strong> ${groupId}</p>
            <p style="margin: 0;"><strong>Password:</strong> ${groupPassword}</p>
          </div>
          <p>Please use the following magic link to securely join instantly as a guest without needing to register:</p>
          <br/>
          <a href="${magicLink}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Auto-Join Group Now</a>
          <br/><br/>
          <p style="color: #6b7280; font-size: 0.85rem;">If you prefer to register an account, simply login with this email address and the group will automatically appear on your dashboard!</p>
        </div>
      `
    });

    console.log("Invitation email sent successfully to: %s", email);
    return true;
  } catch (error) {
    console.error("Error sending email invitation:", error);
    return false;
  }
};
