import { Suspense } from "react";
import ResetPasswordClient from "./reset-password-client";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ResetPasswordPage({ params }: Props) {
  const { locale } = await params;

  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#E2725B] border-t-transparent" />
        </main>
      }
    >
      <ResetPasswordClient locale={locale} />
    </Suspense>
  );
}