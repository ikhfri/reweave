import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  ActivityIcon,
  ArrowRightIcon,
  DiaryIcon,
  InsightIcon,
  PrivacyIcon,
  WellbeingIcon,
} from "@/components/reweave-icons";
import { isValidLocale, type Locale } from "@/i18n/config";
import { ArrowRight, Check, LockKeyhole } from "lucide-react";

type PageProps = {
  params: Promise<{ locale: string }>;
};

type Copy = {
  nav: { features: string; process: string; privacy: string; login: string; signup: string };
  hero: { eyebrow: string; title: ReactNode; description: string; signup: string; login: string; privacyNote: string };
  principles: { title: string; description: string; icon: ReactNode }[];
  features: { number: string; title: string; description: string; icon: ReactNode }[];
  featureIntro: { eyebrow: string; title: string; description: string };
  history: { eyebrow: string; title: string; description: string };
  privacyCard: { title: string; description: string };
  process: { eyebrow: string; title: string; description: string; steps: { title: string; description: string }[] };
  privacy: { eyebrow: string; title: string; description: string; points: string[]; link: string };
  cta: { eyebrow: string; title: string; description: string; signup: string; login: string };
  footer: { description: string; explore: string; account: string; language: string; rights: string; privacy: string };
};

function getCopy(isEnglish: boolean): Copy {
  return isEnglish
    ? {
        nav: { features: "Inside", process: "How it works", privacy: "Privacy", login: "Log in", signup: "Get started" },
        hero: {
          eyebrow: "A little more room to feel",
          title: <>Understand what<br className="hidden sm:block" /> you’re feeling.</>,
          description: "A private space to put your thoughts into words, notice emotional patterns, and make a little more sense of your days.",
          signup: "Create your space",
          login: "I already have an account",
          privacyNote: "Your thoughts stay yours.",
        },
        principles: [
          { title: "Name it", description: "Start with what you feel, without needing a perfect explanation.", icon: <WellbeingIcon className="h-5 w-5" /> },
          { title: "Let it out", description: "Write a little or tell the whole story. Go at your own pace.", icon: <DiaryIcon className="h-5 w-5" /> },
          { title: "Look back", description: "Notice patterns over time, without judging yourself.", icon: <InsightIcon className="h-5 w-5" /> },
        ],
        featureIntro: { eyebrow: "A space for you", title: "Small rituals. More self-understanding.", description: "No pressure to have it all figured out. Just thoughtful tools to help you check in with yourself." },
        features: [
          { number: "01", title: "Daily reflections", description: "Choose the feelings that fit and add context when you want.", icon: <WellbeingIcon className="h-5 w-5" /> },
          { number: "02", title: "A personal diary", description: "Write, record, or leave a few words for another day.", icon: <DiaryIcon className="h-5 w-5" /> },
          { number: "03", title: "Gentle insights", description: "Find observations in what you choose to share.", icon: <InsightIcon className="h-5 w-5" /> },
          { number: "04", title: "Small ways to reset", description: "Explore simple activities when you need a pause.", icon: <ActivityIcon className="h-5 w-5" /> },
        ],
        history: { eyebrow: "Your story, over time", title: "Today is one page, not the whole story.", description: "Reweave helps you look back at the days around today and notice what keeps coming up." },
        privacyCard: { title: "A space that stays yours.", description: "Your diary is personal, not a public feed. Your entries belong to your account." },
        process: {
          eyebrow: "Keep it simple",
          title: "Start wherever you are.",
          description: "There’s no perfect way to do this. A few honest minutes are enough.",
          steps: [
            { title: "Pause", description: "Ask yourself how you’re feeling right now." },
            { title: "Put it into words", description: "Write as much or as little as feels right." },
            { title: "Notice", description: "Return when you’re ready and look for patterns." },
          ],
        },
        privacy: {
          eyebrow: "Privacy, by design",
          title: "Some thoughts are just for you.",
          description: "Your diary and reflections are connected to your account. They aren’t a public timeline or shared with other users.",
          points: ["Your entries stay attached to your account.", "You can export or delete your data.", "AI reflections use only what you choose to submit."],
          link: "Create your private space",
        },
        cta: { eyebrow: "One page at a time", title: "Make room for how you feel.", description: "No perfect words. No pressure to solve everything today. Just a place to begin.", signup: "Get started for free", login: "Log in" },
        footer: { description: "A quiet place to write, reflect, and understand your days.", explore: "Explore", account: "Account", language: "Language", rights: "All rights reserved.", privacy: "Your data stays with you." },
      }
    : {
        nav: { features: "Fitur", process: "Cara kerja", privacy: "Privasi", login: "Masuk", signup: "Mulai" },
        hero: {
          eyebrow: "Ruang kecil untuk memahami diri",
          title: <>Pahami apa yang<br className="hidden sm:block" /> sedang kamu rasakan.</>,
          description: "Ruang pribadi untuk menuangkan pikiran, mengenali pola emosi, dan memahami hari-harimu dengan lebih pelan.",
          signup: "Buat ruangmu",
          login: "Sudah punya akun",
          privacyNote: "Pikiranmu tetap milikmu.",
        },
        principles: [
          { title: "Kenali", description: "Mulai dari apa yang kamu rasakan, tanpa harus menjelaskannya dengan sempurna.", icon: <WellbeingIcon className="h-5 w-5" /> },
          { title: "Tuangkan", description: "Tulis sedikit atau ceritakan semuanya. Ikuti ritmemu sendiri.", icon: <DiaryIcon className="h-5 w-5" /> },
          { title: "Lihat kembali", description: "Kenali pola yang muncul seiring waktu, tanpa menghakimi diri sendiri.", icon: <InsightIcon className="h-5 w-5" /> },
        ],
        featureIntro: { eyebrow: "Ruang untukmu", title: "Ritual kecil untuk lebih memahami diri.", description: "Kamu tidak harus punya semua jawabannya. Mulai saja dengan alat sederhana untuk memahami apa yang kamu rasakan." },
        features: [
          { number: "01", title: "Refleksi harian", description: "Pilih perasaan yang paling mendekati dan tambahkan konteks jika mau.", icon: <WellbeingIcon className="h-5 w-5" /> },
          { number: "02", title: "Diary pribadi", description: "Menulis, merekam, atau meninggalkan beberapa kata untuk nanti.", icon: <DiaryIcon className="h-5 w-5" /> },
          { number: "03", title: "Insight yang lembut", description: "Temukan pengamatan dari hal-hal yang kamu pilih untuk dibagikan.", icon: <InsightIcon className="h-5 w-5" /> },
          { number: "04", title: "Aktivitas sederhana", description: "Coba aktivitas ringan saat kamu membutuhkan jeda.", icon: <ActivityIcon className="h-5 w-5" /> },
        ],
        history: { eyebrow: "Ceritamu dari waktu ke waktu", title: "Hari ini satu halaman, bukan seluruh cerita.", description: "Reweave membantumu melihat kembali hari-hari sebelumnya dan mengenali hal yang terus muncul." },
        privacyCard: { title: "Ruang yang tetap milikmu.", description: "Diary-mu bersifat pribadi, bukan feed publik. Catatanmu tetap terhubung dengan akunmu." },
        process: {
          eyebrow: "Tidak perlu rumit",
          title: "Mulai dari mana pun kamu berada.",
          description: "Tidak ada cara yang paling benar. Beberapa menit untuk jujur pada diri sendiri sudah cukup.",
          steps: [
            { title: "Berhenti sejenak", description: "Tanyakan pada diri sendiri apa yang sedang dirasakan." },
            { title: "Tuangkan ke kata-kata", description: "Tulis sebanyak atau sesedikit yang terasa nyaman." },
            { title: "Perhatikan", description: "Kembali saat siap dan lihat pola yang mungkin muncul." },
          ],
        },
        privacy: {
          eyebrow: "Privasi sejak awal",
          title: "Ada hal yang cukup menjadi milikmu.",
          description: "Diary dan refleksimu terhubung ke akunmu. Catatan itu bukan timeline publik dan tidak dibagikan kepada pengguna lain.",
          points: ["Catatan tetap terhubung dengan akunmu.", "Kamu bisa mengekspor atau menghapus datamu.", "Refleksi AI hanya menggunakan hal yang kamu pilih untuk dikirim."],
          link: "Buat ruang pribadimu",
        },
        cta: { eyebrow: "Satu halaman setiap kali", title: "Beri ruang untuk perasaanmu.", description: "Tidak perlu kata-kata sempurna atau menyelesaikan semuanya hari ini. Cukup mulai dari sini.", signup: "Mulai gratis", login: "Masuk" },
        footer: { description: "Ruang tenang untuk menulis, berefleksi, dan memahami hari-harimu.", explore: "Jelajahi", account: "Akun", language: "Bahasa", rights: "Semua hak dilindungi.", privacy: "Datamu tetap milikmu." },
      };
}

