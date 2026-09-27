"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/i18n/config";

const content = {
  id: {
    badge: "MULAI PERJALANANMU",

    headline: "Kenali dirimu lebih dalam.",
    description:
      "Bangun ruang pribadi untuk memahami emosi, mencatat perjalananmu, dan menemukan pola yang mungkin selama ini terlewat.",

    features: [
      "Catat dan pahami emosimu setiap hari",
      "Temukan pola emosional dari waktu ke waktu",
      "Dapatkan insight dan aktivitas yang lebih personal",
    ],

    privacyTitle: "Privasi adalah prioritas",
    privacyText:
      "Data emosionalmu disimpan dengan aman dan digunakan untuk memberikan pengalaman yang lebih personal.",

    welcome: "Buat akun Moodify",
    subtitle:
      "Mulai perjalanan untuk lebih memahami dirimu.",

    name: "Nama",
    namePlaceholder: "Masukkan nama kamu",

    email: "Email",
    emailPlaceholder: "Masukkan email kamu",

    password: "Password",
    passwordPlaceholder: "Minimal 8 karakter",

    passwordRequirement: "Password minimal 8 karakter",

    showPassword: "Tampilkan password",
    hidePassword: "Sembunyikan password",

    register: "Buat akun",
    registering: "Membuat akun...",

    alreadyAccount: "Sudah punya akun?",
    login: "Masuk",

    privacyNote:
      "Dengan membuat akun, kamu menyetujui Terms of Service dan Privacy Policy Moodify.",

    errors: {
      registerFailed: "Gagal membuat akun.",
      general: "Terjadi kesalahan. Silakan coba lagi.",
    },
  },

  en: {
    badge: "START YOUR JOURNEY",

    headline: "Understand yourself better.",
    description:
      "Create a private space to understand your emotions, reflect on your journey, and discover patterns that may otherwise go unnoticed.",

    features: [
      "Track and understand your emotions every day",
      "Discover emotional patterns over time",
      "Get more personalized insights and activities",
    ],

    privacyTitle: "Your privacy matters",
    privacyText:
      "Your emotional data is stored securely and used to provide a more personalized experience.",

    welcome: "Create your Moodify account",
    subtitle:
      "Start your journey toward understanding yourself better.",

    name: "Name",
    namePlaceholder: "Enter your name",

    email: "Email",
    emailPlaceholder: "Enter your email",

    password: "Password",
    passwordPlaceholder: "At least 8 characters",

    passwordRequirement: "Password must be at least 8 characters",

    showPassword: "Show password",
    hidePassword: "Hide password",

    register: "Create account",
    registering: "Creating account...",

    alreadyAccount: "Already have an account?",
    login: "Sign in",

    privacyNote:
      "By creating an account, you agree to Moodify's Terms of Service and Privacy Policy.",

    errors: {
      registerFailed: "Failed to create your account.",
      general: "Something went wrong. Please try again.",
    },
  },
};

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();

  const localeParam = params.locale;
  const locale: Locale = localeParam === "en" ? "en" : "id";

  const t = content[locale];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (password.length < 8) {
      setError(t.passwordRequirement);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || t.errors.registerFailed);
        return;
      }

      router.push(`/${locale}/onboarding`);
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

          <div className="absolute right-20 top-24 h-24 w-24 rounded-full border border-[#fdfbf7]/15" />

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
              <div className="mb-7 inline-flex items-center rounded-full border border-[#fdfbf7]/15 bg-[#fdfbf7]/[0.08] px-4 py-2">
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

              {/* Features */}
              <div className="mt-9 max-w-md space-y-3">
                {t.features.map((feature) => (
                  <FeatureItem key={feature} text={feature} />
                ))}
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
            RIGHT REGISTER PANEL
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
                  <UserRound
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
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-[#4a3f35]"
                  >
                    {t.name}
                  </label>

                  <div className="relative">
                    <UserRound
                      className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#4a3f35]/45"
                      strokeWidth={1.8}
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={t.namePlaceholder}
                      required
                      disabled={isLoading}
                      className="
                        h-12 w-full rounded-xl
                        border border-[#4a3f35]/15
                        bg-[#fdfbf7]
                        pl-11 pr-4
                        text-sm text-[#4a3f35]
                        outline-none
                        transition
                        placeholder:text-[#4a3f35]/45
                        hover:border-[#4a3f35]/30
                        focus:border-[#e2725b]
                        focus:ring-4
                        focus:ring-[#e2725b]/10
                        disabled:cursor-not-allowed
                        disabled:bg-[#fdfbf7]
                      "
                    />
                  </div>
                </div>

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
                        border border-[#4a3f35]/15
                        bg-[#fdfbf7]
                        pl-11 pr-4
                        text-sm text-[#4a3f35]
                        outline-none
                        transition
                        placeholder:text-[#4a3f35]/45
                        hover:border-[#4a3f35]/30
                        focus:border-[#e2725b]
                        focus:ring-4
                        focus:ring-[#e2725b]/10
                        disabled:cursor-not-allowed
                        disabled:bg-[#fdfbf7]
                      "
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-[#4a3f35]"
                  >
                    {t.password}
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#4a3f35]/45"
                      strokeWidth={1.8}
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder={t.passwordPlaceholder}
                      required
                      minLength={8}
                      disabled={isLoading}
                      className="
                        h-12 w-full rounded-xl
                        border border-[#4a3f35]/15
                        bg-[#fdfbf7]
                        pl-11 pr-12
                        text-sm text-[#4a3f35]
                        outline-none
                        transition
                        placeholder:text-[#4a3f35]/45
                        hover:border-[#4a3f35]/30
                        focus:border-[#e2725b]
                        focus:ring-4
                        focus:ring-[#e2725b]/10
                        disabled:cursor-not-allowed
                        disabled:bg-[#fdfbf7]
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
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

                  <p className="mt-2 text-xs text-[#4a3f35]/45">
                    {t.passwordRequirement}
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-[#e2725b]/30 bg-[#e2725b]/10 px-4 py-3">
                    <p className="text-sm leading-5 text-[#c95f4b]">
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
                    hover:bg-[#c95f4b]
                    hover:shadow-md
                    focus:outline-none
                    focus:ring-4
                    focus:ring-[#e2725b]/20
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <span>
                    {isLoading ? t.registering : t.register}
                  </span>

                  {!isLoading && (
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                      strokeWidth={2}
                    />
                  )}
                </button>
              </form>

              {/* Login */}
              <div className="mt-7 text-center">
                <p className="text-sm text-[#4a3f35]/65">
                  {t.alreadyAccount}{" "}
                  <Link
                    href={`/${locale}/login`}
                    className="font-semibold text-[#5c6b9c] transition hover:text-[#4a3f35]"
                  >
                    {t.login}
                  </Link>
                </p>
              </div>

              {/* Privacy note */}
              <div className="mt-8 border-t border-[#4a3f35]/10 pt-6">
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

/* =========================================================
   FEATURE ITEM
========================================================= */

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#fdfbf7]/15 bg-[#fdfbf7]/[0.07] px-4 py-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#fdfbf7]/10">
        <Check
          className="h-3.5 w-3.5 text-[#fdfbf7]/80"
          strokeWidth={2.2}
        />
      </div>

      <span className="text-sm leading-5 text-[#fdfbf7]/90">
        {text}
      </span>
    </div>
  );
}