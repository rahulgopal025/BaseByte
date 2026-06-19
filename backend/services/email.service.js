import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

// Fallback to empty string to avoid crashes if API key is not yet set
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

/**
 * Base email HTML template wrapper for BaseByte
 */
const getBaseTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; color: #111827; padding: 40px 20px; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 24px; padding: 40px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }
    .logo { font-size: 24px; font-weight: 900; color: #4f46e5; background: linear-gradient(to right, #4f46e5, #9333ea); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 30px; }
    .code-box { background-color: #f5f3ff; border: 1px solid #ede9fe; border-radius: 12px; padding: 20px; text-align: center; font-size: 32px; font-weight: 900; letter-spacing: 4px; color: #4f46e5; margin: 30px 0; }
    .footer { margin-top: 40px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">BaseByte</div>
    ${content}
    <div class="footer">
      If you did not request this, please ignore this email.<br/>
      &copy; ${new Date().getFullYear()} BaseByte. All rights reserved.
    </div>
  </div>
</body>
</html>
`

export const sendVerificationEmail = async (email, name, otp) => {
  const content = `
    <h2 style="margin-top:0;">Verify Your BaseByte Account</h2>
    <p>Hello ${name},</p>
    <p>Welcome to BaseByte. Your verification code is:</p>
    <div class="code-box">${otp}</div>
    <p>This code expires in 5 minutes.</p>
  `;

  try {
    const data = await resend.emails.send({
      from: 'BaseByte Team <onboarding@resend.dev>', // Update this to a verified domain if available
      to: [email],
      subject: 'Verify Your BaseByte Account',
      html: getBaseTemplate('Verify Your Account', content)
    });
    return data;
  } catch (error) {
    console.error("Resend Email Error:", error);
    throw new Error("Failed to send verification email");
  }
};

export const sendPasswordResetEmail = async (email, name, otp) => {

  const content = `
    <h2 style="margin-top:0;">Reset Your Password</h2>
    <p>Hello ${name || 'User'},</p>
    <p>We received a request to reset your password. Your reset code is:</p>
    <div class="code-box">${otp}</div>
    <p>This code expires in 5 minutes.</p>
  `;

  try {
    console.log("================================");
    console.log("PASSWORD RESET EMAIL");
    console.log("Sending to:", email);
    console.log("Name:", name);
    console.log("OTP:", otp);
    console.log("================================");

    const data = await resend.emails.send({
      from: 'BaseByte Support <onboarding@resend.dev>',
      to: [email],
      subject: 'Reset Your BaseByte Password',
      html: getBaseTemplate('Reset Your Password', content)
    });

    console.log("EMAIL SENT RESULT:", data);

    return data;

  } catch (error) {
    console.error("RESEND FULL ERROR:", error);
    throw error;
  }
}

export const sendContactFormEmail = async (name, email, phone, subject, message) => {
  const content = `
    <h2 style="margin-top:0;">New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong></p>
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px;">
      ${message.replace(/\n/g, '<br/>')}
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: 'BaseByte Contact Form <onboarding@resend.dev>',
      to: ['rahulgopal025@gmail.com'], // Using verified testing email instead of basebyte.in@gmail.com
      reply_to: email,
      subject: `Contact Form: ${subject}`,
      html: getBaseTemplate('New Contact Form Submission', content)
    });
    return data;
  } catch (error) {
    console.error("Resend Contact Email Error:", error);
    throw new Error("Failed to send contact email");
  }
};