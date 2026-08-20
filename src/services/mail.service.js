import transporter from "../config/mail.config.js";

export async function sendMail({
  to,
  subject,
  html,
  text,
}) {
  try {
    const mailOptions = {
      from: process.env.MAIL_FROM,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Email sending failed:", error);

    throw error;
  }
}