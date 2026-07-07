import { NextResponse } from "next/server";
import { getUserBySessionToken } from "@/lib/auth/session";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;\s]+)/);
    const token = match ? match[1] : undefined;
    const user = await getUserBySessionToken(token);
    if (!user) return NextResponse.json({ ok: false, user: null });
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json({ ok: false, user: null }, { status: 500 });
  }
}
