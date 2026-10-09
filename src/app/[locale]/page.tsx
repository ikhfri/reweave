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
      ========================================================= */}

      <header className="sticky top-0 z-50 border-b border-[#4A3F35]/6 bg-[#FDFBF7]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link
            href={`/${typedLocale}`}
            className="flex shrink-0 items-center"
            aria-label="Moodify"
          >
            <Image
              src="/moodify-logo.webp"
              alt="Moodify"
              width={150}
              height={45}
              priority
              className="h-15 w-auto object-contain"
            />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-[#4A3F35]/50 transition hover:text-[#4A3F35]"
            >
              {isEnglish ? "Inside" : "Isi"}
            </a>

            <a
              href="#how-it-works"
              className="text-sm text-[#4A3F35]/50 transition hover:text-[#4A3F35]"
            >
              {isEnglish ? "How it works" : "Cara kerja"}
            </a>

            <a
              href="#privacy"
              className="text-sm text-[#4A3F35]/50 transition hover:text-[#4A3F35]"
            >
              {isEnglish ? "Privacy" : "Privasi"}
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={`/${typedLocale}/login`}
              className="hidden rounded-xl px-4 py-2.5 text-sm text-[#4A3F35]/60 transition hover:bg-[#4A3F35]/4 hover:text-[#4A3F35] sm:inline-flex"
            >
              {isEnglish ? "Login" : "Masuk"}
            </Link>

            <Link
              href={`/${typedLocale}/register`}
              className="group inline-flex items-center gap-2 rounded-xl bg-[#5C6B9C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4A3F35]"
            >
              {isEnglish ? "Start free" : "Mulai gratis"}

              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO
      ========================================================= */}

      {/* HERO */}
