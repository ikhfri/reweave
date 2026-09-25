import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { isValidLocale, type Locale } from "@/i18n/config";

import CheckInForm from "./check-in-form";

export default async function CheckInPage({
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
    <CheckInForm
      locale={locale as Locale}
      userName={user.name}
    />
  );
}