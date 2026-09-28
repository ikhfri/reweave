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
  UserRound,
} from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/i18n/config";

const content = {
  id: {
    eyebrow: "MULAI PERJALANANMU",

    headline: "Kenali dirimu lebih dalam.",

    description:
      "Buat ruang pribadi untuk memahami emosi, mencatat perjalananmu, dan melihat pola yang mungkin selama ini terlewat.",

    statement:
      "Kamu tidak harus memahami semuanya sekaligus.",

    statementSmall:
      "Mulai saja dari satu momen yang jujur.",

    privacyTitle: "Ruang pribadimu",

    privacyText:
      "Cerita, check-in, dan refleksi yang kamu simpan tetap terhubung dengan akunmu.",

    welcome: "Buat akun Moodify",

    subtitle:
      "Mulai perjalanan untuk lebih memahami dirimu.",

    name: "Nama",

    namePlaceholder:
      "Masukkan nama kamu",

    email: "Email",

    emailPlaceholder:
      "Masukkan email kamu",

    password: "Password",

    passwordPlaceholder:
      "Minimal 8 karakter",

    passwordRequirement:
      "Gunakan minimal 8 karakter.",

    showPassword:
      "Tampilkan password",

    hidePassword:
      "Sembunyikan password",

    register: "Buat akun",

    registering:
      "Membuat akun...",

    alreadyAccount:
      "Sudah punya akun?",

    login: "Masuk",

    privacyNote:
      "Dengan membuat akun, kamu menyetujui Terms of Service dan Privacy Policy Moodify.",

    errors: {
      registerFailed:
        "Gagal membuat akun.",

      general:
        "Terjadi kesalahan. Silakan coba lagi.",
    },
  },

  en: {
    eyebrow: "START YOUR JOURNEY",

    headline: "Understand yourself better.",

    description:
      "Create a private space to understand your emotions, reflect on your journey, and notice patterns that may otherwise go unnoticed.",

    statement:
      "You don't have to understand everything at once.",

    statementSmall:
      "Start with one honest moment.",

    privacyTitle:
      "Your private space",

    privacyText:
      "Your stories, check-ins, and reflections stay connected to your account.",

    welcome:
      "Create your Moodify account",

    subtitle:
      "Start your journey toward understanding yourself better.",

    name: "Name",

    namePlaceholder:
      "Enter your name",

    email: "Email",

    emailPlaceholder:
      "Enter your email",

    password: "Password",

    passwordPlaceholder:
      "At least 8 characters",

    passwordRequirement:
      "Use at least 8 characters.",

    showPassword:
      "Show password",

    hidePassword:
      "Hide password",

    register:
      "Create account",

    registering:
      "Creating account...",

    alreadyAccount:
      "Already have an account?",

    login:
      "Sign in",

    privacyNote:
      "By creating an account, you agree to Moodify's Terms of Service and Privacy Policy.",

    errors: {
      registerFailed:
        "Failed to create your account.",

      general:
        "Something went wrong. Please try again.",
    },
  },
};

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();

  const localeParam = params.locale;

  const locale: Locale =
    localeParam === "en" ? "en" : "id";

  const t = content[locale];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (password.length < 8) {
      setError(t.passwordRequirement);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            t.errors.registerFailed,
        );

        return;
      }

      router.push(
        `/${locale}/onboarding`,
      );

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
          {/* ===================================================
              SUBTLE BRAND SHAPES
          ==================================================== */}

          <div className="absolute -left-32 -top-32 h-[360px] w-[360px] rounded-full bg-[#FBC4AB]/20" />

          <div className="absolute -bottom-40 -right-32 h-[500px] w-[500px] rounded-full bg-[#C1D5C0]/25" />

          <div className="absolute right-[18%] top-[34%] h-20 w-20 rounded-full border border-[#5C6B9C]/10" />

          {/* ===================================================
              CONTENT
          ==================================================== */}

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

            {/* CENTER */}

            <div className="max-w-[520px]">
              {/* EYEBROW */}

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5C6B9C]">
                {t.eyebrow}
              </p>

              {/* HEADLINE */}

              <h1 className="mt-5 max-w-lg text-[48px] font-semibold leading-[1.04] tracking-[-0.055em] text-[#4A3F35] xl:text-[60px]">
                {t.headline}
              </h1>

              {/* DESCRIPTION */}

              <p className="mt-6 max-w-md text-[15px] leading-7 text-[#4A3F35]/55">
                {t.description}
              </p>

              {/* BRAND STATEMENT */}

              <div className="mt-10 flex max-w-md items-start gap-4 border-l-2 border-[#E2725B]/40 pl-5">
                <div>
                  <p className="text-sm font-medium leading-6 text-[#4A3F35]/75">
                    {t.statement}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#4A3F35]/40">
                    {t.statementSmall}
                  </p>
                </div>
              </div>

              {/* SMALL FEATURE ROW */}

              <div className="mt-10 flex items-center gap-3">
                <BrandPoint
                  icon={
                    <UserRound
                      className="h-4 w-4"
                      strokeWidth={1.8}
                    />
                  }
                  text={
                    locale === "en"
                      ? "Personal"
                      : "Personal"
                  }
                />

                <BrandPoint
                  icon={
                    <LockKeyhole
                      className="h-4 w-4"
                      strokeWidth={1.8}
                    />
                  }
                  text={
                    locale === "en"
                      ? "Private"
                      : "Privat"
                  }
                />

                <BrandPoint
                  icon={
                    <ShieldCheck
                      className="h-4 w-4"
                      strokeWidth={1.8}
                    />
                  }
                  text={
                    locale === "en"
                      ? "Thoughtful"
                      : "Terjaga"
                  }
                />
              </div>
            </div>

            {/* BOTTOM PRIVACY */}

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
            RIGHT REGISTER AREA
        ====================================================== */}

        <section className="relative flex min-h-screen flex-col bg-white">
          {/* ===================================================
              TOP BAR
          ==================================================== */}

          <header className="flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
            {/* MOBILE LOGO */}

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
                className="h-9 w-auto object-contain"
              />
            </Link>

            {/* LANGUAGE */}

            <div className="ml-auto">
              <LanguageSwitcher
                locale={locale}
              />
            </div>
          </header>

          {/* ===================================================
              FORM WRAPPER
          ==================================================== */}

          <div className="flex flex-1 items-center justify-center px-5 pb-12 pt-4 sm:px-8 lg:px-12">
            <div className="w-full max-w-[430px]">
              {/* =================================================
                  HEADER
              ================================================== */}

              <div className="mb-9">
                {/* ICON */}

                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FBC4AB]/30">
                  <UserRound
                    className="h-[18px] w-[18px] text-[#5C6B9C]"
                    strokeWidth={1.8}
                  />
                </div>

                {/* TITLE */}

                <h2 className="text-[32px] font-semibold tracking-[-0.045em] text-[#4A3F35]">
                  {t.welcome}
                </h2>

                {/* DESCRIPTION */}

                <p className="mt-3 text-sm leading-6 text-[#4A3F35]/50">
                  {t.subtitle}
                </p>
              </div>

              {/* =================================================
                  FORM
              ================================================== */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* =================================================
                    NAME
                ================================================== */}

                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-xs font-semibold text-[#4A3F35]/75"
                  >
                    {t.name}
                  </label>

                  <div className="relative">
                    <UserRound
                      className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#4A3F35]/30"
                      strokeWidth={1.8}
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(event) =>
                        setName(
                          event.target.value,
                        )
                      }
                      placeholder={
                        t.namePlaceholder
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

                {/* =================================================
                    EMAIL
                ================================================== */}

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
                        setEmail(
                          event.target.value,
                        )
                      }
                      placeholder={
                        t.emailPlaceholder
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

                {/* =================================================
                    PASSWORD
                ================================================== */}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-xs font-semibold text-[#4A3F35]/75"
                  >
                    {t.password}
                  </label>

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
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value,
                        )
                      }
                      placeholder={
                        t.passwordPlaceholder
                      }
                      required
                      minLength={8}
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

                    {/* PASSWORD TOGGLE */}

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) =>
                            !previous,
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

                  {/* PASSWORD HELP */}

                  <p className="mt-2 text-[11px] text-[#4A3F35]/35">
                    {t.passwordRequirement}
                  </p>
                </div>

                {/* =================================================
                    ERROR
                ================================================== */}

                {error && (
                  <div className="rounded-2xl border border-[#E2725B]/30 bg-[#E2725B]/10 px-4 py-3">
                    <p className="text-xs leading-5 text-[#C95F4B]">
                      {error}
                    </p>
                  </div>
                )}

                {/* =================================================
                    SUBMIT
                ================================================== */}

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
                      ? t.registering
                      : t.register}
                  </span>

                  {!isLoading && (
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                      strokeWidth={1.8}
                    />
                  )}
                </button>
              </form>

              {/* =================================================
                  LOGIN
              ================================================== */}

              <div className="mt-8 flex items-center justify-center gap-1.5 text-sm">
                <span className="text-[#4A3F35]/45">
                  {t.alreadyAccount}
                </span>

                <Link
                  href={`/${locale}/login`}
                  className="font-semibold text-[#5C6B9C] transition hover:text-[#E2725B]"
                >
                  {t.login}
                </Link>
              </div>

              {/* =================================================
                  PRIVACY
              ================================================== */}

              <div className="mt-9 border-t border-[#4A3F35]/[0.07] pt-6">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#5C6B9C]/60"
                    strokeWidth={1.8}
                  />

                  <p className="text-[10px] leading-5 text-[#4A3F35]/35">
                    {t.privacyNote}
                  </p>
                </div>
              </div>

              {/* =================================================
                  MOBILE BACK
              ================================================== */}

              <div className="mt-8 flex justify-center lg:hidden">
                <Link
                  href={`/${locale}`}
                  className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#4A3F35]/30 transition hover:text-[#5C6B9C]"
                >
                  {locale === "en"
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

/* ===============================================================
   BRAND POINT
================================================================ */

function BrandPoint({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[#4A3F35]/45">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#5C6B9C]/[0.06] text-[#5C6B9C]">
        {icon}
      </div>

      <span className="text-[10px] font-medium">
        {text}
      </span>
    </div>
  );
}