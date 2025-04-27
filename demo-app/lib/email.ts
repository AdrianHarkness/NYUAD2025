import nodemailer from "nodemailer"

// Email configuration
const emailUser = process.env.EMAIL_USER || "mariamshafey3@gmail.com"
const emailPass = process.env.EMAIL_PASS || "siffmirrcuqtvaeg" // app password

// Create a transporter with better error handling
let transporter: nodemailer.Transporter;

try {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
} catch (error) {
  console.error("Failed to create email transporter:", error);
  // Create a dummy transporter for development/testing
  transporter = {
    sendMail: (options: any) => {
      console.log("📧 Email sending skipped (no transporter):", options);
      return Promise.resolve({ messageId: "dummy-id" });
    }
  } as any;
}

// Verify the transporter connection on startup
const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log("✅ Email transporter connection verified");
  } catch (error) {
    console.error("❌ Email transporter verification failed:", error);
  }
};

// Call verify but don't await it (let it run in background)
verifyTransporter();

// Send an email with improved error handling
export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string
  subject: string
  text: string
  html?: string
}) {
  const mailOptions = {
    from: `"Sawty Voting" <${emailUser}>`,
    to,
    subject,
    text,
    html,
  }

  try {
    // Log the email being sent
    console.log(`Attempting to send email to ${to}...`);
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    // Detailed error logging
    console.error(`❌ Failed to send email to ${to}:`, error);
    
    // Rethrow the error to be handled by the caller
    throw error;
  }
}
