"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import {
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  ShieldIcon,
} from "@/components/moodify-icons";

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
    googleLogin: "Lanjutkan dengan Google",
    googleLoggingIn: "Menghubungkan...",
    orContinueWith: "atau lanjutkan dengan",

    noAccount: "Belum punya akun?",
    register: "Daftar sekarang",

    privacyTitle: "Ruang pribadimu",

    privacyText:
      "Cerita, check-in, dan refleksi yang kamu simpan tetap terhubung dengan akunmu.",

    terms:
      "Dengan masuk, kamu menyetujui Terms of Service dan Privacy Policy Moodify.",

    validation: {
      emptyEmail: "Email tidak boleh kosong.",
      invalidEmail: "Format email tidak valid.",
      emptyPassword: "Password tidak boleh kosong.",
    },

    errors: {
      loginFailed: "Email atau password salah.",
      googleFailed: "Login dengan Google gagal. Silakan coba lagi.",
      googleConflict:
        "Akun Google ini tidak dapat dihubungkan dengan akun Moodify.",
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
    googleLogin: "Continue with Google",
    googleLoggingIn: "Connecting...",
    orContinueWith: "or continue with",

    noAccount: "Don't have an account?",
    register: "Create an account",

    privacyTitle: "Your private space",

    privacyText:
      "Your stories, check-ins, and reflections stay connected to your account.",

    terms:
      "By signing in, you agree to Moodify's Terms of Service and Privacy Policy.",

    validation: {
      emptyEmail: "Email cannot be empty.",
      invalidEmail: "Invalid email format.",
      emptyPassword: "Password cannot be empty.",
    },

    errors: {
      loginFailed: "Invalid email or password.",
      googleFailed: "Google sign-in failed. Please try again.",
      googleConflict:
        "This Google account could not be connected to your Moodify account.",
      general: "Something went wrong. Please try again.",
    },
  },
};

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();

  const localeParam = params.locale;

  const locale: Locale = localeParam === "en" ? "en" : "id";

  const isEnglish = locale === "en";
  const t = content[locale];

  const searchParams = useSearchParams();

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

    if (!email.trim()) {
      setError(t.validation.emptyEmail);
      setErrorField("email");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError(t.validation.invalidEmail);
      setErrorField("email");
      return;
    }

    if (!password) {
      setError(t.validation.emptyPassword);
      setErrorField("password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      /*
       * Password benar tetapi email belum diverifikasi.
       *
       * Backend mengembalikan:
       *
       * {
       *   success: false,
       *   code: "EMAIL_NOT_VERIFIED",
       *   user: {
       *     id: "...",
       *     email: "...",
       *   }
       * }
       */
      if (
        response.status === 403 &&
        data.code === "EMAIL_NOT_VERIFIED" &&
        data.user?.id
      ) {
        router.push(
          `/${locale}/verify-email?userId=${encodeURIComponent(
            data.user.id
          )}`
        );

        return;
      }

      /*
       * Login gagal.
       */
      if (!response.ok) {
        if (response.status === 500) {
          setError(t.errors.general);
          setErrorField("general");
        } else {
          setError(t.errors.loginFailed);
          setErrorField("all");
        }

        return;
      }

      /*
       * Login berhasil.
       *
       * Jika onboarding sudah selesai:
       *   → dashboard
       *
       * Jika belum:
       *   → onboarding
       */
      if (data.user?.onboardingCompleted) {
        router.push(`/${locale}/dashboard`);
      } else {
        router.push(`/${locale}/onboarding`);
      }

      router.refresh();
    } catch {
      setError(t.errors.general);
      setErrorField("general");
    } finally {
      setIsLoading(false);
    }
  }

  const emailHasError =
    errorField === "email" || errorField === "all";

  const passwordHasError =
    errorField === "password" || errorField === "all";

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#4A3F35]">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
        {/* =====================================================
            LEFT BRAND AREA
        ====================================================== */}

        <section className="relative hidden min-h-screen overflow-hidden bg-[#FDFBF7] lg:block">
          {/* Organic background shapes */}

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

              {/* Brand statement */}

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
                  <LockIcon className="h-[18px] w-[18px] text-[#5C6B9C]" />
                </div>

                <h2 className="text-[32px] font-semibold tracking-[-0.045em] text-[#4A3F35]">
                  {isEnglish ? "Sign in to Moodify" : "Masuk ke Moodify"}
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#4A3F35]/50">
                  {t.description}
                </p>
              </div>

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
                noValidate
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
                    <MailIcon
                      className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#4A3F35]/30"
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);

                        if (errorField === "email") {
                          setError("");
                          setErrorField("");
                        }
                      }}
                      placeholder={t.emailPlaceholder}
                      required
                      disabled={isLoading}
                      className={`h-[52px] w-full rounded-2xl border bg-[#FDFBF7] pl-11 pr-4 text-sm text-[#4A3F35] outline-none transition placeholder:text-[#4A3F35]/30 focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
                        emailHasError
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                          : "border-[#4A3F35]/10 hover:border-[#C1D5C0] focus:border-[#E2725B] focus:ring-[#E2725B]/10"
                      }`}
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

                    {/* Forgot password belum aktif.
                        Akan kita sambungkan ketika flow OTP
                        reset password dibuat. */}

                    <button
                      type="button"
                      disabled
                      className="text-[11px] font-medium text-[#4A3F35]/30"
                    >
                      {t.forgotPassword}
                    </button>
                  </div>

                  <div className="relative">
                    <LockIcon
                      className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#4A3F35]/30"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);

                        if (errorField === "password") {
                          setError("");
                          setErrorField("");
                        }
                      }}
                      placeholder={t.passwordPlaceholder}
                      required
                      disabled={isLoading}
                      className={`h-[52px] w-full rounded-2xl border bg-[#FDFBF7] pl-11 pr-12 text-sm text-[#4A3F35] outline-none transition placeholder:text-[#4A3F35]/30 focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
                        passwordHasError
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                          : "border-[#4A3F35]/10 hover:border-[#C1D5C0] focus:border-[#E2725B] focus:ring-[#E2725B]/10"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
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
                        <EyeOffIcon className="h-[17px] w-[17px]" />
                      ) : (
                        <EyeIcon className="h-[17px] w-[17px]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* ERROR */}

                {displayedError && (
                  <div
                    role="alert"
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3"
                  >
                    <p className="text-xs leading-5 text-red-600">
                      {displayedError}
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
                    {isLoading ? t.loggingIn : t.login}
                  </span>

                  {!isLoading && (
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  )}
                </button>
              </form>

              {/* GOOGLE OAUTH */}

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
                    h-[52px]
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
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {isGoogleLoading ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="h-4 w-4 animate-spin rounded-full border-2 border-[#4A3F35]/15 border-t-[#5C6B9C]"
                      />
                      <span>{t.googleLoggingIn}</span>
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

                      <span>{t.googleLogin}</span>
                    </>
                  )}
                </a>
              </div>

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
                  <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#5C6B9C]/60" />

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