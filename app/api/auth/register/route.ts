import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  try {
    const { email, name, password } = (await req.json()) as { email: string; name?: string; password?: string };
    if (!email || !password) return NextResponse.json({ ok: false, error: "email and password required" }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ ok: false, error: "user_exists" }, { status: 409 });

    const hash = bcrypt.hashSync(password, 8);
    const user = await prisma.user.create({ data: { email, name, passwordHash: hash } });

    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json({ ok: false, error: "internal" }, { status: 500 });
  }
}
