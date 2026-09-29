import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import {
  isValidLocale,
  type Locale,
} from "@/i18n/config";

import DashboardClient from "./dashboard-client";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function DashboardPage({
  params,
}: Props) {
  const { locale: localeParam } = await params;

  if (!isValidLocale(localeParam)) {
    redirect("/id/dashboard");
  }

  const locale = localeParam as Locale;

  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  if (!user.onboardingCompleted) {
    redirect(`/${locale}/onboarding`);
  }

  return (
    <DashboardClient
      locale={locale}
      userName={user.name}
      nickname={user.nickname ?? null}
    />
  );
}