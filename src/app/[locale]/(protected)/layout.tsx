import { redirect } from "next/navigation";

import DashboardShell from "@/components/dashboard/dashboard-shell";
import { getCurrentUser } from "@/lib/auth";
import { isValidLocale, type Locale } from "@/i18n/config";

export default async function ProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
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
    <DashboardShell
      locale={locale as Locale}
      user={{
        name: user.name,
        email: user.email,
      }}
    >
      {children}
    </DashboardShell>
  );
}
