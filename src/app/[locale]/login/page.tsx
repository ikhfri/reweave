"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/i18n/config";

const content = {
  id: {
    eyebrow: "RUANG UNTUK DIRIMU",

    headline: "Selamat datang kembali.",

    description:
      "Luangkan waktu sejenak untuk melihat apa yang sedang kamu rasakan.",

    email: "Email",
    emailPlaceholder: "Masukkan email kamu",

    password: "Password",
    passwordPlaceholder: "Masukkan password kamu",

    showPassword: "Tampilkan password",
    hidePassword: "Sembunyikan password",

    forgotPassword: "Lupa password?",

    login: "Masuk",
    loggingIn: "Memproses...",

    noAccount: "Belum punya akun?",
    register: "Daftar sekarang",

    privacyTitle: "Ruang pribadimu",

    privacyText:
      "Cerita, check-in, dan refleksi yang kamu simpan tetap terhubung dengan akunmu.",

    terms:
      "Dengan masuk, kamu menyetujui Terms of Service dan Privacy Policy Moodify.",

    errors: {
      loginFailed: "Email atau password salah.",
      general: "Terjadi kesalahan. Silakan coba lagi.",
    },
  },

  en: {
    eyebrow: "A SPACE FOR YOU",

    headline: "Welcome back.",

    description:
      "Take a moment to check in with yourself and notice how you are feeling.",

    email: "Email",
    emailPlaceholder: "Enter your email",

    password: "Password",
    passwordPlaceholder: "Enter your password",

    showPassword: "Show password",
    hidePassword: "Hide password",

    forgotPassword: "Forgot password?",

    login: "Sign in",
    loggingIn: "Signing in...",

    noAccount: "Don't have an account?",
    register: "Create an account",

    privacyTitle: "Your private space",

    privacyText:
      "Your stories, check-ins, and reflections stay connected to your account.",

    terms:
      "By signing in, you agree to Moodify's Terms of Service and Privacy Policy.",

    errors: {
      loginFailed: "Invalid email or password.",
      general: "Something went wrong. Please try again.",
    },
  },
};

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();

  const localeParam = params.locale;

  const locale: Locale =
    localeParam === "en" ? "en" : "id";

  const isEnglish = locale === "en";

  const t = content[locale];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || t.errors.loginFailed,
        );

        return;
      }

      if (data.user?.onboardingCompleted) {
        router.push(`/${locale}/dashboard`);
      } else {
        router.push(`/${locale}/onboarding`);
      }

      router.refresh();
    } catch {
      setError(t.errors.general);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#4A3F35]">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
        {/* =====================================================
            LEFT BRAND AREA
        ====================================================== */}

        <section className="relative hidden min-h-screen overflow-hidden bg-[#FDFBF7] lg:block">
          {/* Subtle organic shapes */}

          <div className="absolute -left-32 -top-32 h-[360px] w-[360px] rounded-full bg-[#FBC4AB]/20" />

          <div className="absolute -bottom-40 -right-32 h-[500px] w-[500px] rounded-full bg-[#C1D5C0]/25" />

          <div className="absolute right-[18%] top-[34%] h-20 w-20 rounded-full border border-[#5C6B9C]/10" />

          <div className="relative z-10 flex min-h-screen flex-col justify-between p-12 xl:p-16">
            {/* BRAND */}

            <Link
              href={`/${locale}`}
              className="inline-flex w-fit"
              aria-label="Moodify"
            >
              <Image
                src="/Moodify-logo.png"
                alt="Moodify"
                width={180}
                height={55}
                priority
                className="h-16 w-auto object-contain"
              />
            </Link>

            {/* CENTER CONTENT */}

            <div className="max-w-[520px]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5C6B9C]">
                {t.eyebrow}
              </p>

              <h1 className="mt-5 max-w-lg text-[48px] font-semibold leading-[1.04] tracking-[-0.055em] text-[#4A3F35] xl:text-[60px]">
                {t.headline}
              </h1>

              <p className="mt-6 max-w-md text-[15px] leading-7 text-[#4A3F35]/55">
                {t.description}
              </p>

              {/* Small brand statement */}

              <div className="mt-10 flex max-w-md items-start gap-4 border-l-2 border-[#E2725B]/40 pl-5">
                <div>
                  <p className="text-sm font-medium leading-6 text-[#4A3F35]/75">
                    {isEnglish
                      ? "You don't have to understand everything today."
                      : "Kamu tidak harus memahami semuanya hari ini."}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#4A3F35]/40">
                    {isEnglish
                      ? "Start with one honest moment."
                      : "Mulai dari satu momen yang jujur."}
                  </p>
                </div>
              </div>
            </div>

            {/* BOTTOM */}

            <div className="flex max-w-md items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C1D5C0]/35">
                <ShieldCheck
                  className="h-4 w-4 text-[#5C6B9C]"
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-[#4A3F35]/70">
                  {t.privacyTitle}
                </p>

                <p className="mt-0.5 text-[10px] leading-4 text-[#4A3F35]/40">
                  {t.privacyText}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT LOGIN AREA
        ====================================================== */}

        <section className="relative flex min-h-screen flex-col bg-white">
          {/* TOP BAR */}

          <header className="flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
            {/* Mobile logo */}

            <Link
              href={`/${locale}`}
              className="lg:hidden"
              aria-label="Moodify"
            >
              <Image
                src="/Moodify-logo.png"
                alt="Moodify"
                width={150}
                height={45}
                priority
                className="h-12 w-auto object-contain"
              />
            </Link>

            <div className="ml-auto">
              <LanguageSwitcher locale={locale} />
            </div>
          </header>

          {/* FORM */}

          <div className="flex flex-1 items-center justify-center px-5 pb-12 pt-4 sm:px-8 lg:px-12">
            <div className="w-full max-w-[430px]">
              {/* FORM HEADER */}

              <div className="mb-9">
                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FBC4AB]/30">
                  <LockKeyhole
                    className="h-[18px] w-[18px] text-[#5C6B9C]"
                    strokeWidth={1.8}
                  />
                </div>

                <h2 className="text-[32px] font-semibold tracking-[-0.045em] text-[#4A3F35]">
                  {isEnglish
                    ? "Sign in to Moodify"
                    : "Masuk ke Moodify"}
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#4A3F35]/50">
                  {t.description}
                </p>
              </div>

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-semibold text-[#4A3F35]/75"
                  >
                    {t.email}
                  </label>

                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#4A3F35]/30"
                      strokeWidth={1.8}
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder={t.emailPlaceholder}
                      required
                      disabled={isLoading}
                      className="
                        h-[52px]
                        w-full
                        rounded-2xl
                        border
                        border-[#4A3F35]/10
                        bg-[#FDFBF7]
                        pl-11
                        pr-4
                        text-sm
                        text-[#4A3F35]
                        outline-none
                        transition
                        placeholder:text-[#4A3F35]/30
                        hover:border-[#C1D5C0]
                        focus:border-[#E2725B]
                        focus:bg-white
                        focus:ring-4
                        focus:ring-[#E2725B]/10
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    />
                  </div>
                </div>

                {/* PASSWORD */}

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold text-[#4A3F35]/75"
                    >
                      {t.password}
                    </label>

                    <button
                      type="button"
                      disabled
                      className="text-[11px] font-medium text-[#4A3F35]/30"
                    >
                      {t.forgotPassword}
                    </button>
                  </div>

                  <div className="relative">
                    <LockKeyhole
                      className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#4A3F35]/30"
                      strokeWidth={1.8}
                    />

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder={
                        t.passwordPlaceholder
                      }
                      required
                      disabled={isLoading}
                      className="
                        h-[52px]
                        w-full
                        rounded-2xl
                        border
                        border-[#4A3F35]/10
                        bg-[#FDFBF7]
                        pl-11
                        pr-12
                        text-sm
                        text-[#4A3F35]
                        outline-none
                        transition
                        placeholder:text-[#4A3F35]/30
                        hover:border-[#C1D5C0]
                        focus:border-[#E2725B]
                        focus:bg-white
                        focus:ring-4
                        focus:ring-[#E2725B]/10
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) => !previous,
                        )
                      }
                      disabled={isLoading}
                      aria-label={
                        showPassword
                          ? t.hidePassword
                          : t.showPassword
                      }
                      className="
                        absolute
                        right-2
                        top-1/2
                        flex
                        h-9
                        w-9
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-xl
                        text-[#4A3F35]/35
                        transition
                        hover:bg-[#C1D5C0]/25
                        hover:text-[#4A3F35]/65
                        disabled:pointer-events-none
                      "
                    >
                      {showPassword ? (
                        <EyeOff
                          className="h-[17px] w-[17px]"
                          strokeWidth={1.8}
                        />
                      ) : (
                        <Eye
                          className="h-[17px] w-[17px]"
                          strokeWidth={1.8}
                        />
                      )}
                    </button>
                  </div>
                </div>

                {/* ERROR */}

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-xs leading-5 text-red-600">
                      {error}
                    </p>
                  </div>
                )}

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                    group
                    flex
                    h-[52px]
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-[#E2725B]
                    px-5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-[#4A3F35]
                    focus:outline-none
                    focus:ring-4
                    focus:ring-[#E2725B]/15
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <span>
                    {isLoading
                      ? t.loggingIn
                      : t.login}
                  </span>

                  {!isLoading && (
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                      strokeWidth={1.8}
                    />
                  )}
                </button>
              </form>

              {/* REGISTER */}

              <div className="mt-8 flex items-center justify-center gap-1.5 text-sm">
                <span className="text-[#4A3F35]/45">
                  {t.noAccount}
                </span>

                <Link
                  href={`/${locale}/register`}
                  className="font-semibold text-[#5C6B9C] transition hover:text-[#E2725B]"
                >
                  {t.register}
                </Link>
              </div>

              {/* PRIVACY */}

              <div className="mt-9 border-t border-[#4A3F35]/[0.07] pt-6">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#5C6B9C]/60"
                    strokeWidth={1.8}
                  />

                  <p className="text-[10px] leading-5 text-[#4A3F35]/35">
                    {t.terms}
                  </p>
                </div>
              </div>

              {/* MOBILE BRAND MESSAGE */}

              <div className="mt-8 flex justify-center lg:hidden">
                <Link
                  href={`/${locale}`}
                  className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#4A3F35]/30 transition hover:text-[#5C6B9C]"
                >
                  {isEnglish
                    ? "Back to Moodify"
                    : "Kembali ke Moodify"}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}