import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { isValidLocale, type Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";

import MoodCalendarClient from "./mood-calendar-client";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function MoodCalendarPage({ params }: Props) {
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

  // Ambil data user beserta nickname dari database
  const dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      name: true,
      nickname: true,
    },
  });

  return (
    <MoodCalendarClient
      locale={locale as Locale}
      userName={dbUser?.name ?? user.name ?? ""}
      nickname={dbUser?.nickname ?? null}
    />
  );
}