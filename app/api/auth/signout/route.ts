import { NextResponse } from "next/server";
import { deleteSessionByToken } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;\s]+)/);
    const token = match ? match[1] : undefined;
    if (token) await deleteSessionByToken(token);
    const res = NextResponse.json({ ok: true });
    res.cookies.set("session", "", { httpOnly: true, path: "/", maxAge: 0 });
    return res;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json({ ok: false, error: "internal" }, { status: 500 });
  }
}
