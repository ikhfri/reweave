"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
  ArrowRightIcon,
  MailIcon,
} from "@/components/moodify-icons";

import { LanguageSwitcher } from "@/components/language-switcher";

type ForgotPasswordClientProps = {
  locale: string;
};

type Language = "id" | "en";

const translations = {
  id: {
    title: "Lupa password?",
    subtitle:
      "Masukkan email yang kamu gunakan untuk akun Moodify. Kami akan mengirimkan kode verifikasi untuk membuat password baru.",
    email: "Email",
    emailPlaceholder: "you@example.com",
    submit: "Kirim kode verifikasi",
    submitting: "Mengirim kode...",
    backToLogin: "Kembali ke login",
    invalidEmail: "Masukkan alamat email yang valid.",
    genericError: "Terjadi kesalahan. Silakan coba lagi.",
    security:
      "Jika email terdaftar, kode verifikasi akan dikirim ke alamat tersebut.",
  },

  en: {
    title: "Forgot your password?",
    subtitle:
      "Enter the email address you use for your Moodify account. We'll send you a verification code to create a new password.",
    email: "Email",
    emailPlaceholder: "you@example.com",
    submit: "Send verification code",
    submitting: "Sending code...",
    backToLogin: "Back to login",
    invalidEmail: "Please enter a valid email address.",
    genericError: "Something went wrong. Please try again.",
    security:
      "If the email is registered, a verification code will be sent to that address.",
  },
} as const;

export default function ForgotPasswordClient({
  locale,
}: ForgotPasswordClientProps) {
  const router = useRouter();

  const language: Language = locale === "en" ? "en" : "id";
  const t = translations[language];

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(t.invalidEmail);
      return;
    }

    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      normalizedEmail,
    );

    if (!emailIsValid) {
      setError(t.invalidEmail);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || t.genericError);
        return;
      }

      router.push(
        `/${locale}/reset-password?email=${encodeURIComponent(
          normalizedEmail,
        )}`,
      );
    } catch (requestError) {
      console.error(
        "FORGOT_PASSWORD_CLIENT_ERROR",
        requestError,
      );

      setError(t.genericError);
    } finally {
      setIsLoading(false);
    }
  }

  function handleBack() {
    router.push(`/${locale}/login`);
  }

  return (
    <main className="min-h-[100svh] bg-[#FDFBF7] text-[#4A3F35]">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8">

        {/* Top navigation */}
        <header className="flex w-full items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            aria-label={t.backToLogin}
            className="
              group
              inline-flex
              min-h-10
              items-center
              gap-2
              rounded-full
              border
              border-[#4A3F35]/8
              bg-white/80
              px-3.5
              text-xs
              font-semibold
              text-[#5C6B9C]
              shadow-[0_3px_12px_rgba(74,63,53,0.04)]
              backdrop-blur-sm
              transition-all
              duration-200
              hover:border-[#E2725B]/20
              hover:bg-white
              hover:text-[#E2725B]
              active:scale-[0.98]
              sm:min-h-10
              sm:px-4
              sm:text-sm
            "
          >
            <span
              aria-hidden="true"
              className="
                flex
                h-5
                w-5
                items-center
                justify-center
                text-base
                leading-none
                transition-transform
                duration-200
                group-hover:-translate-x-0.5
              "
            >
              ←
            </span>

            <span>{t.backToLogin}</span>
          </button>

          <LanguageSwitcher locale={language} />
        </header>

        {/* Main content */}
        <div className="flex flex-1 items-center justify-center py-8 sm:py-10 lg:py-12">
          <div className="w-full max-w-[480px]">

            {/* Logo */}
            <div className="mb-7 flex justify-center sm:mb-8">
              <Image
                src="/moodify-logo.webp"
                alt="Moodify"
                width={132}
                height={132}
                priority
                className="h-auto w-[118px] object-contain sm:w-[132px]"
              />
            </div>

            {/* Card */}
            <section
              className="
                rounded-[24px]
                border
                border-[#4A3F35]/8
                bg-white
                p-5
                shadow-[0_16px_50px_rgba(74,63,53,0.07)]
                sm:rounded-[28px]
                sm:p-8
              "
            >
              {/* Heading */}
              <div className="mb-7 sm:mb-8">
                <div
                  className="
                    mb-4
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-[14px]
                    bg-[#FBC4AB]/35
                    text-[#E2725B]
                    sm:h-12
                    sm:w-12
                  "
                >
                  <MailIcon className="h-5 w-5" />
                </div>

                <h1
                  className="
                    text-[25px]
                    font-semibold
                    tracking-[-0.03em]
                    text-[#4A3F35]
                    sm:text-[28px]
                  "
                >
                  {t.title}
                </h1>

                <p
                  className="
                    mt-2.5
                    max-w-[410px]
                    text-[13px]
                    leading-6
                    text-[#4A3F35]/60
                    sm:text-sm
                  "
                >
                  {t.subtitle}
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Email */}
                <div>
                  <label
                    htmlFor="forgot-email"
                    className="
                      mb-2
                      block
                      text-xs
                      font-semibold
                      text-[#4A3F35]/75
                      sm:text-[13px]
                    "
                  >
                    {t.email}
                  </label>

                  <div className="relative">
                    <MailIcon
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        h-[17px]
                        w-[17px]
                        -translate-y-1/2
                        text-[#4A3F35]/35
                      "
                    />

                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError("");
                      }}
                      placeholder={t.emailPlaceholder}
                      autoComplete="email"
                      autoFocus
                      disabled={isLoading}
                      className="
                        h-12
                        w-full
                        rounded-xl
                        border
                        border-[#4A3F35]/12
                        bg-[#FDFBF7]
                        pl-11
                        pr-4
                        text-sm
                        text-[#4A3F35]
                        outline-none
                        transition
                        placeholder:text-[#4A3F35]/30
                        focus:border-[#E2725B]/50
                        focus:bg-white
                        focus:ring-4
                        focus:ring-[#E2725B]/8
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                        sm:h-[50px]
                      "
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    className="
                      rounded-xl
                      border
                      border-[#E2725B]/20
                      bg-[#E2725B]/7
                      px-4
                      py-3
                      text-xs
                      leading-5
                      text-[#B85542]
                    "
                  >
                    {error}
                  </div>
                )}

                {/* Security information */}
                <div
                  className="
                    rounded-xl
                    border
                    border-[#C1D5C0]/70
                    bg-[#C1D5C0]/20
                    px-4
                    py-3.5
                  "
                >
                  <p className="text-[11px] leading-5 text-[#4A3F35]/60 sm:text-xs">
                    {t.security}
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#E2725B]
                    px-5
                    text-sm
                    font-semibold
                    text-white
                    shadow-[0_8px_20px_rgba(226,114,91,0.18)]
                    transition-all
                    duration-200
                    hover:bg-[#d96650]
                    hover:shadow-[0_10px_24px_rgba(226,114,91,0.22)]
                    active:scale-[0.99]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    sm:h-[50px]
                  "
                >
                  <span>
                    {isLoading ? t.submitting : t.submit}
                  </span>

                  {!isLoading && (
                    <ArrowRightIcon className="h-[17px] w-[17px]" />
                  )}
                </button>
              </form>
            </section>

            {/* Footer */}
            <p
              className="
                mt-6
                text-center
                text-[10px]
                leading-5
                text-[#4A3F35]/40
                sm:mt-7
                sm:text-[11px]
              "
            >
              Moodify · Emotional wellbeing, one day at a time.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}