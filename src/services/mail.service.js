import nodemailer from "nodemailer";

// ==================================================
// Mail Transporter
// ==================================================

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,

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

export async function sendRegistrationEmail(userEmail, name) {
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

export async function sendTransactionEmail(email, name, amount, toAccount) {
  const subject = 'Transaction Successful';

  const body = `
    Hi {${name}},

    Your transaction of ₹{{amount}} has been successfully processed.

    Transaction Details:

      Amount: ₹{${amount}}
      Recipient Account: {${toAccount}}
      Status: Successful

    Thank you for using our banking service.

    Regards,
    Banking System
  `;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Transaction Successful</title>
    </head>

    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">

        <div style="
            max-width: 600px;
            margin: auto;
            background-color: white;
            padding: 30px;
            border-radius: 10px;
        ">

            <h2 style="color: #2e7d32;">
                Transaction Successful
            </h2>

            <p>Hi <strong>${name}</strong>,</p>

            <p>
                Your transaction has been successfully processed.
            </p>

            <div style="
                background-color: #f5f5f5;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            ">
                <p><strong>Amount:</strong> ₹${amount}</p>
                <p><strong>To Account:</strong> ${toAccount}</p>
                <p><strong>Status:</strong> Successful</p>
            </div>

            <p>
                Thank you for using our banking service.
            </p>

            <p>
                Regards,<br>
                <strong>Banking System</strong>
            </p>

        </div>

    </body>
    </html>
`;

  const result = await sendEmail(email, subject, body, html);

  return result;
};


// ==================================================
// Transaction OTP Email
// ==================================================

export async function sendTransactionOtpEmail(email, name, otp) {
  const subject = 'Transaction Verification OTP';

  const text = `
Hi ${name},

Your transaction requires OTP verification.

Your OTP is: ${otp}

This OTP will expire in 5 minutes.

If you did not initiate this transaction, please contact the bank immediately.

Regards,
Banking System
`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Transaction Verification OTP</title>
    </head>

    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">

      <div style="
        max-width: 600px;
        margin: auto;
        background-color: white;
        padding: 30px;
        border-radius: 10px;
      ">

        <h2 style="color: #1565c0;">
          Transaction Verification
        </h2>

        <p>Hi <strong>${name}</strong>,</p>

        <p>
          Your transaction requires OTP verification.
        </p>

        <div style="
          background-color: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        ">
          <p><strong>Your OTP:</strong></p>

          <h1 style="letter-spacing: 5px;">
            ${otp}
          </h1>

          <p>Expires in 5 minutes.</p>
        </div>

        <p>
          If you did not initiate this transaction, please contact the bank immediately.
        </p>

        <p>
          Regards,<br>
          <strong>Banking System</strong>
        </p>

      </div>

    </body>
    </html>
  `;

  return await sendEmail(email, subject, text, html);
}