export default async function LandingPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) redirect("/id");

  const typedLocale = locale as Locale;
  const isEnglish = typedLocale === "en";
  const copy = getCopy(isEnglish);

  const footerLinks = [
    { href: "#features", label: copy.nav.features },
    { href: "#how-it-works", label: copy.nav.process },
    { href: "#privacy", label: copy.nav.privacy },
  ];

  return (
    <main className="min-h-screen overflow-x-clip bg-[#FDFBF7] text-[#4A3F35]">
      <header className="sticky top-0 z-50 border-b border-[#4A3F35]/10 bg-[#FDFBF7]/95 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href={`/${typedLocale}`} aria-label="Reweave home" className="shrink-0">
            <Image src="/reweave-logo.webp" alt="Reweave" width={150} height={45} priority className="h-11 w-auto object-contain" />
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
            {footerLinks.map((item) => (
              <a key={item.href} href={item.href} className="text-sm text-[#4A3F35]/65 transition-colors hover:text-[#5C6B9C]">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href={`/${typedLocale}/login`} className="hidden rounded-lg px-3 py-2 text-sm text-[#4A3F35]/70 transition-colors hover:text-[#4A3F35] sm:inline-flex">
              {copy.nav.login}
            </Link>
            <Link href={`/${typedLocale}/register`} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#5C6B9C] px-4 text-sm font-medium text-white transition-colors hover:bg-[#485784]">
              {copy.nav.signup}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-70 w-70 rounded-full bg-[#FBC4AB]/25 blur-[100px]" />
        <div className="mx-auto grid min-h-[calc(100svh-72px)] max-w-7xl items-center gap-8 px-5 py-10 sm:gap-10 sm:px-8 sm:py-12 lg:min-h-[calc(100svh-72px)] lg:grid-cols-[0.88fr_1.12fr] lg:gap-6 lg:px-10 lg:py-10">
          <div className="relative z-10 max-w-150">
        
            <h1 className="max-w-160 text-[clamp(2.8rem,5.2vw,5rem)] font-medium leading-[0.99] tracking-[-0.065em]">
              {copy.hero.title}
            </h1>
            <p className="mt-6 max-w-lg text-[15px] leading-7 text-[#4A3F35]/70 sm:mt-7 sm:text-base sm:leading-8">
              {copy.hero.description}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <Link href={`/${typedLocale}/register`} className="group inline-flex h-12 items-center justify-center gap-3 rounded-lg bg-[#E2725B] px-5 text-sm font-medium text-white transition-colors hover:bg-[#c9614c]">
                {copy.hero.signup}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href={`/${typedLocale}/login`} className="inline-flex h-12 items-center justify-center rounded-lg border border-[#4A3F35]/15 px-5 text-sm font-medium text-[#4A3F35]/80 transition-colors hover:border-[#4A3F35]/30 hover:bg-white/60">
                {copy.hero.login}
              </Link>
            </div>
            <p className="mt-5 flex items-center gap-2 text-xs text-[#4A3F35]/55 sm:mt-6">
              <LockKeyhole className="h-3.5 w-3.5" strokeWidth={1.7} />
              {copy.hero.privacyNote}
            </p>
          </div>

          <div className="relative mx-auto flex w-full max-w-190 items-center justify-center lg:-mr-8 xl:-mr-12">
            <div aria-hidden="true" className="pointer-events-none absolute inset-[12%] rounded-full bg-[#C1D5C0]/30 blur-[75px]" />
            <Image
              src="/hero-visual.png"
              alt={isEnglish ? "A preview of the Reweave journaling experience" : "Pratinjau pengalaman menulis diary di Reweave"}
              width={1200}
              height={1200}
              priority
              sizes="(max-width: 1023px) 100vw, (max-width: 1279px) 55vw, 60vw"
              className="relative z-10 block h-auto w-full max-w-190 object-contain drop-shadow-[0_24px_40px_rgba(74,63,53,0.10)] lg:-translate-y-3"
            />
          </div>
        </div>
      </section>

      <section aria-label={isEnglish ? "How Reweave helps" : "Cara Reweave membantu"} className="border-y border-[#4A3F35]/10 bg-[#F5EFE6]/55">
        <div className="mx-auto grid max-w-7xl divide-y divide-[#4A3F35]/10 px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-10">
          {copy.principles.map((item, index) => (
            <article key={item.title} className="flex gap-4 py-6 md:px-6 md:py-7 first:md:pl-0 last:md:pr-0">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#4A3F35]/10 bg-[#FDFBF7] text-[#5C6B9C]">
                {item.icon}
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold tracking-[0.16em] text-[#E2725B]">0{index + 1}</p>
                <h2 className="text-sm font-semibold">{item.title}</h2>
                <p className="mt-1.5 max-w-xs text-sm leading-6 text-[#4A3F35]/65">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="features" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
            <div className="max-w-xl">
              <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.14em] text-[#5C6B9C]">
                <span aria-hidden="true" className="h-px w-7 bg-[#E2725B]" />
                {copy.featureIntro.eyebrow}
              </p>
              <h2 className="mt-5 text-4xl font-medium leading-[1.04] tracking-[-0.055em] sm:text-5xl">
                {copy.featureIntro.title}
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-[#4A3F35]/65">{copy.featureIntro.description}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {copy.features.map((feature) => (
                <article key={feature.number} className="rounded-2xl border border-[#4A3F35]/10 bg-white/45 p-6 sm:p-7">
                  <div className="flex items-start justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1E9DB] text-[#5C6B9C]">{feature.icon}</span>
                    <span className="text-[10px] font-medium tracking-[0.12em] text-[#4A3F35]/35">{feature.number}</span>
                  </div>
                  <h3 className="mt-6 text-base font-semibold tracking-[-0.02em]">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#4A3F35]/65">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <article className="relative min-h-75 overflow-hidden rounded-2xl bg-[#5C6B9C] p-7 text-[#FDFBF7] sm:p-10">
              <div aria-hidden="true" className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/15" />
              <div aria-hidden="true" className="absolute -right-4 -top-8 h-40 w-40 rounded-full border border-[#FBC4AB]/35" />
              <div className="relative max-w-lg">
                <p className="text-xs font-medium tracking-[0.14em] text-[#FBC4AB]">{copy.history.eyebrow}</p>
                <h3 className="mt-5 max-w-md text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl">{copy.history.title}</h3>
                <p className="mt-4 max-w-md text-sm leading-7 text-white/75">{copy.history.description}</p>
              </div>
              <div aria-hidden="true" className="absolute bottom-0 right-8 hidden h-24 items-end gap-2 sm:flex">
                {[32, 56, 42, 76, 48, 64].map((height, index) => (
                  <span key={index} className={`w-5 rounded-t-full ${index % 2 ? "bg-[#FBC4AB]/55" : "bg-white/20"}`} style={{ height }} />
                ))}
              </div>
            </article>

            <article className="relative overflow-hidden rounded-2xl border border-[#4A3F35]/10 bg-[#F1E9DB] p-7 sm:p-9">
              <div aria-hidden="true" className="absolute -bottom-16 -right-12 h-48 w-48 rounded-full bg-[#C1D5C0]/45 blur-2xl" />
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-[#5C6B9C]">
                  <PrivacyIcon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 text-2xl font-medium leading-tight tracking-[-0.04em]">{copy.privacyCard.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#4A3F35]/70">{copy.privacyCard.description}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 border-y border-[#4A3F35]/10 bg-[#F5EFE6]/65 px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.14em] text-[#5C6B9C]">
              <span aria-hidden="true" className="h-px w-7 bg-[#E2725B]" />
              {copy.process.eyebrow}
            </p>
            <h2 className="mt-5 text-4xl font-medium leading-[1.04] tracking-[-0.055em] sm:text-5xl">{copy.process.title}</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#4A3F35]/65">{copy.process.description}</p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
            {copy.process.steps.map((step, index) => (
              <article key={step.title} className="border-t border-[#4A3F35]/20 pt-5">
                <p className="text-xs font-semibold tracking-[0.12em] text-[#E2725B]">0{index + 1}</p>
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em]">{step.title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-7 text-[#4A3F35]/65">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="privacy" className="scroll-mt-24 border-b border-[#4A3F35]/10 px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div className="relative mx-auto w-full max-w-xl">
            <Image src="/private-diary.png" alt={isEnglish ? "Private diary pages" : "Halaman diary pribadi"} width={1356} height={1118} sizes="(max-width: 1023px) 100vw, 46vw" className="block h-auto w-full object-contain" />
          </div>
          <div className="max-w-xl">
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.14em] text-[#5C6B9C]">
              <span aria-hidden="true" className="h-px w-7 bg-[#E2725B]" />
              {copy.privacy.eyebrow}
            </p>
            <h2 className="mt-5 text-4xl font-medium leading-[1.04] tracking-[-0.055em] sm:text-5xl">{copy.privacy.title}</h2>
            <p className="mt-5 text-sm leading-7 text-[#4A3F35]/70 sm:text-base sm:leading-8">{copy.privacy.description}</p>
            <ul className="mt-7 space-y-4">
              {copy.privacy.points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm leading-6 text-[#4A3F35]/75">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C1D5C0]/60">
                    <Check className="h-3 w-3" strokeWidth={2} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <Link href={`/${typedLocale}/register`} className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#5C6B9C] transition-colors hover:text-[#E2725B]">
              {copy.privacy.link}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-5 py-20 sm:px-8 sm:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FBC4AB]/25 blur-[90px]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <Image src="/reweave-logo.png" alt="Reweave" width={170} height={52} className="mx-auto h-14 w-auto object-contain" />
          <p className="mt-7 text-xs font-semibold tracking-[0.16em] text-[#5C6B9C]">{copy.cta.eyebrow}</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-medium leading-[1.02] tracking-[-0.06em] sm:text-6xl">{copy.cta.title}</h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#4A3F35]/65 sm:text-base">{copy.cta.description}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={`/${typedLocale}/register`} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#E2725B] px-6 text-sm font-medium text-white transition-colors hover:bg-[#c9614c]">
              {copy.cta.signup}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={`/${typedLocale}/login`} className="inline-flex h-12 items-center justify-center rounded-lg border border-[#4A3F35]/15 bg-white/50 px-6 text-sm font-medium transition-colors hover:bg-white">
              {copy.cta.login}
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#4A3F35]/10 bg-[#F5EFE6]/45">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr]">
            <div className="max-w-xs">
              <Link href={`/${typedLocale}`} aria-label="Reweave home" className="inline-flex">
                <Image src="/reweave-logo.webp" alt="Reweave" width={130} height={40} className="h-10 w-auto object-contain" />
              </Link>
              <p className="mt-3 text-sm leading-6 text-[#4A3F35]/60">{copy.footer.description}</p>
            </div>

            <div>
              <h2 className="text-xs font-semibold">{copy.footer.explore}</h2>
              <ul className="mt-4 space-y-3">
                {footerLinks.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="text-sm text-[#4A3F35]/60 transition-colors hover:text-[#5C6B9C]">{item.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xs font-semibold">{copy.footer.account}</h2>
              <ul className="mt-4 space-y-3">
                <li><Link href={`/${typedLocale}/login`} className="text-sm text-[#4A3F35]/60 hover:text-[#5C6B9C]">{copy.nav.login}</Link></li>
                <li><Link href={`/${typedLocale}/register`} className="text-sm text-[#4A3F35]/60 hover:text-[#5C6B9C]">{copy.nav.signup}</Link></li>
              </ul>
            </div>

            <div>
              <h2 className="text-xs font-semibold">{copy.footer.language}</h2>
              <div className="mt-4 flex gap-2">
                <Link href="/id" lang="id" hrefLang="id" aria-current={!isEnglish ? "page" : undefined} className={`rounded-md px-3 py-1.5 text-xs ${!isEnglish ? "bg-[#5C6B9C]/10 font-semibold text-[#5C6B9C]" : "text-[#4A3F35]/60 hover:bg-white/70"}`}>ID</Link>
                <Link href="/en" lang="en" hrefLang="en" aria-current={isEnglish ? "page" : undefined} className={`rounded-md px-3 py-1.5 text-xs ${isEnglish ? "bg-[#5C6B9C]/10 font-semibold text-[#5C6B9C]" : "text-[#4A3F35]/60 hover:bg-white/70"}`}>EN</Link>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-[#4A3F35]/10 pt-5 text-xs text-[#4A3F35]/50 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Reweave. {copy.footer.rights}</p>
            <p className="flex items-center gap-2"><PrivacyIcon className="h-3.5 w-3.5" />{copy.footer.privacy}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
