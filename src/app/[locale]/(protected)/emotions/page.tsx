"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { Locale } from "@/i18n/config";

import { ArrowRightIcon, WellbeingIcon } from "@/components/reweave-icons";
import { useParams } from "next/navigation";

/* =========================================================
   EMOTION DATA
========================================================= */

type EmotionCategory = "all" | "positive" | "calm" | "difficult";

type EmotionItem = {
  slug: string;
  nameId: string;
  nameEn: string;
  category: Exclude<EmotionCategory, "all">;
  descriptionId: string;
  descriptionEn: string;
  image: string;
  color: string;
};

const emotions: EmotionItem[] = [
  {
    slug: "happy",
    nameId: "Senang",
    nameEn: "Happy",
    category: "positive",
    descriptionId:
      "Perasaan ringan dan menyenangkan ketika sesuatu terasa berjalan dengan baik.",
    descriptionEn:
      "A pleasant and uplifting feeling when something feels like it is going well.",
    image: "/emotions-emoji/happy.webp",
    color: "#FBC4AB",
  },

  {
    slug: "loved",
    nameId: "Dicintai",
    nameEn: "Loved",
    category: "positive",
    descriptionId:
      "Perasaan dihargai dan dicintai oleh orang lain.",
    descriptionEn:
      "A feeling of being valued and cared for by others.",
    image: "/emotions-emoji/loved.webp",
    color: "#C39986",
  },

  {
    slug: "excited",
    nameId: "Antusias",
    nameEn: "Excited",
    category: "positive",
    descriptionId:
      "Perasaan penuh energi dan ketertarikan terhadap sesuatu yang akan terjadi.",
    descriptionEn:
      "A feeling of energy and anticipation toward something that may happen.",
    image: "/emotions-emoji/excited.webp",
    color: "#8F7163",
  },

  {
    slug: "hopeful",
    nameId: "Bersyukur",
    nameEn: "Hopeful",
    category: "calm",
    descriptionId:
      "Perasaan menghargai sesuatu yang baik, bermakna, atau mendukung dalam hidupmu.",
    descriptionEn:
      "A feeling of appreciation for something good, meaningful, or supportive in your life.",
    image: "/emotions-emoji/hopefulrev.png",
    color: "#D6E3D5",
  },

  {
    slug: "calm",
    nameId: "Tenang",
    nameEn: "Calm",
    category: "calm",
    descriptionId:
      "Keadaan ketika tubuh dan pikiran terasa lebih stabil dan tidak terlalu terburu-buru.",
    descriptionEn:
      "A state where your body and mind feel relatively settled and unhurried.",
    image: "/emotions-emoji/calm.webp",
    color: "#B1C5B1",
  },

  {
    slug: "tired",
    nameId: "Lelah",
    nameEn: "Tired",
    category: "difficult",
    descriptionId:
      "Perasaan berkurangnya energi setelah banyak aktivitas, pikiran, atau tekanan.",
    descriptionEn:
      "A feeling of reduced energy after activity, mental effort, or ongoing demands.",
    image: "/emotions-emoji/tired.webp",
    color: "#879C87",
  },

  {
    slug: "anxious",
    nameId: "Cemas",
    nameEn: "Anxious",
    category: "difficult",
    descriptionId:
      "Perasaan khawatir atau tidak tenang ketika menghadapi ketidakpastian atau sesuatu yang terasa mengancam.",
    descriptionEn:
      "A feeling of worry or unease when facing uncertainty or something that feels threatening.",
    image: "/emotions-emoji/anxious.webp",
    color: "#D66F5A",
  },

  {
    slug: "stressed",
    nameId: "Stres",
    nameEn: "Stressed",
    category: "difficult",
    descriptionId:
      "Perasaan tertekan ketika tuntutan yang dihadapi terasa lebih besar daripada kapasitas yang tersedia.",
    descriptionEn:
      "A feeling of pressure when the demands you face feel greater than your available capacity.",
    image: "/emotions-emoji/stressed.webp",
    color: "#A64D3B",
  },

  {
    slug: "angry",
    nameId: "Marah",
    nameEn: "Angry",
    category: "difficult",
    descriptionId:
      "Perasaan kuat ketika sesuatu terasa tidak adil, mengganggu, menyakiti, atau melewati batas.",
    descriptionEn:
      "A strong feeling that can arise when something feels unfair, hurtful, disruptive, or crosses a boundary.",
    image: "/emotions-emoji/angry.webp",
    color: "#782E20",
  },

  // {
  //   slug: "frustrated",
  //   nameId: "Frustrasi",
  //   nameEn: "Frustrated",
  //   category: "difficult",
  //   descriptionId:
  //     "Perasaan kesal atau terhambat ketika sesuatu tidak berjalan seperti yang diharapkan.",
  //   descriptionEn:
  //     "A feeling of irritation or difficulty when something does not go as expected.",
  //   image: "/emotions-emoji/frustrated.webp",
  //   color: "#A64D3B",
  // },

  {
    slug: "lonely",
    nameId: "Kesepian",
    nameEn: "Lonely",
    category: "difficult",
    descriptionId:
      "Perasaan terputus atau kurang terhubung dengan orang lain, meskipun sedang tidak sendirian.",
    descriptionEn:
      "A feeling of disconnection or lack of meaningful connection, even when other people are around.",
    image: "/emotions-emoji/lonely.webp",
    color: "#7182A4",
  },

  {
    slug: "sad",
    nameId: "Sedih",
    nameEn: "Sad",
    category: "difficult",
    descriptionId:
      "Perasaan berat yang dapat muncul ketika kehilangan sesuatu, kecewa, terluka, atau menghadapi keadaan yang sulit.",
    descriptionEn:
      "A heavy feeling that can arise from loss, disappointment, hurt, or difficult circumstances.",
    image: "/emotions-emoji/sad.webp",
    color: "#475677",
  },

  {
    slug: "overwhelmed",
    nameId: "Kewalahan",
    nameEn: "Overwhelmed",
    category: "difficult",
    descriptionId:
      "Perasaan ketika banyak hal datang bersamaan sampai terasa sulit mengetahui harus mulai dari mana.",
    descriptionEn:
      "A feeling that too many demands are happening at once, making it difficult to know where to begin.",
    image: "/emotions-emoji/overwhelmed.webp",
    color: "#39405B",
  },
];

