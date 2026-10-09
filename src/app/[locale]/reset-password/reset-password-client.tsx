"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import {
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
} from "@/components/reweave-icons";

import { LanguageSwitcher } from "@/components/language-switcher";

type ResetPasswordClientProps = {
  locale: string;
};

type Language = "id" | "en";

const translations = {
  id: {
    title: "Buat password baru",
    subtitle:
      "Masukkan kode verifikasi yang dikirim ke email kamu, lalu buat password baru.",
    email: "Email",
    otp: "Kode verifikasi",
    otpPlaceholder: "Masukkan 6 digit kode",
    password: "Password baru",
    passwordPlaceholder: "Minimal 8 karakter",
    confirmPassword: "Konfirmasi password",
    confirmPasswordPlaceholder: "Ulangi password baru",
    reset: "Ubah password",
    resetting: "Mengubah password...",
    resend: "Kirim ulang kode",
    resendIn: "Kirim ulang dalam",
    seconds: "detik",
    backToLogin: "Kembali ke login",
    invalidEmail: "Email tidak ditemukan.",
    invalidOtp: "Kode verifikasi harus terdiri dari 6 digit.",
    invalidPassword: "Password minimal 8 karakter.",
    passwordMismatch: "Konfirmasi password tidak cocok.",
    genericError: "Terjadi kesalahan. Silakan coba lagi.",
    success: "Password berhasil diubah. Mengalihkan ke halaman login...",
    resendSuccess: "Kode verifikasi baru telah dikirim.",
    resendError: "Gagal mengirim ulang kode.",
    expired: "Kode verifikasi sudah kedaluwarsa. Silakan kirim ulang kode.",
    tooManyAttempts:
      "Terlalu banyak percobaan. Silakan kirim ulang kode baru.",
    invalidCode: "Kode verifikasi salah.",
    notFound:
      "Kode verifikasi tidak ditemukan. Silakan kirim ulang kode.",
    security: "Kode hanya berlaku selama 10 menit.",
  },

  en: {
    title: "Create a new password",
    subtitle:
      "Enter the verification code sent to your email, then create a new password.",
    email: "Email",
    otp: "Verification code",
    otpPlaceholder: "Enter 6-digit code",
    password: "New password",
    passwordPlaceholder: "At least 8 characters",
    confirmPassword: "Confirm password",
    confirmPasswordPlaceholder: "Repeat your new password",
    reset: "Change password",
    resetting: "Changing password...",
    resend: "Resend code",
    resendIn: "Resend in",
    seconds: "seconds",
    backToLogin: "Back to login",
    invalidEmail: "Email address is missing.",
    invalidOtp: "Verification code must contain 6 digits.",
    invalidPassword: "Password must be at least 8 characters.",
    passwordMismatch: "Passwords do not match.",
    genericError: "Something went wrong. Please try again.",
    success: "Password changed successfully. Redirecting to login...",
    resendSuccess: "A new verification code has been sent.",
    resendError: "Failed to resend the verification code.",
    expired:
      "The verification code has expired. Please request a new one.",
    tooManyAttempts:
      "Too many attempts. Please request a new verification code.",
    invalidCode: "The verification code is incorrect.",
    notFound:
      "Verification code not found. Please request a new verification code.",
    security: "The code is valid for 10 minutes.",
  },
} as const;

