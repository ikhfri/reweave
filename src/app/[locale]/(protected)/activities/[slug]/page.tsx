import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { isValidLocale, type Locale } from "@/i18n/config";
import ActivityDetailClient from "./activity-detail-client";

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}) {
  const { locale, slug } = await params;

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
    <ActivityDetailClient
      locale={locale as Locale}
      slug={slug}
    />
  );
}