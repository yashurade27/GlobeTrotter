import nodemailer from "nodemailer";

// Create a transport with improved settings
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Add these settings for Gmail specifically
  tls: {
    rejectUnauthorized: false, // Allows connecting to servers with self-signed certificates
    ciphers: 'SSLv3', // Use stronger ciphers
  },
  // Add timeout settings
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Verify the connection before using it
transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP server is ready to take our messages");
  }
});

export async function sendMail({ 
  to, 
  subject, 
  text, 
  html 
}: { 
  to: string; 
  subject: string; 
  text?: string; 
  html?: string;
}) {
  try {
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
      html,
    });
    console.log("Email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}