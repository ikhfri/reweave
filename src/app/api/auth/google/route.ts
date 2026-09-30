import { NextResponse } from "next/server";
import {
  buildGoogleAuthorizationUrl,
  generateGoogleState,
  GOOGLE_LOCALE_COOKIE,
  GOOGLE_STATE_COOKIE,
  GOOGLE_STATE_MAX_AGE,
} from "@/lib/auth/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const localeParam = url.searchParams.get("locale");

    const locale =
      localeParam === "en" || localeParam === "id"
        ? localeParam
        : "id";

    const state = generateGoogleState();

    const googleUrl = buildGoogleAuthorizationUrl(state);

    const response = NextResponse.redirect(googleUrl);

    response.cookies.set({
      name: GOOGLE_STATE_COOKIE,
      value: state,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: GOOGLE_STATE_MAX_AGE,
      path: "/",
    });

    response.cookies.set({
      name: GOOGLE_LOCALE_COOKIE,
      value: locale,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: GOOGLE_STATE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("GOOGLE_AUTH_START_ERROR", error);

    const url = new URL(request.url);

    return NextResponse.redirect(
      new URL(
        `/${url.searchParams.get("locale") === "en" ? "en" : "id"}/login?error=google_config`,
        url.origin,
      ),
    );
  }
}