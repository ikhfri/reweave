import { Suspense } from "react";
import RegisterClient from "./register-client";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

function RegisterFallback() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#FDFBF7]">
      <div
        className="
          h-10
          w-10
          animate-spin
          rounded-full
          border-2
          border-[#E2725B]
          border-t-transparent
        "
      />
    </main>
  );
}

export default async function RegisterPage({
  params,
}: Props) {
  const { locale } = await params;

  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterClient locale={locale} />
    </Suspense>
  );
}