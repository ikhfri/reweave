import { Suspense } from "react";
import LoginClient from "./login-client";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

function LoginFallback() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-6">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#E2725B] border-t-transparent" />
    </main>
  );
}

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;

  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginClient locale={locale} />
    </Suspense>
  );
}