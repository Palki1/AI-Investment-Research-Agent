import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, createdAt: true } });
    return NextResponse.json({ ok: true, users });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json({ ok: false, error: "internal" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email, name, password } = (await req.json()) as { email: string; name?: string; password?: string };
    if (!email || !password) return NextResponse.json({ ok: false, error: "email and password required" }, { status: 400 });
    // delegate to auth/register
    return await fetch(new Request("/api/auth/register", { method: "POST", body: JSON.stringify({ email, name, password }), headers: { "Content-Type": "application/json" } })).then((r) => NextResponse.json(r));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json({ ok: false, error: "internal" }, { status: 500 });
  }
}
