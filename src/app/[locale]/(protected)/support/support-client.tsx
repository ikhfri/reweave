"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  Heart,
  LifeBuoy,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

import type { Locale } from "@/i18n/config";

type Props = {
  locale: Locale;
  userName: string;
};

export default function SupportClient({
  locale,
  userName,
}: Props) {
  const isEnglish = locale === "en";

  const resources = [
    {
      number: "01",
      icon: Heart,
      title: isEnglish
        ? "Take a moment to breathe"
        : "Berhenti sebentar untuk bernapas",
      description: isEnglish
        ? "Try a short breathing exercise when you need to slow down and reconnect with yourself."
        : "Coba latihan pernapasan singkat saat kamu perlu memperlambat langkah dan kembali terhubung dengan dirimu.",
      href: `/${locale}/activities`,
      label: isEnglish ? "Try an activity" : "Coba aktivitas",
    },
    {
      number: "02",
      icon: BookOpen,
      title: isEnglish
        ? "Put your thoughts into words"
        : "Tuangkan pikiranmu",
      description: isEnglish
        ? "Writing can give you a little space to understand what you are feeling and experiencing."
        : "Menulis dapat memberi ruang untuk memahami apa yang sedang kamu rasakan dan alami.",
      href: `/${locale}/diary`,
      label: isEnglish ? "Open your diary" : "Buka diary",
    },
    {
      number: "03",
      icon: MessageCircle,
      title: isEnglish
        ? "Look at your patterns"
        : "Lihat pola emosimu",
      description: isEnglish
        ? "Review your check-ins and insights to notice patterns that may be worth paying attention to."
        : "Lihat kembali check-in dan insight untuk menemukan pola yang mungkin perlu kamu perhatikan.",
      href: `/${locale}/insights`,
      label: isEnglish ? "View insights" : "Lihat insights",
    },
  ];

  return (
    <main className="min-h-full bg-[#fdfbf7] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-6xl text-[#4a3f35]">

        {/* ================================================= */}
        {/* HEADER                                            */}
        {/* ================================================= */}

        <header className="mb-12 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#5c6b9c]">
            {isEnglish
              ? "A space to lean on"
              : "Ruang untuk bersandar"}
          </p>

          <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#4a3f35] sm:text-4xl">
            {isEnglish
              ? `You don't have to figure everything out alone, ${userName}.`
              : `Kamu tidak harus memahami semuanya sendirian, ${userName}.`}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#4a3f35]/60 sm:text-[15px]">
            {isEnglish
              ? "Whether you need a quiet moment, a place to write, or a little help understanding your patterns, start wherever feels right."
              : "Entah kamu butuh waktu untuk menenangkan diri, tempat untuk menulis, atau bantuan memahami pola emosimu, mulai dari mana pun yang terasa tepat."}
          </p>
        </header>

        {/* ================================================= */}
        {/* SUPPORT MESSAGE                                   */}
        {/* ================================================= */}

        <section className="relative mb-14 overflow-hidden rounded-[2rem] bg-[#fbc4ab]/35 p-6 sm:p-8 lg:p-10">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#fdfbf7]/45" />

          <div className="absolute -bottom-24 right-28 h-44 w-44 rounded-full bg-[#c1d5c0]/25" />

          <div className="relative grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fdfbf7]/80">
              <LifeBuoy className="h-5 w-5 text-[#e2725b]" />
            </div>

            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c6b9c]">
                {isEnglish
                  ? "A gentle reminder"
                  : "Pengingat kecil"}
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#4a3f35] sm:text-3xl">
                {isEnglish
                  ? "You are allowed to ask for help."
                  : "Kamu boleh meminta bantuan."}
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#4a3f35]/70">
                {isEnglish
                  ? "Moodify can give you a place to reflect, but you never have to carry difficult moments by yourself. Reaching out to someone you trust can be an important step."
                  : "Moodify bisa menjadi tempat untuk berefleksi, tetapi kamu tidak harus menghadapi masa-masa sulit sendirian. Menghubungi seseorang yang kamu percaya bisa menjadi salah satu langkah penting."}
              </p>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* THREE PATHS                                       */}
        {/* ================================================= */}

        <section className="mb-14">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5c6b9c]">
              {isEnglish
                ? "Choose what you need"
                : "Pilih yang kamu butuhkan"}
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#4a3f35]">
              {isEnglish
                ? "Where would you like to start?"
                : "Kamu ingin mulai dari mana?"}
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#4a3f35]/55">
              {isEnglish
                ? "There is no right order. Choose the path that feels most useful today."
                : "Tidak ada urutan yang paling benar. Pilih jalan yang terasa paling berguna untukmu hari ini."}
            </p>
          </div>

          <div className="grid border-y border-[#4a3f35]/10 md:grid-cols-3">
            {resources.map((resource, index) => {
              const Icon = resource.icon;

              return (
                <Link
                  key={resource.number}
                  href={resource.href}
                  className={[
                    "group relative py-7 transition-colors hover:bg-[#fbc4ab]/10 md:px-6",
                    index !== resources.length - 1
                      ? "border-b border-[#4a3f35]/10 md:border-b-0 md:border-r"
                      : "",
                    index === 0
                      ? "md:pl-0"
                      : "",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-[11px] font-semibold tracking-[0.12em] text-[#4a3f35]/30">
                      {resource.number}
                    </span>

                    <Icon className="h-5 w-5 text-[#5c6b9c] transition-transform group-hover:scale-105" />
                  </div>

                  <h3 className="mt-8 max-w-xs text-lg font-semibold leading-snug text-[#4a3f35]">
                    {resource.title}
                  </h3>

                  <p className="mt-3 max-w-sm text-sm leading-6 text-[#4a3f35]/55">
                    {resource.description}
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#5c6b9c]">
                    {resource.label}

                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ================================================= */}
        {/* SAFETY                                            */}
        {/* ================================================= */}

        <section className="mb-14">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.5fr]">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c1d5c0]/35">
                <ShieldCheck className="h-5 w-5 text-[#5c6b9c]" />
              </div>

              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.15em] text-[#5c6b9c]">
                {isEnglish
                  ? "Your safety matters"
                  : "Keselamatanmu penting"}
              </p>

              <h2 className="mt-2 text-xl font-semibold text-[#4a3f35]">
                {isEnglish
                  ? "When you need more than an app"
                  : "Saat kamu membutuhkan lebih dari aplikasi"}
              </h2>
            </div>

            <div className="border-l-2 border-[#e2725b]/40 pl-5 sm:pl-7">
              <p className="text-sm leading-7 text-[#4a3f35]/70">
                {isEnglish
                  ? "If you feel that you may be in immediate danger or are unable to keep yourself safe, please contact your local emergency service or reach out to a trusted person who can stay with you."
                  : "Jika kamu merasa berada dalam bahaya atau tidak dapat menjaga keselamatan dirimu, segera hubungi layanan darurat setempat atau orang tepercaya yang dapat menemanimu."}
              </p>

              <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-[#4a3f35]/50">
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                <span>
                  {isEnglish
                    ? "Emergency services and crisis resources vary by location."
                    : "Layanan darurat dan sumber bantuan krisis berbeda berdasarkan lokasi."}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* FOOTNOTE                                          */}
        {/* ================================================= */}

        <footer className="border-t border-[#4a3f35]/10 pt-7">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c6b9c]">
              {isEnglish
                ? "About Moodify"
                : "Tentang Moodify"}
            </p>

            <p className="mt-2 text-xs leading-6 text-[#4a3f35]/50">
              {isEnglish
                ? "Moodify is designed as a reflection and wellbeing companion. It does not replace professional mental health care, diagnosis, or emergency services."
                : "Moodify dirancang sebagai teman untuk berefleksi dan menjaga wellbeing. Moodify tidak menggantikan bantuan profesional, diagnosis, maupun layanan darurat."}
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}