export default function ResetPasswordClient({
  locale,
}: ResetPasswordClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const language: Language = locale === "en" ? "en" : "id";
  const t = translations[language];

  const email =
    searchParams.get("email")?.trim().toLowerCase() ?? "";

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRef = useRef<HTMLInputElement>(null);

  /*
   * Countdown timer.
   *
   * Effect digunakan di sini karena kita memang
   * melakukan subscription ke timer eksternal.
   */
  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setResendCooldown((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [resendCooldown]);

  function handleOtpChange(value: string) {
    const digitsOnly = value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(digitsOnly);
    setError("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError(t.invalidEmail);
      return;
    }

    if (otp.length !== 6) {
      setError(t.invalidOtp);
      return;
    }

    if (password.length < 8) {
      setError(t.invalidPassword);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
            password,
            confirmPassword,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.code === "EXPIRED") {
          setError(t.expired);
        } else if (data.code === "TOO_MANY_ATTEMPTS") {
          setError(t.tooManyAttempts);
        } else if (data.code === "INVALID") {
          setError(t.invalidCode);
        } else if (data.code === "NOT_FOUND") {
          setError(t.notFound);
        } else if (data.errors?.fieldErrors) {
          const fieldErrors = data.errors.fieldErrors;

          if (fieldErrors.password?.[0]) {
            setError(fieldErrors.password[0]);
          } else if (fieldErrors.confirmPassword?.[0]) {
            setError(fieldErrors.confirmPassword[0]);
          } else if (fieldErrors.otp?.[0]) {
            setError(fieldErrors.otp[0]);
          } else {
            setError(data.message || t.genericError);
          }
        } else {
          setError(data.message || t.genericError);
        }

        return;
      }

      setSuccess(t.success);

      window.setTimeout(() => {
        router.replace(`/${locale}/login`);
      }, 900);
    } catch (requestError) {
      console.error(
        "RESET_PASSWORD_CLIENT_ERROR",
        requestError,
      );

      setError(t.genericError);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || isResending) {
      return;
    }

    if (!email) {
      setError(t.invalidEmail);
      return;
    }

    setError("");
    setSuccess("");
    setIsResending(true);

    try {
      const response = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.retryAfter) {
          setResendCooldown(Number(data.retryAfter));
        }

        setError(data.message || t.resendError);
        return;
      }

      setOtp("");
      setPassword("");
      setConfirmPassword("");

      setResendCooldown(60);
      setSuccess(t.resendSuccess);

      window.setTimeout(() => {
        otpInputRef.current?.focus();
      }, 0);
    } catch (requestError) {
      console.error(
        "RESEND_RESET_OTP_ERROR",
        requestError,
      );

      setError(t.resendError);
    } finally {
      setIsResending(false);
    }
  }

  function handleBack() {
    router.push(`/${locale}/login`);
  }

  return (
    <main className="min-h-svh bg-[#FDFBF7] text-[#4A3F35]">
      <div
        className="
          mx-auto
          flex
          min-h-svh
          w-full
          max-w-6xl
          flex-col
          px-4
          py-4
          sm:px-6
          sm:py-6
          lg:px-8
        "
      >
        {/* Header */}
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

        {/* Main */}
        <div
          className="
            flex
            flex-1
            items-center
            justify-center
            py-7
            sm:py-10
            lg:py-12
          "
        >
          <div className="w-full max-w-60">
            {/* Logo */}
            <div className="mb-7 flex justify-center sm:mb-8">
              <Image
                src="/reweave-logo.webp"
                alt="Reweave"
                width={132}
                height={44}
                priority
                className="
                  h-auto
                  w-29.5
                  object-contain
                  sm:w-33
                "
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
                  <LockIcon className="h-5 w-5" />
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
                    max-w-37.5
                    text-[13px]
                    leading-6
                    text-[#4A3F35]/60
                    sm:text-sm
                  "
                >
                  {t.subtitle}
                </p>
              </div>

              {/* Email */}
              <div className="mb-5">
                <label
                  htmlFor="reset-email"
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
                      h-4.25
                      w-4.25
                      -translate-y-1/2
                      text-[#4A3F35]/35
                    "
                  />

                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    readOnly
                    autoComplete="email"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-[#4A3F35]/10
                      bg-[#F3F0EA]
                      pl-11
                      pr-4
                      text-sm
                      text-[#4A3F35]/70
                      outline-none
                      sm:h-12.5
                    "
                  />
                </div>
              </div>

              {/* OTP */}
              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="reset-otp"
                    className="
                      text-xs
                      font-semibold
                      text-[#4A3F35]/75
                      sm:text-[13px]
                    "
                  >
                    {t.otp}
                  </label>

                  <span
                    className="
                      text-right
                      text-[10px]
                      leading-4
                      text-[#4A3F35]/45
                      sm:text-[11px]
                    "
                  >
                    {t.security}
                  </span>
                </div>

                <input
                  ref={otpInputRef}
                  id="reset-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    handleOtpChange(event.target.value)
                  }
                  placeholder={t.otpPlaceholder}
                  className="
                    h-14
                    w-full
                    rounded-xl
                    border
                    border-[#4A3F35]/12
                    bg-[#FDFBF7]
                    px-4
                    text-center
                    text-xl
                    font-semibold
                    tracking-[0.35em]
                    text-[#4A3F35]
                    outline-none
                    transition
                    placeholder:text-sm
                    placeholder:font-normal
                    placeholder:tracking-normal
                    placeholder:text-[#4A3F35]/30
                    focus:border-[#E2725B]/50
                    focus:bg-white
                    focus:ring-4
                    focus:ring-[#E2725B]/8
                  "
                />
              </div>

              {/* New password */}
              <div className="mb-5">
                <label
                  htmlFor="reset-password"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    text-[#4A3F35]/75
                    sm:text-[13px]
                  "
                >
                  {t.password}
                </label>

                <div className="relative">
                  <LockIcon
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      h-4.25
                      w-4.25
                      -translate-y-1/2
                      text-[#4A3F35]/35
                    "
                  />

                  <input
                    id="reset-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    placeholder={t.passwordPlaceholder}
                    autoComplete="new-password"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-[#4A3F35]/12
                      bg-[#FDFBF7]
                      pl-11
                      pr-12
                      text-sm
                      text-[#4A3F35]
                      outline-none
                      transition
                      placeholder:text-[#4A3F35]/30
                      focus:border-[#E2725B]/50
                      focus:bg-white
                      focus:ring-4
                      focus:ring-[#E2725B]/8
                      sm:h-12.5
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current,
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="
                      absolute
                      right-2.5
                      top-1/2
                      flex
                      h-9
                      w-9
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-lg
                      text-[#4A3F35]/40
                      transition
                      hover:bg-[#FBC4AB]/20
                      hover:text-[#4A3F35]
                    "
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4.25 w-4.25" />
                    ) : (
                      <EyeIcon className="h-4.25 w-4.25" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="mb-6">
                <label
                  htmlFor="reset-confirm-password"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    text-[#4A3F35]/75
                    sm:text-[13px]
                  "
                >
                  {t.confirmPassword}
                </label>

                <div className="relative">
                  <LockIcon
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      h-4.25
                      w-4.25
                      -translate-y-1/2
                      text-[#4A3F35]/35
                    "
                  />

                  <input
                    id="reset-confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(
                        event.target.value,
                      );
                      setError("");
                    }}
                    placeholder={
                      t.confirmPasswordPlaceholder
                    }
                    autoComplete="new-password"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-[#4A3F35]/12
                      bg-[#FDFBF7]
                      pl-11
                      pr-12
                      text-sm
                      text-[#4A3F35]
                      outline-none
                      transition
                      placeholder:text-[#4A3F35]/30
                      focus:border-[#E2725B]/50
                      focus:bg-white
                      focus:ring-4
                      focus:ring-[#E2725B]/8
                      sm:h-12.5
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current,
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="
                      absolute
                      right-2.5
                      top-1/2
                      flex
                      h-9
                      w-9
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-lg
                      text-[#4A3F35]/40
                      transition
                      hover:bg-[#FBC4AB]/20
                      hover:text-[#4A3F35]
                    "
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="h-4.25 w-4.25" />
                    ) : (
                      <EyeIcon className="h-4.25 w-4.25" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="
                    mb-4
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

              {/* Success */}
              {success && (
                <div
                  role="status"
                  className="
                    mb-4
                    rounded-xl
                    border
                    border-[#C1D5C0]/70
                    bg-[#C1D5C0]/25
                    px-4
                    py-3
                    text-xs
                    leading-5
                    text-[#4A3F35]
                  "
                >
                  {success}
                </div>
              )}

              {/* Submit */}
              <form onSubmit={handleSubmit}>
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
                    sm:h-12.5
                  "
                >
                  <span>
                    {isLoading
                      ? t.resetting
                      : t.reset}
                  </span>

                  {!isLoading && (
                    <ArrowRightIcon className="h-4.25 w-4.25" />
                  )}
                </button>
              </form>

              {/* Resend */}
              <div className="mt-5 text-center">
                {resendCooldown > 0 && (
                  <span className="text-xs text-[#4A3F35]/50">
                    {t.resendIn} {resendCooldown}{" "}
                    {t.seconds}
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={
                    resendCooldown > 0 ||
                    isResending
                  }
                  className="
                    ml-1
                    min-h-8
                    px-1
                    text-xs
                    font-semibold
                    text-[#5C6B9C]
                    transition
                    hover:text-[#E2725B]
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  {isResending ? "..." : t.resend}
                </button>
              </div>
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
              Reweave · Emotional wellbeing, one day at a time.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}