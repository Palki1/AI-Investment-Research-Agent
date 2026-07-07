import { NextResponse } from "next/server";

import { getOtp, deleteOtp } from "@/lib/auth/otp-store";

type Body = { email?: string; code?: string };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const email = body?.email;
    const code = body?.code;
    if (!email || !code) {
      return NextResponse.json({ ok: false, error: "email and code are required" }, { status: 400 });
    }

    const entry = getOtp(email);
    if (!entry) {
      return NextResponse.json({ ok: false, error: "no-code" }, { status: 400 });
    }

    if (Date.now() > entry.expiresAt) {
      deleteOtp(email);
      return NextResponse.json({ ok: false, error: "expired" }, { status: 400 });
    }

    if (entry.code !== code) {
      return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
    }

    deleteOtp(email);
    return NextResponse.json({ ok: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json({ ok: false, error: "internal" }, { status: 500 });
  }
}
