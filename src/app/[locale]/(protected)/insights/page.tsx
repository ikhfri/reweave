import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { isValidLocale, type Locale } from "@/i18n/config";

import InsightsClient from "./insights-client";

export default async function InsightsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    redirect("/id/dashboard");
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  if (!user.onboardingCompleted) {
    redirect(`/${locale}/onboarding`);
  }

  const userWithNickname = user as typeof user & { nickname?: string | null };

  return (
    <InsightsClient
      locale={locale as Locale}
      userName={user.name ?? ""}
      nickname={userWithNickname.nickname ?? null}
    />
  );
}