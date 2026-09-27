"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Heart,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/i18n/config";

const content = {
  id: {
    badge: "EMOTIONAL WELLBEING",

    headline: "Ruang untuk memahami dirimu.",
    description:
      "Kenali emosimu, pahami pola perasaanmu, dan bangun kebiasaan yang mendukung kesejahteraan emosionalmu.",

    previewTitle: "Emotional check-in",
    previewText: "Bagaimana perasaanmu hari ini?",

    privacyTitle: "Privasi adalah prioritas",
    privacyText:
      "Data emosionalmu disimpan dengan aman dan hanya digunakan untuk memberikan pengalaman yang lebih personal.",

    welcome: "Selamat datang kembali",
    subtitle:
      "Masuk untuk melanjutkan perjalananmu bersama Moodify.",

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

    privacyNote:
      "Dengan masuk, kamu menyetujui Terms of Service dan Privacy Policy Moodify.",

    errors: {
      loginFailed: "Email atau password salah.",
      general: "Terjadi kesalahan. Silakan coba lagi.",
    },
  },

  en: {
    badge: "EMOTIONAL WELLBEING",

    headline: "A space to understand yourself.",
    description:
      "Understand your emotions, discover your emotional patterns, and build habits that support your wellbeing.",

    previewTitle: "Emotional check-in",
    previewText: "How are you feeling today?",

    privacyTitle: "Your privacy matters",
    privacyText:
      "Your emotional data is stored securely and only used to provide a more personalized experience.",

    welcome: "Welcome back",
    subtitle:
      "Sign in to continue your journey with Moodify.",

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

    privacyNote:
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
  const locale: Locale = localeParam === "en" ? "en" : "id";

  const t = content[locale];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
        setError(data.message || t.errors.loginFailed);
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
    <main className="min-h-screen bg-[#fdfbf7]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* =========================================================
            LEFT BRAND PANEL
        ========================================================== */}
        <section className="relative hidden overflow-hidden bg-[#e2725b] lg:flex">
          {/* Decorative background */}
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#fdfbf7]/[0.06]" />

          <div className="absolute -bottom-40 -right-32 h-[520px] w-[520px] rounded-full bg-[#fbc4ab]/30" />

          <div className="absolute right-20 top-24 h-24 w-24 rounded-full border border-white/10" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3">
                <Image
                  src="/moodify-logo.png"
                  alt="Moodify"
                  width={48}
                  height={48}
                  priority
                  className="h-12 w-12 object-contain"
                />

                <span className="text-xl font-bold tracking-tight text-white">
                  Moodify
                </span>
              </div>
            </div>

            {/* Main content */}
            <div className="max-w-xl">
              {/* Badge */}
              <div className="mb-7 inline-flex items-center rounded-full border border-[#fdfbf7]/20 bg-[#fdfbf7]/[0.08] px-4 py-2">
                <span className="text-[11px] font-semibold tracking-[0.18em] text-[#fdfbf7]/90">
                  {t.badge}
                </span>
              </div>

              <h1 className="max-w-lg text-4xl font-bold leading-[1.12] tracking-[-0.035em] text-white xl:text-5xl">
                {t.headline}
              </h1>

              <p className="mt-6 max-w-lg text-[15px] leading-7 text-[#fdfbf7]/80">
                {t.description}
              </p>

              {/* Product preview */}
              <div className="mt-10 max-w-md rounded-2xl border border-white/10 bg-[#fdfbf7]/[0.09] p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-[#fdfbf7]/80">
                      {t.previewTitle}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      {t.previewText}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fdfbf7]/10">
                    <Heart className="h-5 w-5 text-white" strokeWidth={1.8} />
                  </div>
                </div>

                {/* Fake emotional indicators */}
                <div className="mt-5 flex gap-2">
                  <div className="h-2 flex-1 rounded-full bg-[#fdfbf7]/30" />
                  <div className="h-2 flex-1 rounded-full bg-[#fdfbf7]/20" />
                  <div className="h-2 flex-1 rounded-full bg-[#fdfbf7]/10" />
                  <div className="h-2 flex-1 rounded-full bg-[#fdfbf7]/10" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 text-[#fdfbf7]/80">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fdfbf7]/10">
                <ShieldCheck
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />
              </div>

              <span className="text-xs">
                {t.privacyTitle}
              </span>
            </div>
          </div>
        </section>

        {/* =========================================================
            RIGHT LOGIN PANEL
        ========================================================== */}
        <section className="flex min-h-screen flex-col bg-[#fdfbf7]">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-5 sm:px-8 lg:px-12">
            {/* Mobile brand */}
            <div className="flex items-center gap-2.5 lg:hidden">
              <Image
                src="/moodify-logo.png"
                alt="Moodify"
                width={40}
                height={40}
                priority
                className="h-10 w-10 object-contain"
              />

              <span className="text-lg font-bold tracking-tight text-[#4a3f35]">
                Moodify
              </span>
            </div>

            {/* Language toggle */}
            <div className="ml-auto">
              <LanguageSwitcher locale={locale} />
            </div>
          </div>

          {/* Form wrapper */}
          <div className="flex flex-1 items-center justify-center px-6 pb-10 sm:px-8 lg:px-12">
            <div className="w-full max-w-md">
              {/* Heading */}
              <div className="mb-8">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#fbc4ab]/35">
                  <LockKeyhole
                    className="h-5 w-5 text-[#5c6b9c]"
                    strokeWidth={1.8}
                  />
                </div>

                <h2 className="text-3xl font-bold tracking-[-0.03em] text-[#4a3f35]">
                  {t.welcome}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#4a3f35]/65">
                  {t.subtitle}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-[#4a3f35]"
                  >
                    {t.email}
                  </label>

                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#4a3f35]/45"
                      strokeWidth={1.8}
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={t.emailPlaceholder}
                      required
                      disabled={isLoading}
                      className="
                        h-12 w-full rounded-xl
                        border border-[#e7ddd5]
                        bg-[#fdfbf7]
                        pl-11 pr-4
                        text-sm text-[#4a3f35]
                        outline-none
                        transition
                        placeholder:text-[#4a3f35]/45
                        hover:border-[#c1d5c0]
                        focus:border-[#e2725b]
                        focus:ring-4
                        focus:ring-[#e2725b]/15
                        disabled:cursor-not-allowed
                        disabled:bg-[#fdfbf7]
                      "
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-[#4a3f35]"
                    >
                      {t.password}
                    </label>

                    <button
                      type="button"
                      disabled
                      className="text-xs font-medium text-[#4a3f35]/45"
                    >
                      {t.forgotPassword}
                    </button>
                  </div>

                  <div className="relative">
                    <LockKeyhole
                      className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#4a3f35]/45"
                      strokeWidth={1.8}
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder={t.passwordPlaceholder}
                      required
                      disabled={isLoading}
                      className="
                        h-12 w-full rounded-xl
                        border border-[#e7ddd5]
                        bg-[#fdfbf7]
                        pl-11 pr-12
                        text-sm text-[#4a3f35]
                        outline-none
                        transition
                        placeholder:text-[#4a3f35]/45
                        hover:border-[#c1d5c0]
                        focus:border-[#e2725b]
                        focus:ring-4
                        focus:ring-[#e2725b]/15
                        disabled:cursor-not-allowed
                        disabled:bg-[#fdfbf7]
                      "
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={isLoading}
                      aria-label={
                        showPassword
                          ? t.hidePassword
                          : t.showPassword
                      }
                      className="
                        absolute right-3 top-1/2
                        flex h-8 w-8
                        -translate-y-1/2
                        items-center justify-center
                        rounded-lg
                        text-[#4a3f35]/45
                        transition
                        hover:bg-[#c1d5c0]/35
                        hover:text-[#4a3f35]/75
                        disabled:pointer-events-none
                      "
                    >
                      {showPassword ? (
                        <EyeOff
                          className="h-[18px] w-[18px]"
                          strokeWidth={1.8}
                        />
                      ) : (
                        <Eye
                          className="h-[18px] w-[18px]"
                          strokeWidth={1.8}
                        />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm leading-5 text-red-600">
                      {error}
                    </p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                    group
                    flex h-12 w-full
                    items-center justify-center gap-2
                    rounded-xl
                    bg-[#e2725b]
                    px-5
                    text-sm font-semibold text-white
                    shadow-sm
                    transition-all duration-200
                    hover:bg-[#4a3f35]
                    hover:shadow-md
                    focus:outline-none
                    focus:ring-4
                    focus:ring-[#e2725b]/20
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <span>
                    {isLoading ? t.loggingIn : t.login}
                  </span>

                  {!isLoading && (
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                      strokeWidth={2}
                    />
                  )}
                </button>
              </form>

              {/* Register */}
              <div className="mt-7 text-center">
                <p className="text-sm text-[#4a3f35]/65">
                  {t.noAccount}{" "}
                  <Link
                    href={`/${locale}/register`}
                    className="font-semibold text-[#5c6b9c] transition hover:text-[#4a3f35]"
                  >
                    {t.register}
                  </Link>
                </p>
              </div>

              {/* Privacy note */}
              <div className="mt-8 border-t border-[#eee6df] pt-6">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#4a3f35]/45"
                    strokeWidth={1.8}
                  />

                  <p className="text-[11px] leading-5 text-[#4a3f35]/45">
                    {t.privacyNote}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}