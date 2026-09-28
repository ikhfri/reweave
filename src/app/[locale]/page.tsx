import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRightIcon,
  DiaryIcon,
  InsightIcon,
  PrivacyIcon,
  WellbeingIcon,
  ActivityIcon,
} from "@/components/moodify-icons";

import { isValidLocale, type Locale } from "@/i18n/config";
import { ArrowRight, Check, LockKeyhole } from "lucide-react";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LandingPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    redirect("/id");
  }

  const typedLocale = locale as Locale;
  const isEnglish = typedLocale === "en";


  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FDFBF7] text-[#4A3F35]">
      {/* =========================================================
          NAVBAR
      ========================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#4A3F35]/[0.07] bg-[#FDFBF7]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          {/* LOGO */}

          <Link
            href={`/${typedLocale}`}
            className="flex shrink-0 items-center"
            aria-label="Moodify"
          >
            <Image
              src="/Moodify-logo.png"
              alt="Moodify"
              width={150}
              height={45}
              priority
              className="h-15 w-auto object-contain"
            />
          </Link>

          {/* DESKTOP NAV */}

          <nav className="hidden items-center gap-7 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-[#4A3F35]/55 transition hover:text-[#4A3F35]"
            >
              {isEnglish ? "Features" : "Fitur"}
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-[#4A3F35]/55 transition hover:text-[#4A3F35]"
            >
              {isEnglish ? "How it works" : "Cara kerja"}
            </a>

            <a
              href="#privacy"
              className="text-sm font-medium text-[#4A3F35]/55 transition hover:text-[#4A3F35]"
            >
              {isEnglish ? "Privacy" : "Privasi"}
            </a>
          </nav>

          {/* AUTH ACTIONS */}

          <div className="flex items-center gap-2">
            <Link
              href={`/${typedLocale}/login`}
              className="hidden rounded-xl px-4 py-2.5 text-sm font-medium text-[#4A3F35]/65 transition hover:bg-[#4A3F35]/[0.04] hover:text-[#4A3F35] sm:inline-flex"
            >
              {isEnglish ? "Login" : "Masuk"}
            </Link>

            <Link
              href={`/${typedLocale}/register`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#5C6B9C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4A3F35]"
            >
              {isEnglish ? "Register" : "Daftar"}

              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO
      ========================================================== */}

      <section className="relative overflow-hidden">
        {/* Decorative background */}

        <div className="pointer-events-none absolute -right-52 -top-48 h-[560px] w-[560px] rounded-full bg-[#FBC4AB]/25 blur-3xl" />

        <div className="pointer-events-none absolute -left-52 bottom-0 h-[480px] w-[480px] rounded-full bg-[#C1D5C0]/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 pb-24 pt-16 sm:px-8 sm:pt-20 lg:grid-cols-[1fr_0.9fr] lg:px-10 lg:pb-32 lg:pt-28">
          {/* HERO CONTENT */}

          <div className="max-w-2xl">
            {/* Badge */}

          
             
  

            {/* Heading */}

            <h1 className="mt-7 max-w-[720px] text-[48px] font-semibold leading-[1.02] tracking-[-0.06em] text-[#4A3F35] sm:text-[60px] lg:text-[72px]">
              {isEnglish ? (
                <>
                  Understand
                  <br />
                  what you feel.
                </>
              ) : (
                <>
                  Pahami apa
                  <br />
                  yang kamu rasa.
                </>
              )}
            </h1>

            {/* Description */}

            <p className="mt-7 max-w-xl text-[15px] leading-8 text-[#4A3F35]/60 sm:text-[16px]">
              {isEnglish
                ? "Moodify gives you a private space to check in, write what is on your mind, and understand your emotional patterns over time."
                : "Moodify memberi kamu ruang pribadi untuk melakukan check-in, menulis apa yang ada di pikiranmu, dan memahami pola emosimu dari waktu ke waktu."}
            </p>

            {/* HERO BUTTONS */}

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/${typedLocale}/register`}
                className="group inline-flex h-12 items-center justify-center gap-3 rounded-xl bg-[#E2725B] px-6 text-sm font-semibold text-white transition hover:bg-[#4A3F35]"
              >
                {isEnglish
                  ? "Start for free"
                  : "Mulai sekarang"}

                <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <Link
                href={`/${typedLocale}/login`}
                className="inline-flex h-12 items-center justify-center rounded-xl border border-[#4A3F35]/10 bg-white/60 px-6 text-sm font-medium text-[#4A3F35]/70 transition hover:bg-white hover:text-[#4A3F35]"
              >
                {isEnglish
                  ? "I already have an account"
                  : "Saya sudah punya akun"}
              </Link>
            </div>

            {/* Small privacy message */}

            <div className="mt-8 flex items-center gap-2 text-xs text-[#4A3F35]/40">
              <LockKeyhole
                className="h-3.5 w-3.5"
                strokeWidth={1.8}
              />

              <span>
                {isEnglish
                  ? "A calm and private space for your everyday reflections."
                  : "Ruang yang tenang dan privat untuk refleksimu setiap hari."}
              </span>
            </div>
          </div>

          {/* HERO VISUAL */}

          <div className="relative mx-auto w-full max-w-[510px] lg:ml-auto">
            <div className="relative min-h-[500px] rounded-[40px] border border-[#4A3F35]/[0.06] bg-gradient-to-br from-[#FBC4AB]/45 via-white/40 to-[#C1D5C0]/35 p-5 sm:p-8">
              {/* Decorative circles */}

              <div className="absolute -right-6 top-10 h-20 w-20 rounded-full bg-[#C1D5C0]/60" />

              <div className="absolute -bottom-5 left-8 h-28 w-28 rounded-full bg-[#5C6B9C]/10" />

              {/* Main App Preview */}

              <div className="relative mt-3 rounded-[28px] border border-white bg-[#FDFBF7]/95 p-5 shadow-[0_28px_80px_rgba(74,63,53,0.13)] sm:p-7">
                {/* Header */}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#5C6B9C]">
                      {isEnglish
                        ? "Daily check-in"
                        : "Check-in hari ini"}
                    </p>

                    <p className="mt-1.5 text-lg font-semibold tracking-[-0.025em]">
                      {isEnglish
                        ? "How are you feeling?"
                        : "Apa yang kamu rasakan?"}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FBC4AB]/35">
                    <WellbeingIcon
                      className="h-4 w-4 text-[#E2725B]"
                      strokeWidth={1.8}
                    />
                  </div>
                </div>

                {/* Emotions */}

                <div className="mt-7 grid grid-cols-3 gap-2.5">
                  <div className="rounded-2xl border border-[#E2725B]/20 bg-[#E2725B]/[0.07] p-3 text-center">
                    <Image src="/emotions-emoji/calm.png" alt="" width={42} height={42} className="mx-auto object-contain mix-blend-multiply" />

                    <p className="mt-2 text-[10px] font-medium">
                      {isEnglish ? "Calm" : "Tenang"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#5C6B9C]/15 bg-[#5C6B9C]/[0.06] p-3 text-center">
                    <Image src="/emotions-emoji/happy.png" alt="" width={42} height={42} className="mx-auto object-contain mix-blend-multiply" />

                    <p className="mt-2 text-[10px] font-medium">
                      {isEnglish ? "Okay" : "Baik"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#C1D5C0]/60 bg-[#C1D5C0]/15 p-3 text-center">
                    <Image src="/emotions-emoji/tired.png" alt="" width={42} height={42} className="mx-auto object-contain mix-blend-multiply" />

                    <p className="mt-2 text-[10px] font-medium">
                      {isEnglish ? "Low" : "Lelah"}
                    </p>
                  </div>
                </div>

                {/* Emotional Rhythm */}

                <div className="mt-7 rounded-2xl bg-[#4A3F35]/[0.035] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4A3F35]/35">
                      {isEnglish
                        ? "Your rhythm"
                        : "Ritme emosimu"}
                    </p>

                    <InsightIcon className="h-3.5 w-3.5 text-[#5C6B9C]" />
                  </div>

                  <div className="mt-5 flex h-20 items-end gap-2">
                    <div
                      className="flex-1 rounded-t-md bg-[#E2725B]/35"
                      style={{ height: "48%" }}
                    />

                    <div
                      className="flex-1 rounded-t-md bg-[#E2725B]/50"
                      style={{ height: "72%" }}
                    />

                    <div
                      className="flex-1 rounded-t-md bg-[#E2725B]/30"
                      style={{ height: "42%" }}
                    />

                    <div
                      className="flex-1 rounded-t-md bg-[#5C6B9C]/55"
                      style={{ height: "86%" }}
                    />

                    <div
                      className="flex-1 rounded-t-md bg-[#5C6B9C]/40"
                      style={{ height: "65%" }}
                    />

                    <div
                      className="flex-1 rounded-t-md bg-[#C1D5C0]"
                      style={{ height: "54%" }}
                    />

                    <div
                      className="flex-1 rounded-t-md bg-[#E2725B]/45"
                      style={{ height: "76%" }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-[8px] text-[#4A3F35]/30">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>
              </div>

              {/* Reflection Card */}

              <div className="absolute -bottom-5 -left-4 w-[235px] rounded-2xl border border-white/80 bg-white/95 p-4 shadow-[0_18px_50px_rgba(74,63,53,0.12)] sm:-left-8">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5C6B9C]/10">
                    <InsightIcon
                      className="h-4 w-4 text-[#5C6B9C]"
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold">
                      {isEnglish
                        ? "A gentle reflection"
                        : "Refleksi kecil"}
                    </p>

                    <p className="text-[9px] text-[#4A3F35]/40">
                      {isEnglish
                        ? "Based on your check-in"
                        : "Dari check-in kamu"}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-[10px] leading-5 text-[#4A3F35]/55">
                  {isEnglish
                    ? "You seem to be carrying a few things today. Taking a short pause may help."
                    : "Sepertinya ada beberapa hal yang sedang kamu bawa hari ini. Berhenti sejenak mungkin bisa membantu."}
                </p>
              </div>

              {/* Privacy Badge */}

              <div className="absolute -right-3 bottom-16 hidden items-center gap-2 rounded-xl border border-white/80 bg-[#FDFBF7] px-3 py-2.5 shadow-[0_12px_35px_rgba(74,63,53,0.10)] sm:flex">
                <LockKeyhole
                  className="h-3.5 w-3.5 text-[#5C6B9C]"
                  strokeWidth={1.8}
                />

                <span className="text-[9px] font-semibold text-[#4A3F35]/60">
                  {isEnglish
                    ? "Private space"
                    : "Ruang pribadi"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          TRUST STRIP
      ========================================================== */}

      <section className="border-y border-[#4A3F35]/[0.07] bg-white/40">
        <div className="mx-auto grid max-w-7xl md:grid-cols-3">
          <TrustItem
            icon={<WellbeingIcon className="h-4 w-4" />}
            title={
              isEnglish
                ? "Check in with yourself"
                : "Check-in dengan dirimu"
            }
            description={
              isEnglish
                ? "Notice your emotions without judgment."
                : "Kenali emosimu tanpa menghakimi."
            }
          />

          <TrustItem
            icon={<DiaryIcon className="h-4 w-4" />}
            title={
              isEnglish
                ? "A private diary"
                : "Diary pribadi"
            }
            description={
              isEnglish
                ? "Write down what is on your mind."
                : "Tuliskan apa yang sedang ada di pikiranmu."
            }
          />

          <TrustItem
            icon={<InsightIcon className="h-4 w-4" />}
            title={
              isEnglish
                ? "Understand your patterns"
                : "Pahami polamu"
            }
            description={
              isEnglish
                ? "See your emotional rhythm over time."
                : "Lihat ritme emosimu dari waktu ke waktu."
            }
          />
        </div>
      </section>

      {/* =========================================================
          FEATURES
      ========================================================== */}

      <section
        id="features"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 sm:px-8 lg:px-10 lg:py-32"
      >
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5C6B9C]">
            {isEnglish
              ? "Everything in one place"
              : "Semuanya dalam satu ruang"}
          </p>

          <h2 className="mt-4 text-[34px] font-semibold tracking-[-0.045em] sm:text-[44px]">
            {isEnglish
              ? "Small moments can tell you a lot."
              : "Momen kecil bisa memberi banyak cerita."}
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-7 text-[#4A3F35]/55">
            {isEnglish
              ? "Moodify brings your check-ins, reflections, and emotional patterns into one calm space."
              : "Moodify menyatukan check-in, refleksi, dan pola emosimu dalam satu ruang yang tenang."}
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<WellbeingIcon className="h-5 w-5" />}
            number="01"
            title={
              isEnglish
                ? "Daily check-in"
                : "Check-in harian"
            }
            description={
              isEnglish
                ? "Choose the emotions that feel closest to you and add context when you want to."
                : "Pilih emosi yang paling mendekati perasaanmu dan tambahkan konteks jika kamu mau."
            }
          />

          <FeatureCard
            icon={<DiaryIcon className="h-5 w-5" />}
            number="02"
            title={
              isEnglish
                ? "Digital diary"
                : "Diary digital"
            }
            description={
              isEnglish
                ? "Write or record your thoughts so your experiences have a place to live."
                : "Tulis atau rekam ceritamu agar pengalamanmu punya ruang untuk disimpan."
            }
          />

          <FeatureCard
            icon={<InsightIcon className="h-5 w-5" />}
            number="03"
            title={
              isEnglish
                ? "AI reflection"
                : "Refleksi dengan AI"
            }
            description={
              isEnglish
                ? "Receive gentle reflections based on the content you choose to submit."
                : "Dapatkan refleksi berdasarkan konten yang kamu pilih untuk dikirim."
            }
          />

          <FeatureCard
            icon={<InsightIcon className="h-5 w-5" />}
            number="04"
            title={
              isEnglish
                ? "Emotional insights"
                : "Insight emosional"
            }
            description={
              isEnglish
                ? "Look back at your emotional rhythm and notice recurring patterns."
                : "Lihat kembali ritme emosimu dan perhatikan pola yang berulang."
            }
          />

          <FeatureCard
            icon={<PrivacyIcon className="h-5 w-5" />}
            number="05"
            title={
              isEnglish
                ? "Privacy controls"
                : "Kontrol privasi"
            }
            description={
              isEnglish
                ? "Manage your personal data with export and deletion controls."
                : "Kelola data pribadimu dengan kontrol export dan penghapusan."
            }
          />

          <FeatureCard
            icon={<ActivityIcon className="h-5 w-5" />}
            number="06"
            title={
              isEnglish
                ? "Gentle activities"
                : "Aktivitas yang tenang"
            }
            description={
              isEnglish
                ? "Find simple activities for moments when you need a pause."
                : "Temukan aktivitas sederhana saat kamu membutuhkan jeda."
            }
          />
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================== */}

      <section
        id="how-it-works"
        className="scroll-mt-24 bg-[#5C6B9C] text-[#FDFBF7]"
      >
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10 lg:py-28">
          <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#FBC4AB]">
                {isEnglish
                  ? "Simple by design"
                  : "Sederhana sejak awal"}
              </p>

              <h2 className="mt-4 text-[34px] font-semibold tracking-[-0.045em] sm:text-[44px]">
                {isEnglish
                  ? "A few minutes for yourself."
                  : "Beberapa menit untuk dirimu sendiri."}
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
                {isEnglish
                  ? "You don't need to figure everything out at once. Start with one honest check-in."
                  : "Kamu tidak perlu memahami semuanya sekaligus. Mulai saja dari satu check-in yang jujur."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StepCard
                number="01"
                title={
                  isEnglish
                    ? "Check in"
                    : "Check-in"
                }
                description={
                  isEnglish
                    ? "Tell Moodify what you are feeling today."
                    : "Ceritakan apa yang kamu rasakan hari ini."
                }
              />

              <StepCard
                number="02"
                title={
                  isEnglish
                    ? "Reflect"
                    : "Refleksi"
                }
                description={
                  isEnglish
                    ? "Write a thought or let your feelings speak."
                    : "Tulis ceritamu atau ungkapkan apa yang kamu rasakan."
                }
              />

              <StepCard
                number="03"
                title={
                  isEnglish
                    ? "Understand"
                    : "Pahami"
                }
                description={
                  isEnglish
                    ? "Look at patterns and gentle insights over time."
                    : "Lihat pola dan insight emosimu dari waktu ke waktu."
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          PRIVACY
      ========================================================== */}

      <section
        id="privacy"
        className="scroll-mt-24 border-b border-[#4A3F35]/[0.07]"
      >
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
          <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            {/* LEFT */}

            <div className="relative overflow-hidden rounded-[30px] bg-[#C1D5C0]/35 p-8 sm:p-10">
              <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/30" />

              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/75">
                  <LockKeyhole
                    className="h-5 w-5 text-[#5C6B9C]"
                    strokeWidth={1.8}
                  />
                </div>

                <h3 className="mt-7 text-2xl font-semibold tracking-[-0.03em]">
                  {isEnglish
                    ? "Your feelings deserve a private space."
                    : "Perasaanmu layak punya ruang yang privat."}
                </h3>

                <p className="mt-4 text-sm leading-7 text-[#4A3F35]/60">
                  {isEnglish
                    ? "Moodify is designed around personal reflection. Your diary and emotional data are connected to your account and should be treated as personal information."
                    : "Moodify dirancang untuk refleksi pribadi. Diary dan data emosimu terhubung dengan akunmu dan perlu diperlakukan sebagai informasi pribadi."}
                </p>
              </div>
            </div>

            {/* RIGHT */}

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5C6B9C]">
                {isEnglish
                  ? "Privacy first"
                  : "Privasi terlebih dahulu"}
              </p>

              <h2 className="mt-4 text-[34px] font-semibold tracking-[-0.045em] sm:text-[44px]">
                {isEnglish
                  ? "Built to feel personal, not exposed."
                  : "Dibuat terasa personal, bukan terbuka untuk semua."}
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-[#4A3F35]/55">
                {isEnglish
                  ? "You decide what you share with Moodify. The experience is designed to help you reflect without turning your private moments into something public."
                  : "Kamu yang menentukan apa yang ingin kamu bagikan dengan Moodify. Pengalaman ini dirancang untuk membantumu berefleksi tanpa menjadikan momen pribadimu sesuatu yang terbuka."}
              </p>

              <div className="mt-8 space-y-4">
                <PrivacyPoint
                  text={
                    isEnglish
                      ? "Your diary stays connected to your account."
                      : "Diary kamu tetap terhubung dengan akunmu."
                  }
                />

                <PrivacyPoint
                  text={
                    isEnglish
                      ? "You can review and manage your personal data."
                      : "Kamu bisa melihat dan mengelola data pribadimu."
                  }
                />

                <PrivacyPoint
                  text={
                    isEnglish
                      ? "AI reflections are based on content you submit."
                      : "Refleksi AI berdasarkan konten yang kamu kirim."
                  }
                />
              </div>

              <Link
                href={`/${typedLocale}/register`}
                className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-[#5C6B9C] transition hover:text-[#4A3F35]"
              >
                {isEnglish
                  ? "Create your private space"
                  : "Buat ruang pribadimu"}

                <ArrowRight
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================== */}

      <section>
        <div className="mx-auto max-w-5xl px-5 py-24 text-center sm:px-8 lg:py-32">
          <div className="mx-auto flex  items-center justify-center">
            <Image src="/Moodify-logo.png" alt="Moodify" width={170} height={52} className="h-24 w-auto object-contain" />
          </div>

          <h2 className="mx-auto mt-7 max-w-3xl text-[36px] font-semibold leading-tight tracking-[-0.05em] sm:text-[50px]">
            {isEnglish
              ? "Start listening to yourself."
              : "Mulai dengarkan dirimu sendiri."}
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#4A3F35]/55">
            {isEnglish
              ? "One check-in can be the beginning of understanding what you need."
              : "Satu check-in bisa menjadi awal untuk memahami apa yang sebenarnya kamu butuhkan."}
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={`/${typedLocale}/register`}
              className="group inline-flex h-12 items-center justify-center gap-3 rounded-xl bg-[#E2725B] px-7 text-sm font-semibold text-white transition hover:bg-[#4A3F35]"
            >
              {isEnglish
                ? "Create your account"
                : "Buat akun sekarang"}

              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                strokeWidth={1.8}
              />
            </Link>

            <Link
              href={`/${typedLocale}/login`}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-[#4A3F35]/10 bg-white px-7 text-sm font-medium text-[#4A3F35]/70 transition hover:border-[#5C6B9C]/20 hover:text-[#4A3F35]"
            >
              {isEnglish
                ? "Login to Moodify"
                : "Masuk ke Moodify"}
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================== */}

      <footer className="border-t border-[#4A3F35]/[0.07] bg-white/40">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            {/* BRAND */}

            <div className="max-w-xs">
              <Link
                href={`/${typedLocale}`}
                className="inline-flex items-center"
              >
                <Image
                  src="/Moodify-logo.png"
                  alt="Moodify"
                  width={130}
                  height={40}
                  className="h-8 w-auto object-contain"
                />
              </Link>

              <p className="mt-4 text-xs leading-6 text-[#4A3F35]/45">
                {isEnglish
                  ? "A gentle space to check in, reflect, and understand your emotional wellbeing."
                  : "Ruang yang tenang untuk check-in, berefleksi, dan memahami wellbeing emosionalmu."}
              </p>
            </div>

            {/* LINKS */}

            <div className="grid grid-cols-2 gap-x-14 gap-y-8 sm:grid-cols-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4A3F35]/35">
                  {isEnglish ? "Product" : "Produk"}
                </p>

                <div className="mt-4 space-y-3">
                  <a
                    href="#features"
                    className="block text-xs text-[#4A3F35]/55 transition hover:text-[#4A3F35]"
                  >
                    {isEnglish ? "Features" : "Fitur"}
                  </a>

                  <a
                    href="#how-it-works"
                    className="block text-xs text-[#4A3F35]/55 transition hover:text-[#4A3F35]"
                  >
                    {isEnglish
                      ? "How it works"
                      : "Cara kerja"}
                  </a>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4A3F35]/35">
                  {isEnglish ? "Account" : "Akun"}
                </p>

                <div className="mt-4 space-y-3">
                  <Link
                    href={`/${typedLocale}/login`}
                    className="block text-xs text-[#4A3F35]/55 transition hover:text-[#4A3F35]"
                  >
                    {isEnglish ? "Login" : "Masuk"}
                  </Link>

                  <Link
                    href={`/${typedLocale}/register`}
                    className="block text-xs text-[#4A3F35]/55 transition hover:text-[#4A3F35]"
                  >
                    {isEnglish ? "Register" : "Daftar"}
                  </Link>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4A3F35]/35">
                  {isEnglish ? "Language" : "Bahasa"}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href="/id"
                    className={`rounded-lg px-2.5 py-1.5 text-xs transition ${
                      !isEnglish
                        ? "bg-[#5C6B9C]/10 font-semibold text-[#5C6B9C]"
                        : "text-[#4A3F35]/45 hover:text-[#4A3F35]"
                    }`}
                  >
                    ID
                  </Link>

                  <Link
                    href="/en"
                    className={`rounded-lg px-2.5 py-1.5 text-xs transition ${
                      isEnglish
                        ? "bg-[#5C6B9C]/10 font-semibold text-[#5C6B9C]"
                        : "text-[#4A3F35]/45 hover:text-[#4A3F35]"
                    }`}
                  >
                    EN
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-[#4A3F35]/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] text-[#4A3F35]/35">
              © {new Date().getFullYear()} Moodify.{" "}
              {isEnglish
                ? "All rights reserved."
                : "Semua hak dilindungi."}
            </p>

            <div className="flex items-center gap-2 text-[10px] text-[#4A3F35]/35">
              <PrivacyIcon className="h-3 w-3" />

              <span>
                {isEnglish
                  ? "Your wellbeing, your space."
                  : "Wellbeing kamu, ruang kamu."}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ===============================================================
   TRUST ITEM
================================================================ */

function TrustItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 border-b border-[#4A3F35]/[0.07] px-5 py-6 last:border-b-0 sm:px-8 md:border-b-0 md:border-r md:last:border-r-0 lg:px-10">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#5C6B9C]/[0.07] text-[#5C6B9C]">
        {icon}
      </div>

      <div>
        <p className="text-xs font-semibold">
          {title}
        </p>

        <p className="mt-1 text-[11px] leading-5 text-[#4A3F35]/45">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ===============================================================
   FEATURE CARD
================================================================ */

function FeatureCard({
  icon,
  number,
  title,
  description,
}: {
  icon: React.ReactNode;
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-[26px] border border-[#4A3F35]/[0.07] bg-white/60 p-7 transition duration-300 hover:-translate-y-0.5 hover:border-[#5C6B9C]/15 hover:bg-white hover:shadow-[0_22px_60px_rgba(74,63,53,0.08)]">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5C6B9C]/[0.07] text-[#5C6B9C] transition group-hover:bg-[#5C6B9C] group-hover:text-white">
          {icon}
        </div>

        <span className="text-[10px] font-semibold tracking-[0.12em] text-[#4A3F35]/20">
          {number}
        </span>
      </div>

      <h3 className="mt-6 text-base font-semibold tracking-[-0.02em]">
        {title}
      </h3>

      <p className="mt-3 text-xs leading-6 text-[#4A3F35]/50">
        {description}
      </p>
    </div>
  );
}

/* ===============================================================
   STEP CARD
================================================================ */

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.08] p-6">
      <span className="text-[10px] font-semibold tracking-[0.12em] text-[#FBC4AB]">
        {number}
      </span>

      <h3 className="mt-6 text-base font-semibold">
        {title}
      </h3>

      <p className="mt-3 text-xs leading-6 text-white/55">
        {description}
      </p>
    </div>
  );
}

/* ===============================================================
   PRIVACY POINT
================================================================ */

function PrivacyPoint({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C1D5C0]/50">
        <Check
          className="h-3 w-3 text-[#4A3F35]"
          strokeWidth={2}
        />
      </div>

      <p className="text-sm text-[#4A3F35]/60">
        {text}
      </p>
    </div>
  );
}