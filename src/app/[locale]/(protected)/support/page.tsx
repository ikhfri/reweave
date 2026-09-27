import { redirect } from "next/navigation";

import SupportClient from "./support-client";
import { getCurrentUser } from "@/lib/auth";
import { isValidLocale, type Locale } from "@/i18n/config";

export default async function SupportPage({
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
    <SupportClient
      locale={locale as Locale}
      userName={user.name}
    />
  );
}