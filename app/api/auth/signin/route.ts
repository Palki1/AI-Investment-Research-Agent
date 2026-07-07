import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { createSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const { email, password } = (await req.json()) as { email: string; password?: string };
    if (!email || !password) return NextResponse.json({ ok: false, error: "email and password required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });

    const ok = user.passwordHash ? bcrypt.compareSync(password, user.passwordHash) : false;
    if (!ok) return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });

    // update lastActive
    await prisma.user.update({ where: { id: user.id }, data: { lastActive: new Date() } });

    // create session and set cookie
    const sess = await createSession(user.id);
    const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    res.cookies.set("session", sess.token, { httpOnly: true, path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json({ ok: false, error: "internal" }, { status: 500 });
  }
}
