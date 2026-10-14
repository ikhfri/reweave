"use client";

import Image from "next/image";

import Link from "next/link";

import { useRouter, useSearchParams } from "next/navigation";

import { type FormEvent, useState } from "react";
import type React from "react";

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
    aiConsentTitle: "Persetujuan penggunaan AI",
    aiConsentText:
      "Saya memahami bahwa Moodify dapat memproses emosi, check-in, dan catatan diary yang saya pilih untuk dianalisis AI guna memberikan insight dan rekomendasi. Hasil AI bukan diagnosis profesional dan dapat keliru.",
    aiConsentCheckbox:
      "Saya menyetujui pemrosesan data yang saya berikan oleh fitur AI Moodify.",
    privacyConsentText: "Saya telah membaca dan menyetujui Kebijakan Privasi.",
    consentRequired:
      "Setujui penggunaan AI dan kebijakan privasi untuk membuat akun.",

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
      "Persetujuan AI dan kebijakan privasi harus diberikan secara eksplisit saat mendaftar.",

    errors: {
      registerFailed: "Gagal membuat akun.",

      googleFailed: "Pendaftaran dengan Google gagal. Silakan coba lagi.",

      googleConflict: "Akun Google ini sudah terhubung dengan akun Reweave.",

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

    nicknameHint: "Use any name that feels comfortable for you on Reweave.",

    email: "Email",

    emailPlaceholder: "Enter your email",

    password: "Password",

    passwordPlaceholder: "At least 8 characters",

    passwordRequirement: "Use at least 8 characters.",
    aiConsentTitle: "AI usage agreement",
    aiConsentText:
      "I understand that Moodify may process the emotions, check-ins, and diary entries I choose to analyze with AI to provide insights and recommendations. AI results are not a professional diagnosis and may be inaccurate.",
    aiConsentCheckbox:
      "I agree to the processing of data I provide by Moodify AI features.",
    privacyConsentText: "I have read and agree to the Privacy Policy.",
    consentRequired:
      "Agree to AI usage and the Privacy Policy to create an account.",

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
      "Explicit consent to AI usage and the Privacy Policy is required to register.",

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
  const [aiConsent, setAiConsent] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [activeAgreement, setActiveAgreement] = useState<
    "ai" | "privacy" | null
  >(null);

  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [error, setError] = useState("");

  const [errorField, setErrorField] = useState("");

  const googleError = searchParams.get("error");

  const googleErrorMessage =
    googleError === "google_account_conflict"
      ? t.errors.googleConflict
      : googleError === "google_auth_failed" || googleError === "google_config"
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

    if (!aiConsent || !privacyConsent) {
      setError(t.consentRequired);
      setErrorField("consent");
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
          aiConsent,
          privacyConsent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors?.fieldErrors) {
          const fieldErrors = data.errors.fieldErrors;

          const firstKey = Object.keys(fieldErrors)[0];

          const firstErrorField = fieldErrors[firstKey] as string[] | undefined;

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
        `/${locale}/verify-email?userId=${encodeURIComponent(data.user.id)}`,
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
        <section className="relative hidden min-h-screen overflow-hidden bg-[#FDFBF7] lg:block">
          <div className="absolute -left-32 -top-32 h-90 w-90 rounded-full bg-[#FBC4AB]/20" />

          <div className="absolute -bottom-40 -right-32 h-125 w-125 rounded-full bg-[#C1D5C0]/25" />

          <div className="absolute right-[18%] top-[34%] h-20 w-20 rounded-full border border-[#5C6B9C]/10" />

          <div className="relative z-10 flex min-h-screen flex-col justify-between p-12 xl:p-16">
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

            <div className="max-w-130">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5C6B9C]">
                {t.eyebrow}
              </p>

              <h1 className="mt-5 max-w-lg text-[48px] font-semibold leading-[1.04] tracking-[-0.055em] text-[#4A3F35] xl:text-[60px]">
                {t.headline}
              </h1>

              <p className="mt-6 max-w-md text-[15px] leading-7 text-[#4A3F35]/55">
                {t.description}
              </p>

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

        <section className="relative flex min-h-screen flex-col bg-white">
          <header className="flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
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

            <div className="ml-auto">
              <LanguageSwitcher locale={locale === "en" ? "en" : "id"} />
            </div>
          </header>

          <div className="flex flex-1 items-center justify-center px-5 pb-12 pt-4 sm:px-8 lg:px-12">
            <div className="w-full max-w-107.5">
              <div className="mb-8">
                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FBC4AB]/30">
                  <UserIcon className="h-4.5 w-4.5 text-[#5C6B9C]" />
                </div>

                <h2 className="text-[32px] font-semibold tracking-[-0.045em] text-[#4A3F35]">
                  {t.welcome}
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#4A3F35]/50">
                  {t.subtitle}
                </p>
              </div>

              <form
                onSubmit={handleSubmit}

                className="space-y-5"

                noValidate
              >
                <div>
                  <label
                    htmlFor="name"

                    className="mb-2 block text-xs font-semibold text-[#4A3F35]/75"
                  >
                    {t.name}
                  </label>

                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-4 top-1/2 h-4.25 w-4.25 -translate-y-1/2 text-[#4A3F35]/30" />

                    <input
                      id="name"

                      name="name"

                      type="text"

                      autoComplete="name"

                      value={name}

                      onChange={(event) => setName(event.target.value)}

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

                <div>
                  <label
                    htmlFor="nickname"

                    className="mb-2 block text-xs font-semibold text-[#4A3F35]/75"
                  >
                    {t.nickname}
                  </label>

                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-4 top-1/2 h-4.25 w-4.25 -translate-y-1/2 text-[#4A3F35]/30" />

                    <input
                      id="nickname"

                      name="nickname"

                      type="text"

                      autoComplete="nickname"

                      value={nickname}

                      onChange={(event) => setNickname(event.target.value)}

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

                <div>
                  <label
                    htmlFor="email"

                    className="mb-2 block text-xs font-semibold text-[#4A3F35]/75"
                  >
                    {t.email}
                  </label>

                  <div className="relative">
                    <MailIcon className="pointer-events-none absolute left-4 top-1/2 h-4.25 w-4.25 -translate-y-1/2 text-[#4A3F35]/30" />

                    <input
                      id="email"

                      name="email"

                      type="email"

                      autoComplete="email"

                      value={email}

                      onChange={(event) => setEmail(event.target.value)}

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

                <div>
                  <label
                    htmlFor="password"

                    className="mb-2 block text-xs font-semibold text-[#4A3F35]/75"
                  >
                    {t.password}
                  </label>

                  <div className="relative">
                    <LockIcon className="pointer-events-none absolute left-4 top-1/2 h-4.25 w-4.25 -translate-y-1/2 text-[#4A3F35]/30" />

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

                      disabled={isLoading || isGoogleLoading}

                      className={`h-13 w-full rounded-2xl border bg-[#FDFBF7] pl-11 pr-12 text-sm text-[#4A3F35] outline-none transition placeholder:text-[#4A3F35]/30 focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
                        errorField === "password"
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
                          : "border-[#4A3F35]/10 hover:border-[#C1D5C0] focus:border-[#E2725B] focus:ring-[#E2725B]/10"
                      }`}
                    />

                    <button
                      type="button"

                      onClick={() => setShowPassword((previous) => !previous)}

                      disabled={isLoading || isGoogleLoading}

                      aria-label={
                        showPassword ? t.hidePassword : t.showPassword
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

                  <p className="mt-2 text-[11px] text-[#4A3F35]/35">
                    {t.passwordRequirement}
                  </p>
                </div>

                <section
                  aria-labelledby="consent-heading"
                  className="space-y-4 rounded-2xl border border-[#C1D5C0]/70 bg-[#FDFBF7] p-4"
                >
                  <div>
                    <h3
                      id="consent-heading"
                      className="text-sm font-semibold text-[#4A3F35]"
                    >
                      {t.aiConsentTitle}
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-[#4A3F35]/65">
                      {t.aiConsentText}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveAgreement("ai")}
                      className="mt-2 text-xs font-semibold text-[#C95F4B] underline decoration-[#E2725B]/50 underline-offset-4 hover:text-[#A94B3A]"
                    >
                      {locale === "id"
                        ? "Baca persetujuan penggunaan AI"
                        : "Read the AI usage agreement"}
                    </button>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-[#4A3F35]/75">
                    <input
                      type="checkbox"
                      name="aiConsent"
                      checked={aiConsent}
                      onChange={(event) => {
                        setAiConsent(event.target.checked);
                        if (event.target.checked && privacyConsent) {
                          setErrorField((current) =>
                            current === "consent" ? "" : current,
                          );
                          setError((current) =>
                            current === t.consentRequired ? "" : current,
                          );
                        }
                      }}
                      disabled={isLoading || isGoogleLoading}
                      className="mt-1 h-4 w-4 shrink-0 accent-[#E2725B]"
                      required
                    />
                    <span>{t.aiConsentCheckbox}</span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-[#4A3F35]/75">
                    <input
                      type="checkbox"
                      name="privacyConsent"
                      checked={privacyConsent}
                      onChange={(event) => {
                        setPrivacyConsent(event.target.checked);
                        if (aiConsent && event.target.checked) {
                          setErrorField((current) =>
                            current === "consent" ? "" : current,
                          );
                          setError((current) =>
                            current === t.consentRequired ? "" : current,
                          );
                        }
                      }}
                      disabled={isLoading || isGoogleLoading}
                      className="mt-1 h-4 w-4 shrink-0 accent-[#E2725B]"
                      required
                    />
                    <span>{t.privacyConsentText}</span>
                  </label>
                  <div className="ml-7 -mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveAgreement("privacy")}
                      className="font-semibold text-[#C95F4B] underline decoration-[#E2725B]/50 underline-offset-4 hover:text-[#A94B3A]"
                    >
                      {locale === "id"
                        ? "Baca kebijakan privasi"
                        : "Read the Privacy Policy"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveAgreement("ai")}
                      className="font-semibold text-[#C95F4B] underline decoration-[#E2725B]/50 underline-offset-4 hover:text-[#A94B3A]"
                    >
                      {locale === "id"
                        ? "Baca persetujuan penggunaan AI"
                        : "Read the AI Usage Agreement"}
                    </button>
                  </div>

                  {errorField === "consent" && (
                    <p
                      className="text-xs leading-5 text-[#C95F4B]"
                      role="alert"
                    >
                      {t.consentRequired}
                    </p>
                  )}
                </section>

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
                  <span>{isLoading ? t.registering : t.register}</span>

                  {!isLoading && (
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  )}
                </button>
              </form>

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
                    if (!aiConsent || !privacyConsent) {
                      event.preventDefault();
                      setError(t.consentRequired);
                      setErrorField("consent");
                      return;
                    }

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

              <div className="mt-8 flex items-center justify-center gap-1.5 text-sm">
                <span className="text-[#4A3F35]/45">{t.alreadyAccount}</span>

                <Link
                  href={`/${locale}/login`}

                  className="font-semibold text-[#5C6B9C] transition hover:text-[#E2725B]"
                >
                  {t.login}
                </Link>
              </div>

              <div className="mt-9 border-t border-[#4A3F35]/[0.07] pt-6">
                <div className="flex items-start gap-3">
                  <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#5C6B9C]/60" />

                  <p className="text-[10px] leading-5 text-[#4A3F35]/35">
                    {t.privacyNote}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-center lg:hidden">
                <Link
                  href={`/${locale}`}

                  className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#4A3F35]/30 transition hover:text-[#5C6B9C]"
                >
                  {locale === "en" ? "Back to Reweave" : "Kembali ke Reweave"}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {activeAgreement && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-[#241F1B]/55 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveAgreement(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="agreement-modal-title"
            className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[#C1D5C0]/70 bg-[#FDFBF7] shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-[#C1D5C0]/50 px-5 py-4 sm:px-7">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C95F4B]">
                  {locale === "id" ? "REWEAVE · DOKUMEN" : "REWEAVE · DOCUMENT"}
                </p>
                <h2
                  id="agreement-modal-title"
                  className="mt-1 text-lg font-bold text-[#4A3F35] sm:text-xl"
                >
                  {activeAgreement === "ai"
                    ? locale === "id"
                      ? "Persetujuan Penggunaan AI"
                      : "AI Usage Agreement"
                    : locale === "id"
                      ? "Kebijakan Privasi"
                      : "Privacy Policy"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveAgreement(null)}
                aria-label={
                  locale === "id" ? "Tutup dokumen" : "Close document"
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#C1D5C0] text-lg text-[#4A3F35] transition hover:bg-[#C1D5C0]/30"
              >
                ×
              </button>
            </header>
            <div className="overflow-y-auto px-5 py-5 text-sm leading-6 text-[#4A3F35]/80 sm:px-7">
              {activeAgreement === "ai" ? (
                locale === "id" ? (
                  <div className="space-y-5">
                    <p>
                      Dokumen ini menjelaskan bagaimana fitur AI di Reweave
                      digunakan untuk membantu kamu memahami catatan dan pola
                      emosi. Dengan mencentang persetujuan, kamu menyatakan
                      telah membaca penjelasan berikut.
                    </p>
                    <div>
                      <h3 className="font-bold text-[#4A3F35]">
                        1. Data yang dapat diproses
                      </h3>
                      <p>
                        Jika kamu menggunakan fitur analisis AI, data yang kamu
                        pilih untuk dianalisis dapat mencakup check-in emosi,
                        intensitas emosi, konteks yang kamu tambahkan, catatan
                        singkat, dan isi diary. Jangan masukkan kata sandi, data
                        keuangan, atau informasi sensitif yang tidak diperlukan.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#4A3F35]">
                        2. Tujuan penggunaan
                      </h3>
                      <p>
                        Data tersebut digunakan untuk menghasilkan rangkuman,
                        insight tentang pola emosi, kemungkinan pemicu, dan
                        saran aktivitas untuk membantu refleksi diri. Fitur AI
                        tidak dimaksudkan untuk membuat keputusan atas nama
                        kamu.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#4A3F35]">
                        3. Batasan AI
                      </h3>
                      <p>
                        Hasil AI dibuat secara otomatis, bisa tidak akurat,
                        tidak lengkap, atau tidak sesuai dengan situasimu.
                        Hasilnya bukan diagnosis, terapi, atau pengganti bantuan
                        profesional kesehatan mental. Gunakan penilaianmu
                        sendiri dan cari bantuan profesional bila diperlukan.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#4A3F35]">
                        4. Pilihan dan kendali
                      </h3>
                      <p>
                        Kamu dapat memilih apakah akan menggunakan fitur
                        analisis AI dan catatan mana yang dikirim untuk
                        dianalisis. Persetujuan ini berkaitan dengan pemrosesan
                        untuk fitur AI; pemrosesan data akun dan layanan dasar
                        dijelaskan dalam Kebijakan Privasi.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#4A3F35]">
                        5. Keamanan dan penyedia AI
                      </h3>
                      <p>
                        Untuk menghasilkan analisis, konten yang kamu pilih
                        dapat dikirim ke layanan AI pihak ketiga. Pemrosesan
                        data mengikuti cara kerja layanan tersebut dan
                        konfigurasi Reweave. Jangan gunakan fitur ini untuk
                        keadaan darurat atau menganggap percakapan AI sebagai
                        komunikasi rahasia dengan tenaga profesional.
                      </p>
                    </div>
                    <p className="rounded-xl bg-[#C1D5C0]/25 p-3 text-xs">
                      Jika kamu sedang berada dalam bahaya langsung atau
                      membutuhkan bantuan segera, hubungi layanan darurat atau
                      orang tepercaya di sekitarmu.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <p>
                      This document explains how Reweave&apos;s AI features help you
                      reflect on diary entries and emotional patterns. By
                      checking the consent box, you confirm that you have read
                      this explanation.
                    </p>
                    <div>
                      <h3 className="font-bold text-[#4A3F35]">
                        1. Data that may be processed
                      </h3>
                      <p>
                        If you use AI analysis, selected data may include
                        emotion check-ins, intensity, context tags, short notes,
                        and diary entries. Do not submit passwords, financial
                        details, or unnecessary sensitive information.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#4A3F35]">2. Purpose</h3>
                      <p>
                        This data is used to generate summaries,
                        emotional-pattern insights, possible triggers, and
                        activity suggestions for self-reflection. AI is not
                        intended to make decisions on your behalf.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#4A3F35]">
                        3. AI limitations
                      </h3>
                      <p>
                        AI output is automated and may be inaccurate,
                        incomplete, or unsuitable for your situation. It is not
                        a diagnosis or therapy and does not replace professional
                        mental-health care. Use your own judgment and seek
                        professional help when needed.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#4A3F35]">
                        4. Your choices
                      </h3>
                      <p>
                        You choose whether to use AI analysis and which entries
                        to submit. This consent covers AI-feature processing;
                        account and core-service data processing is described in
                        the Privacy Policy.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#4A3F35]">
                        5. Security and AI providers
                      </h3>
                      <p>
                        To generate an analysis, the content you select may be
                        sent to a third-party AI service. Processing follows
                        that service&apos;s operation and Reweave&apos;s configuration. Do
                        not use this feature for emergencies or assume AI
                        interactions are confidential communications with a
                        professional.
                      </p>
                    </div>
                  </div>
                )
              ) : locale === "id" ? (
                <div className="space-y-5">
                  <p>
                    Kebijakan ini menjelaskan data yang digunakan saat kamu
                    membuat akun dan memakai fitur Reweave, termasuk bagaimana
                    data digunakan dan pilihan yang bisa kamu ambil untuk
                    menjaga privasimu.
                  </p>
                  <div>
                    <h3 className="font-bold text-[#4A3F35]">
                      1. Data yang dikumpulkan
                    </h3>
                    <p>
                      Reweave dapat memproses informasi akun seperti nama
                      panggilan dan email, data autentikasi, preferensi bahasa,
                      serta konten yang kamu masukkan seperti check-in, catatan,
                      dan diary.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#4A3F35]">
                      2. Cara data digunakan
                    </h3>
                    <p>
                      Data digunakan untuk membuat dan mengamankan akun,
                      menyediakan fitur aplikasi, menyimpan catatanmu,
                      menjalankan fitur yang kamu minta, dan meningkatkan
                      keandalan layanan. Konten yang kamu pilih untuk analisis
                      AI dapat dikirim ke penyedia AI untuk menghasilkan hasil
                      analisis.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#4A3F35]">
                      3. Penyimpanan dan pihak ketiga
                    </h3>
                    <p>
                      Reweave menggunakan layanan pendukung untuk menjalankan
                      aplikasi, seperti layanan penyimpanan, pengiriman email,
                      dan AI. Jika kamu meminta analisis AI, konten yang dipilih
                      dapat dikirim ke penyedia AI untuk diproses. Karena itu,
                      konten tersebut tidak boleh dianggap selalu anonim atau
                      hanya diproses di perangkatmu.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#4A3F35]">
                      4. Keamanan dan penghapusan
                    </h3>
                    <p>
                      Reweave berupaya melindungi data melalui pengamanan yang
                      diterapkan pada layanan. Tidak ada sistem yang dapat
                      menjamin keamanan secara mutlak. Jika kamu ingin
                      menanyakan data yang tersimpan, memperbaiki informasi,
                      atau meminta penghapusan akun dan data, gunakan kanal
                      kontak atau dukungan Reweave yang tersedia.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#4A3F35]">
                      5. Privasi pengguna
                    </h3>
                    <p>
                      Masukkan hanya informasi yang diperlukan untuk menggunakan
                      fitur Reweave. Jaga kerahasiaan kata sandi dan jangan
                      membagikan akses akun kepada orang lain.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#4A3F35]">
                      6. Pilihan dan hak pengguna
                    </h3>
                    <p>
                      Kamu dapat meminta informasi mengenai data pribadimu,
                      mengajukan koreksi jika ada informasi yang keliru, atau
                      meminta penghapusan data melalui kanal kontak atau
                      dukungan Reweave yang tersedia. Beberapa data mungkin
                      tetap perlu disimpan apabila diwajibkan oleh hukum atau
                      diperlukan untuk keamanan layanan.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <p>
                    This policy explains what information is used when you
                    create an account and use Reweave, how that information is
                    used, and the choices available to help protect your
                    privacy.
                  </p>
                  <div>
                    <h3 className="font-bold text-[#4A3F35]">
                      1. Data collected
                    </h3>
                    <p>
                      Reweave may process account information such as nickname
                      and email, authentication data, language preferences, and
                      content you submit, including check-ins, notes, and diary
                      entries.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#4A3F35]">
                      2. How data is used
                    </h3>
                    <p>
                      Data is used to create and secure your account, provide
                      app features, store your entries, perform requested
                      features, and maintain service reliability. Content you
                      select for AI analysis may be sent to the AI provider to
                      generate results.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#4A3F35]">
                      3. Storage and third parties
                    </h3>
                    <p>
                      Reweave relies on supporting services to operate, such as
                      storage, email delivery, and AI services. If you request
                      AI analysis, the selected content may be sent to an AI
                      provider for processing. This means the content should not
                      be assumed to be fully anonymous or processed only on your
                      device.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#4A3F35]">
                      4. Security and deletion
                    </h3>
                    <p>
                      Reweave works to protect information using safeguards
                      applied to the service. No system can guarantee absolute
                      security. If you want to ask about stored data, correct
                      information, or request deletion of your account and data,
                      use the contact or support channel provided by Reweave.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#4A3F35]">
                      5. User privacy
                    </h3>
                    <p>
                      Provide only the information needed to use Reweave&apos;s
                      features. Keep your password private and do not share
                      access to your account with others.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#4A3F35]">
                      6. Your choices and rights
                    </h3>
                    <p>
                      You may ask about your personal data, request corrections
                      to inaccurate information, or request deletion through
                      Reweave&apos;s available contact or support channel. Some
                      information may need to be retained where required by law
                      or necessary for service security.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <footer className="flex justify-end border-t border-[#C1D5C0]/50 px-5 py-4 sm:px-7">
              <button
                type="button"
                onClick={() => setActiveAgreement(null)}
                className="rounded-xl bg-[#4A3F35] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5C6B9C]"
              >
                {locale === "id" ? "Saya mengerti" : "I understand"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}

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

      <span className="text-[10px] font-medium">{text}</span>
    </div>
  );
}
