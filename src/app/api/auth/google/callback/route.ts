import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";

import {
  exchangeGoogleCode,
  getGoogleUserInfo,
  GOOGLE_LOCALE_COOKIE,
  GOOGLE_STATE_COOKIE,
} from "@/lib/auth/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSafeLocale(value: string | undefined) {
  return value === "en" ? "en" : "id";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const cookieStore = await cookies();

  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const error = requestUrl.searchParams.get("error");

  const savedState = cookieStore.get(GOOGLE_STATE_COOKIE)?.value;
  const locale = getSafeLocale(
    cookieStore.get(GOOGLE_LOCALE_COOKIE)?.value,
  );

  const loginUrl = new URL(`/${locale}/login`, requestUrl.origin);

  loginUrl.searchParams.set(
    "error",
    "google_auth_failed",
  );

  if (error) {
    console.error("GOOGLE_OAUTH_DENIED", {
      error,
      description: requestUrl.searchParams.get("error_description"),
    });

    const response = NextResponse.redirect(loginUrl);

    response.cookies.delete(GOOGLE_STATE_COOKIE);
    response.cookies.delete(GOOGLE_LOCALE_COOKIE);

    return response;
  }

  if (!code || !state || !savedState) {
    console.error("GOOGLE_OAUTH_MISSING_PARAMS");

    const response = NextResponse.redirect(loginUrl);

    response.cookies.delete(GOOGLE_STATE_COOKIE);
    response.cookies.delete(GOOGLE_LOCALE_COOKIE);

    return response;
  }

  if (state !== savedState) {
    console.error("GOOGLE_OAUTH_STATE_MISMATCH");

    const response = NextResponse.redirect(loginUrl);

    response.cookies.delete(GOOGLE_STATE_COOKIE);
    response.cookies.delete(GOOGLE_LOCALE_COOKIE);

    return response;
  }

  try {
    const tokenData = await exchangeGoogleCode(code);

    const googleUser = await getGoogleUserInfo(
      tokenData.access_token!,
    );

    const email = googleUser.email.trim().toLowerCase();

    if (googleUser.email_verified === false) {
      throw new Error("GOOGLE_EMAIL_NOT_VERIFIED");
    }

    let user = await prisma.user.findUnique({
      where: {
        googleId: googleUser.sub,
      },
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: {
          email,
        },
      });
    }

    if (user) {
      if (
        user.googleId &&
        user.googleId !== googleUser.sub
      ) {
        console.error(
          "GOOGLE_ACCOUNT_ID_CONFLICT",
          {
            userId: user.id,
            email,
          },
        );

        throw new Error("GOOGLE_ACCOUNT_CONFLICT");
      }

      user = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          googleId: googleUser.sub,
          authProvider: "GOOGLE",
          emailVerifiedAt:
            user.emailVerifiedAt ?? new Date(),
          avatarUrl:
            googleUser.picture || user.avatarUrl,
          name:
            user.name.trim().length > 0
              ? user.name
              : googleUser.name || "Moodify User",
        },
      });
    } else {
      const generatedPassword = await hashPassword(
        cryptoRandomPassword(),
      );

      user = await prisma.user.create({
        data: {
          email,
          passwordHash: generatedPassword,
          name:
            googleUser.name ||
            googleUser.given_name ||
            "Moodify User",
          nickname:
            googleUser.given_name ||
            null,
          avatarUrl:
            googleUser.picture || null,
          emailVerifiedAt: new Date(),
          authProvider: "GOOGLE",
          googleId: googleUser.sub,
          onboardingCompleted: false,
        },
      });
    }

    await createSession(user.id);

    const destination = user.onboardingCompleted
      ? `/${locale}/dashboard`
      : `/${locale}/onboarding`;

    const response = NextResponse.redirect(
      new URL(destination, requestUrl.origin),
    );

    response.cookies.delete(GOOGLE_STATE_COOKIE);
    response.cookies.delete(GOOGLE_LOCALE_COOKIE);

    return response;
  } catch (error) {
    console.error("GOOGLE_OAUTH_CALLBACK_ERROR", error);

    const response = NextResponse.redirect(loginUrl);

    response.cookies.delete(GOOGLE_STATE_COOKIE);
    response.cookies.delete(GOOGLE_LOCALE_COOKIE);

    return response;
  }
}

function cryptoRandomPassword() {
  return `${cryptoRandomPart()}-${cryptoRandomPart()}-${cryptoRandomPart()}`;
}

function cryptoRandomPart() {
  return Math.random().toString(36).slice(2, 14);
}