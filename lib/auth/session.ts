import { prisma } from "@/lib/db/prisma";
import { randomBytes } from "crypto";

function makeToken(bytes = 48) {
  return randomBytes(bytes).toString("hex");
}

export async function createSession(userId: string, maxAgeSeconds = 60 * 60 * 24 * 7) {
  const token = makeToken(48);
  const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000);
  const s = await prisma.session.create({ data: { token, userId, expiresAt } });
  return { token: s.token, expiresAt: s.expiresAt };
}

export async function getUserBySessionToken(token?: string) {
  if (!token) return null;
  const s = await prisma.session.findUnique({ where: { token }, include: { user: true } });
  if (!s) return null;
  if (s.expiresAt && s.expiresAt.getTime() < Date.now()) return null;
  return s.user;
}

export async function deleteSessionByToken(token?: string) {
  if (!token) return;
  try {
    await prisma.session.deleteMany({ where: { token } });
  } catch {}
}

export default { createSession, getUserBySessionToken, deleteSessionByToken };
