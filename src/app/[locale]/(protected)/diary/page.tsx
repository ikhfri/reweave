import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { isValidLocale, type Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";

import DiaryClient from "./diary-client";

export default async function DiaryPage({
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

  // Fetch data user beserta nickname dari database
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
    <DiaryClient
      locale={locale as Locale}
      userName={dbUser?.name ?? user.name ?? ""}
      nickname={dbUser?.nickname ?? null}
    />
  );
}
