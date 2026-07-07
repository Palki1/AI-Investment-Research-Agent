import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getUserBySessionToken } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const actorToken = req.headers.get("cookie") || "";
    const match = actorToken.match(/session=([^;\s]+)/);
    const token = match ? match[1] : undefined;
    const actor = await getUserBySessionToken(token);
    if (!actor || actor.role !== "admin") return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

    const { userId } = (await req.json()) as { userId: string };
    if (!userId) return NextResponse.json({ ok: false, error: "userId required" }, { status: 400 });

    const u = await prisma.user.update({ where: { id: userId }, data: { role: "admin" } });
    return NextResponse.json({ ok: true, user: { id: u.id, email: u.email, role: u.role } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json({ ok: false, error: "internal" }, { status: 500 });
  }
}