<section className="relative overflow-hidden">
  <div className="pointer-events-none absolute -right-56 -top-48 h-150 w-150 rounded-full bg-[#FBC4AB]/25 blur-3xl" />

  <div className="pointer-events-none absolute -left-48 -bottom-45 h-130 w-130 rounded-full bg-[#C1D5C0]/25 blur-3xl" />

  <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-16 sm:px-8 sm:pt-20 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:pb-32 lg:pt-28">

    {/* COPY */}
    <div className="relative z-10 max-w-2xl">
      <div className="mb-7 flex items-center gap-3">
        <span className="h-px w-8 bg-[#E2725B]" />

        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4A3F35]/45">
          {isEnglish
            ? "A quieter place for your thoughts"
            : "Ruang kecil untuk pikiranmu"}
        </span>
      </div>

      <h1 className="max-w-175 text-[48px] font-semibold leading-[0.99] tracking-[-0.065em] sm:text-[62px] lg:text-[76px]">
        {isEnglish ? (
          <>
            Know what
            <br />
            you actually feel.
          </>
        ) : (
          <>
            Tahu apa yang
            <br />
            kamu rasakan.
          </>
        )}
      </h1>

      <p className="mt-7 max-w-xl text-[15px] leading-8 text-[#4A3F35]/58 sm:text-[16px]">
        {isEnglish
          ? "A private place to check in, write things down, and slowly understand the patterns behind your days."
          : "Tempat pribadi buat check-in, menulis, dan perlahan memahami pola yang muncul dari hari-harimu."}
      </p>

      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/${typedLocale}/register`}
          className="group inline-flex h-12 items-center justify-center gap-3 rounded-xl bg-[#E2725B] px-6 text-sm font-semibold text-white transition hover:bg-[#4A3F35]"
        >
          {isEnglish ? "Start free" : "Mulai gratis"}

          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          href={`/${typedLocale}/login`}
          className="inline-flex h-12 items-center justify-center rounded-xl border border-[#4A3F35]/10 bg-white/55 px-6 text-sm font-medium text-[#4A3F35]/65 transition hover:bg-white hover:text-[#4A3F35]"
        >
          {isEnglish
            ? "I already have an account"
            : "Sudah punya akun"}
        </Link>
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs text-[#4A3F35]/38">
        <LockKeyhole
          className="h-3.5 w-3.5"
          strokeWidth={1.7}
        />

        <span>
          {isEnglish
            ? "Your thoughts stay private."
            : "Pikiranmu tetap pribadi."}
        </span>
      </div>
    </div>

    {/* HERO VISUAL — PNG */}
    <div className="relative mx-auto w-full max-w-140 lg:ml-auto">
      <div className="pointer-events-none absolute -right-24 -top-20 h-80 w-80 rounded-full bg-[#FBC4AB]/30 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-16 -left-20 h-72 w-72 rounded-full bg-[#C1D5C0]/35 blur-3xl" />

      <div className="relative">
        <Image
          src="/hero-visual.png"
          alt={
            isEnglish
              ? "A quiet Moodify journal page"
              : "Halaman jurnal Moodify yang tenang"
          }
          width={900}
          height={900}
          priority
          className="
            relative z-10
            h-auto
            w-full
            object-contain
            drop-shadow-[0_35px_55px_rgba(74,63,53,0.14)]
          "
        />

       
      </div>
    </div>

  </div>
</section>

      {/* =========================================================
          INTRO / TRUST
      ========================================================= */}

      <section className="border-y border-[#4A3F35]/6 bg-[#F5EFE6]/45">
        <div className="mx-auto grid max-w-7xl md:grid-cols-3">
          <TrustItem
            number="01"
            icon={<WellbeingIcon className="h-4 w-4" />}
            title={isEnglish ? "Check in" : "Check-in"}
            description={
              isEnglish
                ? "Name what you feel without having to explain everything."
                : "Sebutkan apa yang kamu rasakan tanpa harus menjelaskan semuanya."
            }
          />

          <TrustItem
            number="02"
            icon={<DiaryIcon className="h-4 w-4" />}
            title={isEnglish ? "Put it down" : "Tuangkan"}
            description={
              isEnglish
                ? "Write a few words or let the whole story out."
                : "Tulis beberapa kata atau ceritakan semuanya."
            }
          />

          <TrustItem
            number="03"
            icon={<InsightIcon className="h-4 w-4" />}
            title={isEnglish ? "Look back" : "Lihat kembali"}
            description={
              isEnglish
                ? "Understand your days through patterns, not pressure."
                : "Pahami harimu lewat pola, bukan tekanan."
            }
          />
        </div>
      </section>

      {/* =========================================================
          FEATURES
      ========================================================= */}

      <section
        id="features"
        className="scroll-mt-24 px-5 py-24 sm:px-8 lg:px-10 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-7 bg-[#E2725B]" />

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5C6B9C]">
                  {isEnglish ? "Inside Moodify" : "Di dalam Moodify"}
                </p>
              </div>

              <h2 className="mt-5 max-w-lg text-[38px] font-semibold leading-[1.04] tracking-tighter sm:text-[50px]">
                {isEnglish
                  ? "A little space to understand yourself."
                  : "Sedikit ruang untuk memahami dirimu."}
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-[#4A3F35]/52">
                {isEnglish
                  ? "Nothing complicated. Just a few tools that make it easier to notice what is happening inside your days."
                  : "Tidak ada yang rumit. Hanya beberapa hal sederhana untuk membantu melihat apa yang sedang terjadi di dalam hari-harimu."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <EditorialFeature
                number="01"
                icon={<WellbeingIcon className="h-5 w-5" />}
                title={isEnglish ? "Daily check-in" : "Check-in harian"}
                description={
                  isEnglish
                    ? "Choose the feeling that comes closest. Add context when you want."
                    : "Pilih perasaan yang paling mendekati. Tambahkan konteks kalau kamu mau."
                }
              />

              <EditorialFeature
                number="02"
                icon={<DiaryIcon className="h-5 w-5" />}
                title={isEnglish ? "Personal diary" : "Diary pribadi"}
                description={
                  isEnglish
                    ? "Write, record, or simply leave a few words for yourself."
                    : "Tulis, rekam, atau tinggalkan beberapa kata untuk dirimu sendiri."
                }
              />

              <EditorialFeature
                number="03"
                icon={<InsightIcon className="h-5 w-5" />}
                title={isEnglish ? "Reflections" : "Refleksi"}
                description={
                  isEnglish
                    ? "See small observations from what you choose to share."
                    : "Lihat pengamatan kecil dari apa yang kamu pilih untuk dibagikan."
                }
              />

              <EditorialFeature
                number="04"
                icon={<ActivityIcon className="h-5 w-5" />}
                title={isEnglish ? "Gentle activities" : "Aktivitas ringan"}
                description={
                  isEnglish
                    ? "Simple things to try when you need to pause for a moment."
                    : "Hal sederhana yang bisa dicoba saat kamu butuh berhenti sejenak."
                }
              />
            </div>
          </div>

          {/* Wide editorial card */}

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="relative min-h-70 overflow-hidden rounded-[30px] bg-[#5C6B9C] p-8 text-[#FDFBF7] sm:p-10">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full border border-white/10" />

              <div className="absolute right-16 top-16 h-24 w-24 rounded-full border border-[#FBC4AB]/30" />

              <div className="relative max-w-lg">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#FBC4AB]">
                  {isEnglish ? "Your history" : "Riwayatmu"}
                </span>

                <h3 className="mt-5 text-[30px] font-semibold leading-tight tracking-[-0.04em] sm:text-[38px]">
                  {isEnglish
                    ? "Today is only one page."
                    : "Hari ini hanya satu halaman."}
                </h3>

                <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
                  {isEnglish
                    ? "Moodify helps you look at the pages around it, so you can notice what keeps appearing over time."
                    : "Moodify membantumu melihat halaman-halaman di sekitarnya, supaya kamu bisa memperhatikan apa yang terus muncul dari waktu ke waktu."}
                </p>
              </div>

              {/* abstract lines */}

              <div className="absolute bottom-8 right-8 hidden w-48 sm:block">
                <div className="flex items-end gap-2">
                  <div className="h-8 flex-1 rounded-t-full bg-white/15" />
                  <div className="h-14 flex-1 rounded-t-full bg-[#FBC4AB]/35" />
                  <div className="h-10 flex-1 rounded-t-full bg-white/20" />
                  <div className="h-20 flex-1 rounded-t-full bg-[#FBC4AB]/50" />
                  <div className="h-12 flex-1 rounded-t-full bg-white/15" />
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[30px] border border-[#4A3F35]/[0.07] bg-[#F5EFE6] p-8 sm:p-10">
              <div className="absolute -bottom-12 -right-12 h-36 w-36 rounded-full bg-[#C1D5C0]/60" />

              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/75 text-[#5C6B9C]">
                  <PrivacyIcon className="h-5 w-5" />
                </div>

                <h3 className="mt-7 text-2xl font-semibold tracking-[-0.035em]">
                  {isEnglish ? "Yours means yours." : "Punyamu tetap milikmu."}
                </h3>

                <p className="mt-4 text-sm leading-7 text-[#4A3F35]/52">
                  {isEnglish
                    ? "Your journal is not a public feed. It belongs to your account."
                    : "Diary-mu bukan feed publik. Semuanya terhubung ke akunmu."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}

      <section
        id="how-it-works"
        className="scroll-mt-24 border-y border-[#4A3F35]/6 bg-[#F1E9DB]"
      >
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-7 bg-[#5C6B9C]" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5C6B9C]">
                {isEnglish ? "A simple ritual" : "Ritual sederhana"}
              </p>
            </div>

            <h2 className="mt-5 text-[38px] font-semibold leading-[1.04] tracking-tighter sm:text-[50px]">
              {isEnglish
                ? "No complicated routine."
                : "Tidak perlu rutinitas yang rumit."}
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-7 text-[#4A3F35]/52">
              {isEnglish
                ? "Open Moodify when you have a moment. Start wherever you are."
                : "Buka Moodify saat kamu punya waktu sebentar. Mulai dari mana pun kamu berada."}
            </p>
          </div>

          <div className="relative mt-16">
            {/* timeline */}

            <div className="absolute left-5 top-7 hidden h-px w-[calc(100%-40px)] bg-[#4A3F35]/10 md:block" />

            <div className="grid gap-12 md:grid-cols-3 md:gap-8">
              <TimelineStep
                number="01"
                title={isEnglish ? "Check in" : "Check-in"}
                description={
                  isEnglish
                    ? "Start with one question: how am I feeling right now?"
                    : "Mulai dengan satu pertanyaan: bagaimana perasaanku sekarang?"
                }
              />

              <TimelineStep
                number="02"
                title={isEnglish ? "Put it into words" : "Tuangkan"}
                description={
                  isEnglish
                    ? "Write as little or as much as you need. There is no right amount."
                    : "Tulis sedikit atau sebanyak yang kamu butuhkan. Tidak ada jumlah yang benar."
                }
              />

              <TimelineStep
                number="03"
                title={isEnglish ? "Notice" : "Perhatikan"}
                description={
                  isEnglish
                    ? "Come back later and see what your days have been trying to tell you."
                    : "Kembali lagi nanti dan lihat apa yang sedang coba dikatakan oleh hari-harimu."
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          PRIVACY
      ========================================================= */}

      <section
        id="privacy"
        className="scroll-mt-24 border-b border-[#4A3F35]/6"
      >
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
          <div className="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
            {/* Privacy visual */}

            <div className="relative min-h-100 overflow-hidden rounded-[34px] bg-[#C1D5C0]/40 p-8 sm:p-10">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/30" />

              <div className="absolute -bottom-20 -left-10 h-52 w-52 rounded-full border-25 border-white/20" />

              <div className="relative flex min-h-82.5 items-center justify-center">
                <div className="relative w-full max-w-77.5 -rotate-3 rounded-[7px] bg-[#FFFDF8] p-7 shadow-[0_25px_60px_rgba(74,63,53,0.12)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#4A3F35]/30">
                      {isEnglish ? "Personal" : "Pribadi"}
                    </span>

                    <LockKeyhole
                      className="h-4 w-4 text-[#5C6B9C]"
                      strokeWidth={1.7}
                    />
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="h-2 w-[82%] rounded-full bg-[#4A3F35]/[0.07]" />
                    <div className="h-2 w-[92%] rounded-full bg-[#4A3F35]/[0.07]" />
                    <div className="h-2 w-[66%] rounded-full bg-[#4A3F35]/[0.07]" />
                    <div className="h-2 w-[86%] rounded-full bg-[#4A3F35]/[0.07]" />
                  </div>

                  <div className="mt-10 flex items-center justify-between border-t border-[#4A3F35]/[0.07] pt-5">
                    <span className="text-[9px] text-[#4A3F35]/35">
                      {isEnglish
                        ? "Only visible to you"
                        : "Hanya terlihat olehmu"}
                    </span>

                    <div className="h-2 w-2 rounded-full bg-[#C1D5C0]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy copy */}

            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-7 bg-[#5C6B9C]" />

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5C6B9C]">
                  {isEnglish ? "Privacy" : "Privasi"}
                </p>
              </div>

              <h2 className="mt-5 max-w-xl text-[38px] font-semibold leading-[1.04] tracking-tighter sm:text-[50px]">
                {isEnglish
                  ? "Some thoughts are meant to stay yours."
                  : "Ada hal yang memang cukup menjadi milikmu."}
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-7 text-[#4A3F35]/52">
                {isEnglish
                  ? "Your diary and check-ins are connected to your account. They are not a public timeline and are not shared with other users."
                  : "Diary dan check-inmu terhubung ke akunmu. Bukan timeline publik dan tidak dibagikan kepada pengguna lain."}
              </p>

              <div className="mt-9 space-y-4">
                <PrivacyPoint
                  text={
                    isEnglish
                      ? "Your entries stay attached to your account."
                      : "Catatan tetap terhubung dengan akunmu."
                  }
                />

                <PrivacyPoint
                  text={
                    isEnglish
                      ? "You can export or delete your data."
                      : "Kamu bisa export atau menghapus datamu."
                  }
                />

                <PrivacyPoint
                  text={
                    isEnglish
                      ? "AI reflections only use what you choose to submit."
                      : "Refleksi AI hanya menggunakan apa yang kamu pilih untuk dikirim."
                  }
                />
              </div>

              <Link
                href={`/${typedLocale}/register`}
                className="group mt-9 inline-flex items-center gap-2 text-sm font-semibold text-[#5C6B9C] transition hover:text-[#4A3F35]"
              >
                {isEnglish ? "Create your space" : "Buat ruangmu"}

                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  strokeWidth={1.8}
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-105 w-105 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FBC4AB]/20 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-5 py-28 text-center sm:px-8 lg:py-36">
          <div className="mx-auto flex items-center justify-center">
            <Image
              src="/moodify-logo.png"
              alt="Moodify"
              width={170}
              height={52}
              className="h-20 w-auto object-contain"
            />
          </div>

          <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5C6B9C]">
            {isEnglish ? "One page at a time" : "Satu halaman setiap kali"}
          </p>

          <h2 className="mx-auto mt-5 max-w-3xl text-[40px] font-semibold leading-[1.02] tracking-[-0.055em] sm:text-[58px]">
            {isEnglish
              ? "Start with how you feel today."
              : "Mulai dari apa yang kamu rasakan hari ini."}
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[#4A3F35]/52">
            {isEnglish
              ? "No long setup. No perfect words. Just a small place to be honest with yourself."
              : "Tidak perlu setup panjang. Tidak perlu kata-kata sempurna. Hanya ruang kecil untuk jujur pada diri sendiri."}
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={`/${typedLocale}/register`}
              className="group inline-flex h-12 items-center justify-center gap-3 rounded-xl bg-[#E2725B] px-7 text-sm font-semibold text-white transition hover:bg-[#4A3F35]"
            >
              {isEnglish ? "Create account" : "Buat akun"}

              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                strokeWidth={1.8}
              />
            </Link>

            <Link
              href={`/${typedLocale}/login`}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-[#4A3F35]/10 bg-white px-7 text-sm font-medium text-[#4A3F35]/65 transition hover:border-[#5C6B9C]/20 hover:text-[#4A3F35]"
            >
              {isEnglish ? "Login" : "Masuk"}
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="border-t border-[#4A3F35]/6 bg-[#F5EFE6]/40">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            <div className="max-w-xs">
              <Link
                href={`/${typedLocale}`}
                className="inline-flex items-center"
              >
                <Image
                  src="/moodify-logo.webp"
                  alt="Moodify"
                  width={130}
                  height={40}
                  className="h-16 w-auto object-contain"
                />
              </Link>

              <p className="mt-4 text-xs leading-6 text-[#4A3F35]/42">
                {isEnglish
                  ? "A quiet place to check in, write things down, and understand your days."
                  : "Ruang tenang untuk check-in, menulis, dan memahami hari-harimu."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-14 gap-y-8 sm:grid-cols-3">
              <FooterColumn
                title={isEnglish ? "Explore" : "Jelajahi"}
                links={[
                  {
                    href: "#features",
                    label: isEnglish ? "Inside" : "Isi",
                  },
                  {
                    href: "#how-it-works",
                    label: isEnglish ? "How it works" : "Cara kerja",
                  },
                  {
                    href: "#privacy",
                    label: isEnglish ? "Privacy" : "Privasi",
                  },
                ]}
              />

              <FooterColumn
                title={isEnglish ? "Account" : "Akun"}
                links={[
                  {
                    href: `/${typedLocale}/login`,
                    label: isEnglish ? "Login" : "Masuk",
                  },
                  {
                    href: `/${typedLocale}/register`,
                    label: isEnglish ? "Register" : "Daftar",
                  },
                ]}
              />

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4A3F35]/30">
                  {isEnglish ? "Language" : "Bahasa"}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href="/id"
                    className={`rounded-lg px-2.5 py-1.5 text-xs transition ${
                      !isEnglish
                        ? "bg-[#5C6B9C]/10 font-semibold text-[#5C6B9C]"
                        : "text-[#4A3F35]/40 hover:text-[#4A3F35]"
                    }`}
                  >
                    ID
                  </Link>

                  <Link
                    href="/en"
                    className={`rounded-lg px-2.5 py-1.5 text-xs transition ${
                      isEnglish
                        ? "bg-[#5C6B9C]/10 font-semibold text-[#5C6B9C]"
                        : "text-[#4A3F35]/40 hover:text-[#4A3F35]"
                    }`}
                  >
                    EN
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#4A3F35]/6 pt-6 text-center sm:flex-row sm:text-left">
            <p className="text-[10px] text-[#4A3F35]/30">
              © {new Date().getFullYear()} Moodify.{" "}
              {isEnglish
                ? "All rights reserved."
                : "Semua hak dilindungi."}
            </p>

            <div className="flex items-center gap-2 text-[10px] text-[#4A3F35]/30">
              <PrivacyIcon className="h-3 w-3" />

              <span>
                {isEnglish
                  ? "Your data stays with you."
                  : "Datamu tetap milikmu."}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* =========================================================
   TRUST ITEM
========================================================= */

function TrustItem({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group flex gap-4 border-b border-[#4A3F35]/[0.07] px-5 py-7 last:border-b-0 sm:px-8 md:border-b-0 md:border-r md:last:border-r-0 lg:px-10">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#4A3F35]/10 bg-[#FDFBF7] text-[#5C6B9C]">
        {icon}
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-semibold tracking-[0.12em] text-[#E2725B]">
            {number}
          </span>

          <p className="text-xs font-semibold">{title}</p>
        </div>

        <p className="mt-1.5 max-w-xs text-[11px] leading-5 text-[#4A3F35]/43">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   EDITORIAL FEATURE
========================================================= */

function EditorialFeature({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative rounded-[26px] border border-[#4A3F35]/[0.07] bg-white/55 p-7 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_20px_55px_rgba(74,63,53,0.07)]">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5EFE6] text-[#5C6B9C] transition group-hover:bg-[#5C6B9C] group-hover:text-white">
          {icon}
        </div>

        <span className="text-[9px] font-semibold tracking-[0.16em] text-[#4A3F35]/20">
          {number}
        </span>
      </div>

      <h3 className="mt-7 text-base font-semibold tracking-[-0.02em]">
        {title}
      </h3>

      <p className="mt-3 text-xs leading-6 text-[#4A3F35]/48">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   TIMELINE STEP
========================================================= */

function TimelineStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative">
      <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#4A3F35]/10 bg-[#F1E9DB]">
        <span className="text-[10px] font-semibold tracking-[0.12em] text-[#5C6B9C]">
          {number}
        </span>
      </div>

      <div className="mt-7">
        <h3 className="text-xl font-semibold tracking-tight">
          {title}
        </h3>

        <p className="mt-3 max-w-xs text-sm leading-7 text-[#4A3F35]/50">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   PRIVACY POINT
========================================================= */

function PrivacyPoint({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C1D5C0]/55">
        <Check
          className="h-3 w-3 text-[#4A3F35]"
          strokeWidth={2}
        />
      </div>

      <p className="text-sm text-[#4A3F35]/58">
        {text}
      </p>
    </div>
  );
}

/* =========================================================
   FOOTER COLUMN
========================================================= */

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: {
    href: string;
    label: string;
  }[];
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4A3F35]/30">
        {title}
      </p>

      <div className="mt-4 space-y-3">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="block text-xs text-[#4A3F35]/48 transition hover:text-[#4A3F35]"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
