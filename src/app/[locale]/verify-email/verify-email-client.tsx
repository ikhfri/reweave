"use client";

import Image from "next/image";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { ArrowRightIcon } from "@/components/moodify-icons";

type VerifyEmailClientProps = {
  locale: string;
};

export default function VerifyEmailClient({
  locale,
}: VerifyEmailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const userId = searchParams.get("userId");

  const isEnglish = locale === "en";

  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  const text = {
    title: isEnglish ? "Check your email" : "Cek email kamu",
    description: isEnglish
      ? "We sent a 6-digit verification code to your email address."
      : "Kami sudah mengirim kode verifikasi 6 digit ke alamat email kamu.",
    codeLabel: isEnglish ? "Verification code" : "Kode verifikasi",
    verify: isEnglish ? "Verify email" : "Verifikasi email",
    verifying: isEnglish ? "Verifying..." : "Memverifikasi...",
    resend: isEnglish ? "Resend code" : "Kirim ulang kode",
    resendIn: isEnglish ? "Resend in" : "Kirim ulang dalam",
    didntReceive: isEnglish
      ? "Didn't receive the code?"
      : "Belum menerima kode?",
    wrongEmail: isEnglish
      ? "Wrong email?"
      : "Email salah?",
    backRegister: isEnglish
      ? "Back to registration"
      : "Kembali ke pendaftaran",
    invalidUser: isEnglish
      ? "Verification session is invalid. Please register again."
      : "Sesi verifikasi tidak valid. Silakan daftar kembali.",
    invalidOtp: isEnglish
      ? "Please enter the 6-digit verification code."
      : "Masukkan kode verifikasi 6 digit.",
    verified: isEnglish
      ? "Email verified successfully."
      : "Email berhasil diverifikasi.",
    genericError: isEnglish
      ? "Something went wrong. Please try again."
      : "Terjadi kesalahan. Silakan coba lagi.",
    resendSuccess: isEnglish
      ? "A new verification code has been sent."
      : "Kode verifikasi baru sudah dikirim.",
  };

  useEffect(() => {
    if (!userId) {
      return;
    }

    inputRef.current?.focus();
  }, [userId]);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCooldown((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
  if (!userId) {
    return;
  }

  const currentUserId = userId;

  async function loadUser() {
    try {
      const response = await fetch(
        `/api/auth/verification-status?userId=${encodeURIComponent(
          currentUserId
        )}`
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (data.email) {
        setEmail(data.email);
      }

      if (data.emailVerifiedAt) {
        router.replace(`/${locale}/onboarding`);
      }
    } catch {
      // Email display is optional.
    }
  }

  loadUser();
}, [locale, router, userId]);

  function handleOtpChange(value: string) {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 6);

    setOtp(digitsOnly);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId) {
      setError(text.invalidUser);
      return;
    }

    if (otp.length !== 6) {
      setError(text.invalidOtp);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message ?? text.genericError);
        return;
      }

      setSuccess(text.verified);

      window.setTimeout(() => {
        router.replace(`/${locale}/onboarding`);
      }, 700);
    } catch {
      setError(text.genericError);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!userId || cooldown > 0 || resending) {
      return;
    }

    setResending(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 429 && data.retryAfter) {
          setCooldown(Number(data.retryAfter));
        }

        setError(data.message ?? text.genericError);
        return;
      }

      setSuccess(text.resendSuccess);
      setCooldown(60);
      setOtp("");
      inputRef.current?.focus();
    } catch {
      setError(text.genericError);
    } finally {
      setResending(false);
    }
  }

  function handleBackToRegister() {
    router.push(`/${locale}/register`);
  }

  if (!userId) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] px-5 py-8 text-[#4A3F35]">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center">
          <section className="w-full rounded-[28px] border border-[#4A3F35]/10 bg-white p-7 shadow-[0_20px_60px_rgba(74,63,53,0.08)] sm:p-9">
            <div className="mb-8 flex justify-center">
              <Image
                src="/Moodify-logo.png"
                alt="Moodify"
                width={150}
                height={48}
                className="h-auto w-[150px]"
                priority
              />
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-[-0.03em]">
                {text.invalidUser}
              </h1>

              <button
                type="button"
                onClick={handleBackToRegister}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#E2725B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#D7654E]"
              >
                {text.backRegister}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] px-5 py-8 text-[#4A3F35] sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1120px] items-center justify-center">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-[#4A3F35]/10 bg-white shadow-[0_24px_80px_rgba(74,63,53,0.08)] lg:grid-cols-[0.9fr_1.1fr]">
          {/* Left visual */}
          <div className="relative hidden min-h-[620px] overflow-hidden bg-[#FBC4AB]/35 p-10 lg:flex lg:flex-col lg:justify-between">
            <div className="relative z-10">
              <Image
                src="/Moodify-logo.png"
                alt="Moodify"
                width={150}
                height={48}
                className="h-auto w-[150px]"
                priority
              />
            </div>

            <div className="relative z-10 max-w-sm">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#E2725B]">
                {isEnglish ? "One small step" : "Satu langkah kecil"}
              </p>

              <h2 className="text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#4A3F35]">
                {isEnglish
                  ? "Make space for how you feel."
                  : "Beri ruang untuk apa yang kamu rasakan."}
              </h2>

              <p className="mt-5 text-[15px] leading-7 text-[#4A3F35]/65">
                {isEnglish
                  ? "Your email helps us keep your Moodify account secure."
                  : "Email kamu membantu menjaga akun Moodify tetap aman."}
              </p>
            </div>

            <div className="absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-[#C1D5C0]/70" />
            <div className="absolute right-20 top-28 h-24 w-24 rounded-full bg-white/50" />
          </div>

          {/* Form */}
          <div className="flex min-h-[620px] flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
            <div className="mx-auto w-full max-w-[430px]">
              <div className="mb-9 lg:hidden">
                <Image
                  src="/Moodify-logo.png"
                  alt="Moodify"
                  width={150}
                  height={48}
                  className="h-auto w-[150px]"
                  priority
                />
              </div>

              <div className="mb-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBC4AB]/45">
                  <span className="text-lg font-semibold text-[#E2725B]">
                    6
                  </span>
                </div>

                <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.04em] sm:text-[36px]">
                  {text.title}
                </h1>

                <p className="mt-3 text-[15px] leading-7 text-[#4A3F35]/60">
                  {text.description}
                </p>

                {email && (
                  <p className="mt-2 break-all text-sm font-medium text-[#4A3F35]/80">
                    {email}
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <label
                  htmlFor="otp"
                  className="mb-2 block text-sm font-semibold text-[#4A3F35]"
                >
                  {text.codeLabel}
                </label>

                <input
                  ref={inputRef}
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => handleOtpChange(event.target.value)}
                  placeholder="000000"
                  disabled={loading}
                  className="h-16 w-full rounded-2xl border border-[#4A3F35]/12 bg-[#FDFBF7] px-5 text-center text-2xl font-semibold tracking-[0.42em] text-[#4A3F35] outline-none transition placeholder:text-[#4A3F35]/20 focus:border-[#E2725B] focus:ring-4 focus:ring-[#E2725B]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                {error && (
                  <div
                    role="alert"
                    className="mt-4 rounded-2xl border border-[#E2725B]/20 bg-[#E2725B]/8 px-4 py-3 text-sm leading-6 text-[#B84F3D]"
                  >
                    {error}
                  </div>
                )}

                {success && (
                  <div
                    role="status"
                    className="mt-4 rounded-2xl border border-[#C1D5C0] bg-[#C1D5C0]/35 px-4 py-3 text-sm leading-6 text-[#4A3F35]"
                  >
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#E2725B] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#D7654E] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {loading ? text.verifying : text.verify}

                  {!loading && (
                    <ArrowRightIcon className="h-4 w-4" />
                  )}
                </button>
              </form>

              <div className="mt-7 text-center">
                <p className="text-sm text-[#4A3F35]/55">
                  {text.didntReceive}
                </p>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || resending}
                  className="mt-2 text-sm font-semibold text-[#E2725B] transition hover:text-[#D7654E] disabled:cursor-not-allowed disabled:text-[#4A3F35]/35"
                >
                  {resending
                    ? isEnglish
                      ? "Sending..."
                      : "Mengirim..."
                    : cooldown > 0
                      ? `${text.resendIn} ${cooldown}s`
                      : text.resend}
                </button>
              </div>

              <div className="mt-8 border-t border-[#4A3F35]/8 pt-6 text-center">
                <button
                  type="button"
                  onClick={handleBackToRegister}
                  className="text-sm font-medium text-[#4A3F35]/55 transition hover:text-[#4A3F35]"
                >
                  {text.wrongEmail}{" "}
                  <span className="font-semibold text-[#4A3F35]">
                    {text.backRegister}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}