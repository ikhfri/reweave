import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { getDictionary } from "@/i18n/get-dictionary";
import {
  isValidLocale,
  type Locale,
} from "@/i18n/config";

import OnboardingForm from "./onboarding-form";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    redirect("/id/onboarding");
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  if (user.onboardingCompleted) {
    redirect(`/${locale}/dashboard`);
  }

  const dictionary = await getDictionary(locale as Locale);

  return (
    <OnboardingForm
      locale={locale as Locale}
      dictionary={dictionary}
      userName={user.name}
    />
  );
}