import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getUserBySessionToken } from "@/lib/auth/session";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;\s]+)/);
    const token = match ? match[1] : undefined;
    const actor = await getUserBySessionToken(token);
    if (!actor) return NextResponse.json({ ok: false, error: "missing_actor" }, { status: 401 });
    if (actor.role !== "admin") return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

    await prisma.feedback.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json({ ok: false, error: "internal" }, { status: 500 });
  }
}
