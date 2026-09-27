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

export default function SupportClient({ locale, userName }: Props) {
  const isEnglish = locale === "en";

  const resources = [
    {
      icon: Heart,
      title: isEnglish ? "Take a moment to breathe" : "Luangkan waktu untuk bernapas",
      description: isEnglish
        ? "Try a short breathing exercise when you need to slow down and reconnect with yourself."
        : "Coba latihan pernapasan singkat saat kamu perlu menenangkan diri dan kembali terhubung dengan dirimu.",
      href: `/${locale}/activities`,
    },
    {
      icon: BookOpen,
      title: isEnglish ? "Write your thoughts" : "Tulis pikiranmu",
      description: isEnglish
        ? "Putting your thoughts into words can help you reflect on what you are experiencing."
        : "Menuangkan pikiran ke dalam tulisan dapat membantu kamu merefleksikan apa yang sedang kamu alami.",
      href: `/${locale}/diary`,
    },
    {
      icon: MessageCircle,
      title: isEnglish ? "Understand your patterns" : "Pahami pola emosimu",
      description: isEnglish
        ? "Review your emotional insights and notice patterns across your check-ins."
        : "Lihat kembali insight emosional dan perhatikan pola dari check-in kamu.",
      href: `/${locale}/insights`,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-10 text-[#4A3F35] pb-12">
      {/* Header Section */}
      <section className="pt-6">
        <p className="text-sm font-semibold tracking-wide text-[#5C6B9C] uppercase">
          {isEnglish ? "Support" : "Dukungan"}
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#4A3F35] sm:text-4xl">
          {isEnglish
            ? `How can we support you, ${userName}?`
            : `Bagaimana kami bisa mendukungmu, ${userName}?`}
        </h1>

        <p className="mt-3 max-w-2xl text-base text-[#4A3F35]/70">
          {isEnglish
            ? "Explore resources that may help you take care of your emotional wellbeing."
            : "Jelajahi berbagai sumber yang dapat membantu kamu menjaga kesejahteraan emosional."}
        </p>
      </section>

      {/* Main Notice Banner */}
      <section className="rounded-lg border border-[#fbc4ab]/60 bg-[#fbc4ab]/15 p-6 sm:p-8">
        <div className="flex max-w-3xl items-start gap-4">
          <LifeBuoy className="h-6 w-6 shrink-0 text-[#e2725b] mt-1" strokeWidth={2} />
          
          <div>
            <h2 className="text-xl font-bold text-[#4A3F35]">
              {isEnglish
                ? "You don't have to handle everything alone."
                : "Kamu tidak harus menghadapi semuanya sendirian."}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-[#4A3F35]/80">
              {isEnglish
                ? "Moodify is designed to help you reflect and understand your emotions. It is not a replacement for professional mental health care."
                : "Moodify dirancang untuk membantu kamu berefleksi dan memahami emosi. Moodify bukan pengganti bantuan profesional di bidang kesehatan mental."}
            </p>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section>
        <div className="mb-6 flex flex-col">
          <h2 className="text-lg font-bold text-[#4A3F35]">
            {isEnglish ? "Things you can try" : "Hal yang bisa kamu coba"}
          </h2>
          <p className="mt-1 text-sm text-[#4A3F35]/60">
            {isEnglish
              ? "Choose something that feels useful right now."
              : "Pilih sesuatu yang terasa berguna untukmu saat ini."}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {resources.map((resource) => {
            const Icon = resource.icon;

            return (
              <Link
                key={resource.title}
                href={resource.href}
                className="group flex flex-col justify-between rounded-lg border border-[#c1d5c0]/70 bg-white p-6 transition-colors hover:border-[#5C6B9C]/50 hover:bg-gray-50/50"
              >
                <div>
                  <Icon className="h-6 w-6 text-[#e2725b]" strokeWidth={2} />
                  <h3 className="mt-5 text-base font-bold text-[#4A3F35]">
                    {resource.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#4A3F35]/70">
                    {resource.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-[#5C6B9C]">
                  {isEnglish ? "Explore" : "Jelajahi"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="rounded-lg border border-[#c1d5c0]/70 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <ShieldCheck
            className="h-6 w-6 shrink-0 text-[#5C6B9C] mt-1"
            strokeWidth={2}
          />

          <div className="flex-1">
            <h2 className="text-base font-bold text-[#4A3F35]">
              {isEnglish ? "Need immediate help?" : "Butuh bantuan segera?"}
            </h2>

            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-[#4A3F35]/80">
              {isEnglish
                ? "If you feel that you may be in immediate danger or unable to keep yourself safe, contact your local emergency service or a trusted person nearby."
                : "Jika kamu merasa berada dalam bahaya atau tidak dapat menjaga keselamatan diri, hubungi layanan darurat setempat atau orang tepercaya yang berada di dekatmu."}
            </p>

            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#4A3F35]/60">
              <ExternalLink className="h-4 w-4" strokeWidth={2} />
              {isEnglish
                ? "Emergency resources depend on your location."
                : "Sumber bantuan darurat bergantung pada lokasimu."}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}