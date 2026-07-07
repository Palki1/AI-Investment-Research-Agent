import { NextResponse } from "next/server";
import { APP_NAME } from "@/lib/config/constants";
import { setOtp } from "@/lib/auth/otp-store";
import sendOtpEmail from "@/lib/auth/email-sender";

type Body = { email?: string };

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const email = body?.email;
    if (!email) {
      return NextResponse.json({ ok: false, error: "email is required" }, { status: 400 });
    }

    const code = generateCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    setOtp(email, code, expiresAt);

    const sent = await sendOtpEmail(email, code);

    const devMode = !process.env.SENDGRID_API_KEY || process.env.NODE_ENV !== "production";

    return NextResponse.json({ ok: true, sent, devCode: devMode ? code : undefined });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json({ ok: false, error: "internal" }, { status: 500 });
  }
}
