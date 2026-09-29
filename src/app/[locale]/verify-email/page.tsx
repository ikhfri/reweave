import { Suspense } from "react";

import VerifyEmailClient from "./verify-email-client";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function VerifyEmailPage({
  params,
}: Props) {
  const { locale } = await params;

  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FDFBF7] px-5 py-8 text-[#4A3F35]">
          <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center">
            <div className="w-full rounded-[28px] border border-[#4A3F35]/10 bg-white p-8 shadow-[0_20px_60px_rgba(74,63,53,0.08)]">
              <div className="animate-pulse space-y-4">
                <div className="h-4 w-24 rounded bg-[#C1D5C0]/40" />
                <div className="h-8 w-52 rounded bg-[#C1D5C0]/40" />
                <div className="h-4 w-full rounded bg-[#C1D5C0]/30" />
                <div className="h-16 w-full rounded-2xl bg-[#C1D5C0]/30" />
              </div>
            </div>
          </div>
        </main>
      }
    >
      <VerifyEmailClient locale={locale} />
    </Suspense>
  );
}
