import { APP_NAME } from "@/lib/config/constants";

async function sendWithSendGrid(to: string, code: string, fromEmail: string) {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) return false;

  const payload = {
    personalizations: [
      {
        to: [{ email: to }],
        subject: `${APP_NAME} — Your sign-in code`,
      },
    ],
    from: { email: fromEmail, name: APP_NAME },
    content: [
      {
        type: "text/plain",
        value: `Your one-time sign-in code is: ${code}. It will expire in 10 minutes.`,
      },
    ],
  };

  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("SendGrid error:", err);
    return false;
  }
}

async function sendWithSmtp(to: string, code: string, fromEmail: string) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return false;

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: fromEmail,
      to,
      subject: `${APP_NAME} — Your sign-in code`,
      text: `Your one-time sign-in code is: ${code}. It will expire in 10 minutes.`,
    });

    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("SMTP send error:", err);
    return false;
  }
}

export async function sendOtpEmail(to: string, code: string) {
  const fromEmail = process.env.SENDER_EMAIL || `no-reply@${APP_NAME.replace(/\s+/g, "").toLowerCase()}.com`;

  // 1. Try SendGrid
  if (process.env.SENDGRID_API_KEY) {
    const ok = await sendWithSendGrid(to, code, fromEmail);
    if (ok) return true;
  }

  // 2. Try SMTP (nodemailer)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const ok = await sendWithSmtp(to, code, fromEmail);
    if (ok) return true;
  }

  // 3. Fallback: log to console (useful for development or when no provider configured)
  // eslint-disable-next-line no-console
  console.warn("No mail provider available; falling back to console log for OTP.");
  // eslint-disable-next-line no-console
  console.info(`OTP for ${to}: ${code}`);
  return false;
}

export default sendOtpEmail;
