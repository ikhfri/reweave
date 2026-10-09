"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import {
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  ShieldIcon,
  UserIcon,
} from "@/components/reweave-icons";

import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/i18n/config";

type RegisterClientProps = {
  locale: string;
};

const content = {
  id: {
    eyebrow: "MULAI PERJALANANMU",

    headline: "Kenali dirimu lebih dalam.",

    description:
      "Buat ruang pribadi untuk memahami emosi, mencatat perjalananmu, dan melihat pola yang mungkin selama ini terlewat.",

    statement: "Kamu tidak harus memahami semuanya sekaligus.",

    statementSmall: "Mulai saja dari satu momen yang jujur.",

    privacyTitle: "Ruang pribadimu",

    privacyText:
      "Cerita, check-in, dan refleksi yang kamu simpan tetap terhubung dengan akunmu.",

    welcome: "Buat akun Reweave",

    subtitle: "Mulai perjalanan untuk lebih memahami dirimu.",

    name: "Nama lengkap",

    namePlaceholder: "Masukkan nama kamu",

    nickname: "Nama panggilan",

    nicknamePlaceholder: "Opsional, misalnya Ikhsan",

    nicknameHint:
      "Bebas menggunakan nama yang nyaman untuk digunakan di Reweave.",

    email: "Email",

    emailPlaceholder: "Masukkan email kamu",

    password: "Password",

    passwordPlaceholder: "Minimal 8 karakter",

    passwordRequirement: "Gunakan minimal 8 karakter.",

    validation: {
      emptyName: "Nama tidak boleh kosong.",

      emptyEmail: "Email tidak boleh kosong.",

      invalidEmail: "Format email tidak valid.",

      unsupportedEmail:
        "Gunakan penyedia email umum (contoh: Gmail, Yahoo, Outlook).",

      emptyPassword: "Password tidak boleh kosong.",

      shortPassword: "Password harus memiliki minimal 8 karakter.",
    },

    showPassword: "Tampilkan password",

    hidePassword: "Sembunyikan password",

    register: "Buat akun",

    registering: "Membuat akun...",
    googleRegister: "Daftar dengan Google",
    googleRegistering: "Menghubungkan...",
    orContinueWith: "atau lanjutkan dengan",

    alreadyAccount: "Sudah punya akun?",

    login: "Masuk",

    privacyNote:
      "Dengan membuat akun, kamu menyetujui Terms of Service dan Privacy Policy Reweave.",

    errors: {
      registerFailed: "Gagal membuat akun.",
      googleFailed: "Pendaftaran dengan Google gagal. Silakan coba lagi.",
      googleConflict:
        "Akun Google ini sudah terhubung dengan akun Reweave.",
      general: "Terjadi kesalahan. Silakan coba lagi.",
    },

    features: {
      personal: "Personal",

      private: "Privat",

      thoughtful: "Terjaga",
    },
  },

  en: {
    eyebrow: "START YOUR JOURNEY",

    headline: "Understand yourself better.",

    description:
      "Create a private space to understand your emotions, reflect on your journey, and notice patterns that may otherwise go unnoticed.",

    statement: "You don't have to understand everything at once.",

    statementSmall: "Start with one honest moment.",

    privacyTitle: "Your private space",

    privacyText:
      "Your stories, check-ins, and reflections stay connected to your account.",

    welcome: "Create your Reweave account",

    subtitle: "Start your journey toward understanding yourself better.",

    name: "Full name",

    namePlaceholder: "Enter your name",

    nickname: "Nickname",

    nicknamePlaceholder: "Optional, e.g. Ikhsan",

    nicknameHint:
      "Use any name that feels comfortable for you on Reweave.",

    email: "Email",

    emailPlaceholder: "Enter your email",

    password: "Password",

    passwordPlaceholder: "At least 8 characters",

    passwordRequirement: "Use at least 8 characters.",

    validation: {
      emptyName: "Name cannot be empty.",

      emptyEmail: "Email cannot be empty.",

      invalidEmail: "Invalid email format.",

      unsupportedEmail:
        "Please use a standard email provider (e.g., Gmail, Yahoo, Outlook).",

      emptyPassword: "Password cannot be empty.",

      shortPassword: "Password must contain at least 8 characters.",
    },

    showPassword: "Show password",

    hidePassword: "Hide password",

    register: "Create account",

    registering: "Creating account...",
    googleRegister: "Continue with Google",
    googleRegistering: "Connecting...",
    orContinueWith: "or continue with",

    alreadyAccount: "Already have an account?",

    login: "Sign in",

    privacyNote:
      "By creating an account, you agree to Reweave's Terms of Service and Privacy Policy.",

    errors: {
      registerFailed: "Failed to create your account.",
      googleFailed: "Google sign-up failed. Please try again.",
      googleConflict:
        "This Google account is already connected to a Reweave account.",
      general: "Something went wrong. Please try again.",
    },

    features: {
      personal: "Personal",

      private: "Private",

      thoughtful: "Thoughtful",
    },
  },
};

