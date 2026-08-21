import nodemailer from "nodemailer";

// ==================================================
// Mail Transporter
// ==================================================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// ==================================================
// Verify Mail Connection
// ==================================================

transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// ==================================================
// Send Email
// ==================================================

async function sendEmail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: `"Banking System API" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

// ==================================================
// Registration Email
// ==================================================

async function sendRegistrationEmail(userEmail, name) {
  try {
    const subject = "Welcome to Banking System API!";

    const text = `Hello ${name},

Thank you for registering at Banking System API.
We're excited to have you on board!

Best regards,
The Banking System API Team`;

    const html = `
      <p>Hello ${name},</p>

      <p>
        Thank you for registering at Banking System API.
        We're excited to have you on board!
      </p>

      <p>
        Best regards,<br>
        The Banking System API Team
      </p>
    `;

    const result = await sendEmail(
      userEmail,
      subject,
      text,
      html
    );

    return result;
  } catch (error) {
    console.error("Registration email failed:", error);
    throw error;
  }
}

export default sendRegistrationEmail;