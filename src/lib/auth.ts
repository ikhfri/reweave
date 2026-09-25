import { cookies } from "next/headers";
import crypto from "crypto";

import { prisma } from "./prisma";

const SESSION_COOKIE = "moodify_session";
const SESSION_DURATION = 1000 * 60 * 60 * 24 * 30; // 30 days

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return token;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      token,
    },
    include: {
      user: true,
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    });

    return null;
  }

  return session.user;
}

export async function deleteSession() {
  const cookieStore = await cookies();

  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: {
        token,
      },
    });
  }

  cookieStore.delete(SESSION_COOKIE);
}