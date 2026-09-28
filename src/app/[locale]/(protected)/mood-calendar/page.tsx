import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import {
  isValidLocale,
  type Locale,
} from "@/i18n/config";

import MoodCalendarClient from "./mood-calendar-client";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function MoodCalendarPage({
  params,
}: Props) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    redirect("/id/mood-calendar");
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  if (!user.onboardingCompleted) {
    redirect(`/${locale}/onboarding`);
  }

  return (
    <MoodCalendarClient
      locale={locale as Locale}
      userName={user.name}
    />
  );
}