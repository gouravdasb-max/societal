const sendBrevoEmail = async (to, subject, text, html) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("Email service is not configured (BREVO_API_KEY missing)");
  }

  const senderEmail = process.env.GMAIL_USER || "admin@societal.com";
  
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: "Societal" },
      to: [{ email: to }],
      subject: subject,
      textContent: text,
      htmlContent: html
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error("Brevo Email Failed:", errorData);
    throw new Error("Failed to dispatch email securely across REST tunnel");
  }
};

const sendVerificationEmail = async ({ email, fullName, token }) => {
  let clientUrl = process.env.CLIENT_URL || process.env.CORS_ORIGIN || "http://localhost:5173";
  if (clientUrl.endsWith('/')) {
    clientUrl = clientUrl.slice(0, -1);
  }
  const verificationUrl = `${clientUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  await sendBrevoEmail(
    email,
    "Verify your Societal email address",
    `Hi ${fullName}, verify your email by opening this link: ${verificationUrl}. This link expires in 24 hours.`,
    `<p>Hi ${fullName},</p><p>Please <a href="${verificationUrl}">verify your email address</a> to activate your Societal account.</p><p>This link expires in 24 hours.</p>`
  );
};

const sendPasswordResetOtpEmail = async ({ email, fullName, otp }) => {
  await sendBrevoEmail(
    email,
    "Your Societal password reset code",
    `Hi ${fullName}, your Societal password reset code is ${otp}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
    `<p>Hi ${fullName},</p><p>Use this code to reset your Societal password:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${otp}</p><p>This code expires in 10 minutes. If you did not request it, you can safely ignore this email.</p>`
  );
};

const sendAdminOtpEmail = async ({ email, fullName, otp, purpose }) => {
  await sendBrevoEmail(
    email,
    `Societal Admin Verification Code: ${purpose}`,
    `Hi ${fullName}, your admin execution code for ${purpose} is ${otp}. It expires in 5 minutes.`,
    `<p>Hi ${fullName},</p><p>Use this code to verify your admin action (${purpose}):</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${otp}</p><p>This code expires in 5 minutes.</p>`
  );
};

export { sendVerificationEmail, sendPasswordResetOtpEmail, sendAdminOtpEmail };
