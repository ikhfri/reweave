import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { isValidLocale, type Locale } from "@/i18n/config";
import SettingsClient from "./settings-client";

export default async function SettingsPage({
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

  return (
    <SettingsClient
      locale={locale as Locale}
      userName={user.name}
    />
  );
}