/* =========================================================
   PAGE
========================================================= */
export default function EmotionsPage() {
  const params = useParams<{
    locale: Locale;
  }>();

  const locale = params.locale;

  const isEnglish = locale === "en";

  const [query, setQuery] = useState("");

  const [category, setCategory] = useState<EmotionCategory>("all");

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredEmotions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return emotions.filter((emotion) => {
      const matchesCategory =
        category === "all" || emotion.category === category;

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const name = isEnglish ? emotion.nameEn : emotion.nameId;

      const description = isEnglish
        ? emotion.descriptionEn
        : emotion.descriptionId;

      return (
        name.toLowerCase().includes(normalizedQuery) ||
        description.toLowerCase().includes(normalizedQuery) ||
        emotion.slug.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [category, isEnglish, query]);

  /* =======================================================
     CATEGORY LABEL
  ======================================================= */

  const categories: {
    id: EmotionCategory;
    label: string;
  }[] = [
    {
      id: "all",
      label: isEnglish ? "All" : "Semua",
    },
    {
      id: "positive",
      label: isEnglish ? "Positive" : "Positif",
    },
    {
      id: "calm",
      label: isEnglish ? "Calm" : "Tenang",
    },
    {
      id: "difficult",
      label: isEnglish ? "Difficult" : "Tidak nyaman",
    },
  ];

  return (
    <main className="min-h-full bg-[#FDFBF7] pb-20 text-[#4A3F35]">
      <div className="mx-auto max-w-6xl">
        {/* =================================================
            HERO
        ================================================== */}

        <section className="relative mt-3 sm:mt-5 overflow-hidden rounded-[30px] bg-[#FBC4AB]/35 px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          {/* decorative shapes */}

          <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#FDFBF7]/55" />

          <div className="absolute -bottom-24 left-[35%] h-56 w-56 rounded-full bg-[#C1D5C0]/30" />

          <div className="absolute right-[18%] top-12 h-3 w-3 rounded-full bg-[#5C6B9C]/25" />

          <div className="relative max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FDFBF7]/70 text-[#5C6B9C]">
                <WellbeingIcon className="h-4.5 w-4.5" />
              </div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5C6B9C]">
                {isEnglish ? "Emotional literacy" : "Mengenal emosi"}
              </p>
            </div>

            <h1 className="mt-6 max-w-2xl text-[36px] font-semibold leading-[1.08] tracking-[-0.045em] sm:text-[50px]">
              {isEnglish
                ? "Get to know what you feel."
                : "Kenali apa yang kamu rasakan."}
            </h1>

            <p className="mt-5 max-w-2xl text-[15px] leading-8 text-[#4A3F35]/65 sm:text-[16px]">
              {isEnglish
                ? "Understanding an emotion does not mean judging it. Learn how different feelings may show up in your thoughts, body, and everyday life."
                : "Memahami sebuah emosi bukan berarti menghakiminya. Pelajari bagaimana berbagai perasaan bisa muncul dalam pikiran, tubuh, dan keseharianmu."}
            </p>
          </div>
        </section>

        {/* =================================================
            INTRO NOTE
        ================================================== */}

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.7fr] lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#5C6B9C]">
              {isEnglish ? "A small reminder" : "Pengingat kecil"}
            </p>

            <h2 className="mt-2 max-w-2xl text-[24px] font-semibold leading-tight tracking-[-0.03em]">
              {isEnglish
                ? "There is no wrong emotion."
                : "Tidak ada emosi yang salah."}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#4A3F35]/55">
              {isEnglish
                ? "Emotions can give us information about what matters to us, what we need, or what we may be responding to."
                : "Emosi bisa memberi informasi tentang apa yang penting bagi kita, apa yang kita butuhkan, atau apa yang sedang kita respons."}
            </p>
          </div>

          <div className="border-l border-[#C1D5C0] pl-5">
            <p className="text-xs leading-6 text-[#4A3F35]/50">
              {isEnglish
                ? "Use this library as a starting point for reflection, not as a way to diagnose yourself."
                : "Gunakan halaman ini sebagai awal untuk berefleksi, bukan sebagai cara untuk mendiagnosis dirimu sendiri."}
            </p>
          </div>
        </section>

        {/* =================================================
            SEARCH
        ================================================== */}

        <section className="mt-12">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={isEnglish ? "Search an emotion..." : "Cari emosi..."}
              className="h-12 w-full rounded-[14px] border border-[#C1D5C0]/70 bg-white px-4 text-sm text-[#4A3F35] outline-none transition-colors placeholder:text-[#4A3F35]/30 focus:border-[#5C6B9C]/50"
            />
          </div>

          {/* CATEGORY FILTER */}

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => {
              const active = category === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategory(item.id)}
                  className={[
                    "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
                    active
                      ? "border-[#4A3F35] bg-[#4A3F35] text-[#FDFBF7]"
                      : "border-[#C1D5C0]/70 bg-white text-[#4A3F35]/55 hover:border-[#4A3F35]/20 hover:text-[#4A3F35]",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* =================================================
            RESULTS HEADER
        ================================================== */}

        <section className="mt-12 flex items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4A3F35]/30">
              {isEnglish ? "Emotion library" : "Perpustakaan emosi"}
            </p>

            <h2 className="mt-2 text-[25px] font-semibold tracking-[-0.03em]">
              {isEnglish
                ? `${filteredEmotions.length} emotions to explore`
                : `${filteredEmotions.length} emosi untuk dipelajari`}
            </h2>
          </div>
        </section>

        {/* =================================================
            EMOTION GRID
        ================================================== */}

        {filteredEmotions.length > 0 ? (
          <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEmotions.map((emotion) => {
              const name = isEnglish ? emotion.nameEn : emotion.nameId;

              const description = isEnglish
                ? emotion.descriptionEn
                : emotion.descriptionId;

              return (
                <Link
                  key={emotion.slug}
                  href={`/${locale}/emotions/${emotion.slug}`}
                  className="group relative overflow-hidden rounded-[22px] border border-[#C1D5C0]/55 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C1D5C0] hover:shadow-[0_14px_40px_rgba(74,63,53,0.06)]"
                >
                  {/* color accent */}

                  <div
                    className="absolute right-0 top-0 h-24 w-24 rounded-bl-[80px] opacity-45"
                    style={{
                      backgroundColor: emotion.color,
                    }}
                  />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className="flex h-20 w-20 items-center justify-center rounded-[20px]"
                        style={{
                          backgroundColor: `${emotion.color}55`,
                        }}
                      >
                        <Image
                          src={emotion.image}
                          alt={name}
                          width={68}
                          height={68}
                          className="object-contain"
                        />
                      </div>

                      <div className="mt-2 text-[#4A3F35]/25 transition-transform duration-300 group-hover:translate-x-1">
                        <ArrowRightIcon className="h-4.75 w-4.75" />
                      </div>
                    </div>

                    <p className="mt-6 text-[22px] font-semibold tracking-tight">
                      {name}
                    </p>

                    <p className="mt-2 line-clamp-3 text-[13px] leading-6 text-[#4A3F35]/50">
                      {description}
                    </p>

                    <div className="mt-6 flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: emotion.color,
                        }}
                      />

                      <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#4A3F35]/35">
                        {isEnglish
                          ? getCategoryLabel(emotion.category, true)
                          : getCategoryLabel(emotion.category, false)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        ) : (
          /* =================================================
             EMPTY STATE
          ================================================== */

          <section className="mt-7 border-y border-dashed border-[#C1D5C0] py-16 text-center">
            <p className="text-sm font-semibold text-[#4A3F35]/65">
              {isEnglish ? "No emotion found." : "Emosi tidak ditemukan."}
            </p>

            <p className="mt-2 text-xs text-[#4A3F35]/40">
              {isEnglish
                ? "Try another keyword."
                : "Coba gunakan kata kunci lain."}
            </p>

            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
              className="mt-5 text-xs font-semibold text-[#5C6B9C]"
            >
              {isEnglish ? "Clear filters" : "Hapus filter"}
            </button>
          </section>
        )}

        {/* =================================================
            REFLECTION CTA
        ================================================== */}

        <section className="mt-16 border-t border-[#C1D5C0]/55 pt-10">
          <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5C6B9C]">
                {isEnglish ? "Put it into practice" : "Coba rasakan"}
              </p>

              <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em]">
                {isEnglish
                  ? "Not sure what you are feeling?"
                  : "Masih bingung dengan perasaanmu?"}
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-[#4A3F35]/50">
                {isEnglish
                  ? "You can describe what is happening in your own words. Reweave can help you explore the feeling without forcing it into a label."
                  : "Kamu bisa menceritakan apa yang sedang terjadi dengan kata-katamu sendiri. Reweave bisa membantumu mengeksplorasinya tanpa memaksakan sebuah label."}
              </p>
            </div>

            <Link
              href={`/${locale}/check-in`}
              className="inline-flex h-11 items-center justify-center gap-3 bg-[#E2725B] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#4A3F35]"
            >
              {isEnglish ? "Start a check-in" : "Mulai check-in"}

              <ArrowRightIcon className="h-4.5 w-4.5" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}



function getCategoryLabel(
  category: EmotionItem["category"],
  isEnglish: boolean,
) {
  if (category === "positive") {
    return isEnglish ? "Positive" : "Positif";
  }

  if (category === "calm") {
    return isEnglish ? "Calm" : "Tenang";
  }

  return isEnglish ? "Difficult" : "Tidak nyaman";
}