export default function RegisterClient({
  locale: localeParam,
}: RegisterClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const locale: Locale = localeParam === "en" ? "en" : "id";

  const t = content[locale];

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [error, setError] = useState("");

  const [errorField, setErrorField] = useState("");

  const googleError = searchParams.get("error");

  const googleErrorMessage =
    googleError === "google_account_conflict"
      ? t.errors.googleConflict
      : googleError === "google_auth_failed" ||
          googleError === "google_config"
        ? t.errors.googleFailed
        : "";

  const displayedError = error || googleErrorMessage;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setErrorField("");

    const trimmedName = name.trim();
    const trimmedNickname = nickname.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setError(t.validation.emptyName);
      setErrorField("name");
      return;
    }

    if (!normalizedEmail) {
      setError(t.validation.emptyEmail);
      setErrorField("email");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError(t.validation.invalidEmail);
      setErrorField("email");
      return;
    }



    const domain = normalizedEmail.split("@")[1]?.toLowerCase();

    const allowedDomains = [
      "gmail.com",
      "yahoo.com",
      "yahoo.co.id",
      "outlook.com",
      "hotmail.com",
      "icloud.com",
    ];

    if (!domain || !allowedDomains.includes(domain)) {
      setError(t.validation.unsupportedEmail);
      setErrorField("email");
      return;
    }

    if (!password) {
      setError(t.validation.emptyPassword);
      setErrorField("password");
      return;
    }

    if (password.length < 8) {
      setError(t.validation.shortPassword);
      setErrorField("password");
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
          name: trimmedName,

          nickname: trimmedNickname || "",

          email: normalizedEmail,

          password,
        }),
      });

      const data = await response.json();



      if (!response.ok) {

        if (data.errors?.fieldErrors) {
          const fieldErrors = data.errors.fieldErrors;

          const firstKey = Object.keys(fieldErrors)[0];

          const firstErrorField = fieldErrors[
            firstKey
          ] as string[] | undefined;

          if (firstErrorField && firstErrorField.length > 0) {
            setError(firstErrorField[0]);
            setErrorField(firstKey);
            return;
          }
        }

        setError(data.message || t.errors.registerFailed);
        setErrorField("general");

        return;
      }

      if (!data.user?.id) {
        setError(t.errors.general);
        setErrorField("general");
        return;
      }

      router.push(
        `/${locale}/verify-email?userId=${encodeURIComponent(
          data.user.id
        )}`
      );

      router.refresh();
    } catch (error) {
      console.error("REGISTER_PAGE_ERROR", error);

      setError(t.errors.general);
      setErrorField("general");
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

          <div className="absolute -left-32 -top-32 h-90 w-90 rounded-full bg-[#FBC4AB]/20" />

          <div className="absolute -bottom-40 -right-32 h-125 w-125 rounded-full bg-[#C1D5C0]/25" />

          <div className="absolute right-[18%] top-[34%] h-20 w-20 rounded-full border border-[#5C6B9C]/10" />

          {/* ===================================================
              CONTENT
          ==================================================== */}

          <div className="relative z-10 flex min-h-screen flex-col justify-between p-12 xl:p-16">
            {/* =================================================
                BRAND
            ================================================== */}

            <Link
              href={`/${locale}`}
              className="inline-flex w-fit"
              aria-label="Reweave"
            >
              <Image
                src="/reweave-logo.webp"
                alt="Reweave"
                width={180}
                height={55}
                priority
                className="h-16 w-auto object-contain"
              />
            </Link>

            {/* =================================================
                CENTER
            ================================================== */}

            <div className="max-w-130">
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

              {/* =================================================
                  SMALL FEATURE ROW
              ================================================== */}

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <BrandPoint
                  icon={<UserIcon className="h-4 w-4" />}
                  text={t.features.personal}
                />

                <BrandPoint
                  icon={<LockIcon className="h-4 w-4" />}
                  text={t.features.private}
                />

                <BrandPoint
                  icon={<ShieldIcon className="h-4 w-4" />}
                  text={t.features.thoughtful}
                />
              </div>
            </div>

            {/* =================================================
                BOTTOM PRIVACY
            ================================================== */}

            <div className="flex max-w-md items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C1D5C0]/35">
                <ShieldIcon className="h-4 w-4 text-[#5C6B9C]" />
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
              aria-label="Reweave"
            >
              <Image
                src="/reweave-logo.webp"
                alt="Reweave"
                width={150}
                height={45}
                priority
                className="h-9 w-auto object-contain"
              />
            </Link>

            {/* LANGUAGE */}

            <div className="ml-auto">
              <LanguageSwitcher locale={locale === "en" ? "en" : "id"} />
            </div>
          </header>

          {/* ===================================================
              FORM WRAPPER
          ==================================================== */}

          <div className="flex flex-1 items-center justify-center px-5 pb-12 pt-4 sm:px-8 lg:px-12">
            <div className="w-full max-w-107.5">
              {/* =================================================
                  HEADER
              ================================================== */}

              <div className="mb-8">
                {/* ICON */}

                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FBC4AB]/30">
                  <UserIcon className="h-4.5 w-4.5 text-[#5C6B9C]" />
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
                noValidate
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
                    <UserIcon
                      className="pointer-events-none absolute left-4 top-1/2 h-4.25 w-4.25 -translate-y-1/2 text-[#4A3F35]/30"
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      placeholder={t.namePlaceholder}
                      required
                      disabled={isLoading || isGoogleLoading}
                      className={`h-13 w-full rounded-2xl border bg-[#FDFBF7] pl-11 pr-4 text-sm text-[#4A3F35] outline-none transition placeholder:text-[#4A3F35]/30 focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
                        errorField === "name"
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
                          : "border-[#4A3F35]/10 hover:border-[#C1D5C0] focus:border-[#E2725B] focus:ring-[#E2725B]/10"
                      }`}
                    />
                  </div>
                </div>

                {/* =================================================
                    NICKNAME
                ================================================== */}

                <div>
                  <label
                    htmlFor="nickname"
                    className="mb-2 block text-xs font-semibold text-[#4A3F35]/75"
                  >
                    {t.nickname}
                  </label>

                  <div className="relative">
                    <UserIcon
                      className="pointer-events-none absolute left-4 top-1/2 h-4.25 w-4.25 -translate-y-1/2 text-[#4A3F35]/30"
                    />

                    <input
                      id="nickname"
                      name="nickname"
                      type="text"
                      autoComplete="nickname"
                      value={nickname}
                      onChange={(event) =>
                        setNickname(event.target.value)
                      }
                      placeholder={t.nicknamePlaceholder}
                      maxLength={50}
                      disabled={isLoading || isGoogleLoading}
                      className={`h-13 w-full rounded-2xl border bg-[#FDFBF7] pl-11 pr-4 text-sm text-[#4A3F35] outline-none transition placeholder:text-[#4A3F35]/30 focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
                        errorField === "nickname"
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
                          : "border-[#4A3F35]/10 hover:border-[#C1D5C0] focus:border-[#E2725B] focus:ring-[#E2725B]/10"
                      }`}
                    />
                  </div>

                  <p className="mt-2 text-[11px] leading-4 text-[#4A3F35]/35">
                    {t.nicknameHint}
                  </p>
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
                    <MailIcon
                      className="pointer-events-none absolute left-4 top-1/2 h-4.25 w-4.25 -translate-y-1/2 text-[#4A3F35]/30"
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
                      disabled={isLoading || isGoogleLoading}
                      className={`h-13 w-full rounded-2xl border bg-[#FDFBF7] pl-11 pr-4 text-sm text-[#4A3F35] outline-none transition placeholder:text-[#4A3F35]/30 focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
                        errorField === "email"
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
                          : "border-[#4A3F35]/10 hover:border-[#C1D5C0] focus:border-[#E2725B] focus:ring-[#E2725B]/10"
                      }`}
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
                    <LockIcon
                      className="pointer-events-none absolute left-4 top-1/2 h-4.25 w-4.25 -translate-y-1/2 text-[#4A3F35]/30"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder={t.passwordPlaceholder}
                      required
                      minLength={8}
                      disabled={isLoading || isGoogleLoading}
                      className={`h-13 w-full rounded-2xl border bg-[#FDFBF7] pl-11 pr-12 text-sm text-[#4A3F35] outline-none transition placeholder:text-[#4A3F35]/30 focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
                        errorField === "password"
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
                          : "border-[#4A3F35]/10 hover:border-[#C1D5C0] focus:border-[#E2725B] focus:ring-[#E2725B]/10"
                      }`}
                    />

                    {/* =================================================
                        PASSWORD TOGGLE
                    ================================================== */}

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) => !previous
                        )
                      }
                      disabled={isLoading || isGoogleLoading}
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
                        <EyeOffIcon className="h-4.25 w-4.25" />
                      ) : (
                        <EyeIcon className="h-4.25 w-4.25" />
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

                {displayedError && (
                  <div
                    role="alert"
                    className="rounded-2xl border border-[#E2725B]/30 bg-[#E2725B]/10 px-4 py-3"
                  >
                    <p className="text-xs leading-5 text-[#C95F4B]">
                      {displayedError}
                    </p>
                  </div>
                )}

                {/* =================================================
                    SUBMIT
                ================================================== */}

                <button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="
                    group
                    flex
                    h-13
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
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  )}
                </button>
              </form>

              {/* =================================================
                  GOOGLE OAUTH
              ================================================== */}

              <div className="mt-5">
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-x-0 h-px bg-[#4A3F35]/[0.07]" />
                  <span className="relative bg-white px-3 text-[10px] font-medium uppercase tracking-[0.12em] text-[#4A3F35]/30">
                    {t.orContinueWith}
                  </span>
                </div>

                <a
                  href={`/api/auth/google?locale=${locale}`}
                  onClick={(event) => {
                    if (isLoading || isGoogleLoading) {
                      event.preventDefault();
                      return;
                    }

                    setError("");
                    setErrorField("");
                    setIsGoogleLoading(true);
                  }}
                  aria-disabled={isLoading || isGoogleLoading}
                  className="
                    mt-5
                    flex
                    h-13
                    w-full
                    items-center
                    justify-center
                    gap-3
                    rounded-2xl
                    border
                    border-[#4A3F35]/10
                    bg-white
                    px-5
                    text-sm
                    font-semibold
                    text-[#4A3F35]
                    shadow-[0_1px_2px_rgba(74,63,53,0.03)]
                    transition
                    hover:border-[#C1D5C0]
                    hover:bg-[#FDFBF7]
                    active:scale-[0.995]
                    focus:outline-none
                    focus:ring-4
                    focus:ring-[#5C6B9C]/10
                    aria-disabled:pointer-events-none
                    aria-disabled:opacity-60
                  "
                >
                  {isGoogleLoading ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="h-4 w-4 animate-spin rounded-full border-2 border-[#4A3F35]/15 border-t-[#5C6B9C]"
                      />
                      <span>{t.googleRegistering}</span>
                    </>
                  ) : (
                    <>
                      <span
                        aria-hidden="true"
                        className="grid size-5 place-items-center"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="size-5"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M21.8 12.23c0-.79-.07-1.55-.2-2.27H12v4.3h5.5a4.7 4.7 0 0 1-2.04 3.09v2.57h3.3c1.93-1.78 3.04-4.4 3.04-7.69Z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 22c2.76 0 5.08-.91 6.77-2.46l-3.3-2.57c-.91.61-2.07.97-3.47.97-2.67 0-4.93-1.8-5.74-4.22H2.85v2.65A10.22 10.22 0 0 0 12 22Z"
                            fill="#34A853"
                          />
                          <path
                            d="M6.26 13.72A6.14 6.14 0 0 1 5.94 12c0-.6.11-1.18.32-1.72V7.63H2.85A10 10 0 0 0 2 12c0 1.61.38 3.13 1.05 4.37l3.21-2.65Z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 6.06c1.5 0 2.84.52 3.9 1.54l2.92-2.92C17.08 3.08 14.76 2 12 2a10.22 10.22 0 0 0-9.15 5.63l3.21 2.65C6.93 7.86 9.2 6.06 12 6.06Z"
                            fill="#EA4335"
                          />
                        </svg>
                      </span>

                      <span>{t.googleRegister}</span>
                    </>
                  )}
                </a>
              </div>

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
                  <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#5C6B9C]/60" />

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
                    ? "Back to Reweave"
                    : "Kembali ke Reweave"}
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
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#5C6B9C]/6 text-[#5C6B9C]">
        {icon}
      </div>

      <span className="text-[10px] font-medium">
        {text}
      </span>
    </div>
  );
}