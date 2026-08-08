import nodemailer from "nodemailer";

const getTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

const sendVerificationEmail = async ({ email, fullName, token }) => {
  const transporter = getTransporter();
  if (!transporter) {
    throw new Error("Email service is not configured");
  }

  const clientUrl = process.env.CLIENT_URL || process.env.CORS_ORIGIN;
  const verificationUrl = `${clientUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `Societal <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Verify your Societal email address",
    text: `Hi ${fullName}, verify your email by opening this link: ${verificationUrl}. This link expires in 24 hours.`,
    html: `<p>Hi ${fullName},</p><p>Please <a href="${verificationUrl}">verify your email address</a> to activate your Societal account.</p><p>This link expires in 24 hours.</p>`,
  });
};

const sendPasswordResetOtpEmail = async ({ email, fullName, otp }) => {
  const transporter = getTransporter();
  if (!transporter) {
    throw new Error("Email service is not configured");
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `Societal <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Your Societal password reset code",
    text: `Hi ${fullName}, your Societal password reset code is ${otp}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
    html: `<p>Hi ${fullName},</p><p>Use this code to reset your Societal password:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${otp}</p><p>This code expires in 10 minutes. If you did not request it, you can safely ignore this email.</p>`,
  });
};

const sendAdminOtpEmail = async ({ email, fullName, otp, purpose }) => {
  const transporter = getTransporter();
  if (!transporter) throw new Error("Email service is not configured");

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `Societal <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Societal Admin Verification Code: ${purpose}`,
    text: `Hi ${fullName}, your admin execution code for ${purpose} is ${otp}. It expires in 5 minutes.`,
    html: `<p>Hi ${fullName},</p><p>Use this code to verify your admin action (${purpose}):</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${otp}</p><p>This code expires in 5 minutes.</p>`,
  });
};

export { sendVerificationEmail, sendPasswordResetOtpEmail, sendAdminOtpEmail };
