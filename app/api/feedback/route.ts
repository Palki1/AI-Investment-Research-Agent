import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const items = await prisma.feedback.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } });
    const out = items.map((i) => ({ id: i.id, text: i.text, createdAt: i.createdAt, user: { id: i.user.id, email: i.user.email, name: i.user.name } }));
    return NextResponse.json({ ok: true, items: out });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json({ ok: false, error: "internal" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, text } = (await req.json()) as { userId: string; text: string };
    if (!userId || !text) return NextResponse.json({ ok: false, error: "userId and text required" }, { status: 400 });
    const fb = await prisma.feedback.create({ data: { text, userId } });
    return NextResponse.json({ ok: true, feedback: { id: fb.id, text: fb.text } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json({ ok: false, error: "internal" }, { status: 500 });
  }
}
