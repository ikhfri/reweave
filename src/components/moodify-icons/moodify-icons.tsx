import { useId } from "react";
import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/* =========================================================
   DESIGN SYSTEM
   - Grid         : 48 x 48, safe area 6px
   - Stroke       : 2px, round cap & join (konsisten di semua ikon)
   - Warna        : 100% currentColor (tanpa warna hardcode,
                    aman untuk dark mode & tema apa pun)
   - Fill         : hanya untuk titik kecil (mata, keyhole)
   - Aksesibilitas: aria-hidden secara default, bisa di-override
                    lewat props (mis. aria-label + role="img")
========================================================= */

const baseProps = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true,
  focusable: false,
} as const;

function createIcon(name: string, children: ReactNode) {
  function Icon({ className, ...props }: IconProps) {
    return (
      <svg {...baseProps} {...props} className={className}>
        {children}
      </svg>
    );
  }
  Icon.displayName = name;
  return Icon;
}

/* Titik kecil (mata, keyhole) — fill saja, tanpa stroke */
const Dot = ({ cx, cy, r = 1.6 }: { cx: number; cy: number; r?: number }) => (
  <circle cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />
);

/* Bentuk hati yang dipakai bersama agar semua ikon hati seragam */
const HEART =
  "M24 39C18 35 9.5 28.5 9.5 19.5C9.5 14 13.4 10.5 17.8 10.5C20.5 10.5 22.8 12 24 14.5C25.2 12 27.5 10.5 30.2 10.5C34.6 10.5 38.5 14 38.5 19.5C38.5 28.5 30 35 24 39Z";

/* Bentuk perisai yang dipakai bersama */
const SHIELD =
  "M24 7L38 12.5V23C38 31.5 32.4 37.4 24 41C15.6 37.4 10 31.5 10 23V12.5L24 7Z";

/* =========================================================
   NAVIGATION
========================================================= */

export const HomeIcon = createIcon(
  "HomeIcon",
  <>
    <path d="M8 22L24 9L40 22" />
    <path d="M12 19.5V37C12 38.1 12.9 39 14 39H34C35.1 39 36 38.1 36 37V19.5" />
    <path d="M20 39V29C20 28.4 20.4 28 21 28H27C27.6 28 28 28.4 28 29V39" />
  </>
);

export const BackIcon = createIcon(
  "BackIcon",
  <>
    <path d="M39 24H11" />
    <path d="M21 14L11 24L21 34" />
  </>
);

export const ArrowRightIcon = createIcon(
  "ArrowRightIcon",
  <>
    <path d="M9 24H37" />
    <path d="M27 14L37 24L27 34" />
  </>
);

/* =========================================================
   AUTH / FORM
========================================================= */

export const EyeIcon = createIcon(
  "EyeIcon",
  <>
    <path d="M6 24C10 16.5 16.5 12.5 24 12.5C31.5 12.5 38 16.5 42 24C38 31.5 31.5 35.5 24 35.5C16.5 35.5 10 31.5 6 24Z" />
    <circle cx="24" cy="24" r="5" />
  </>
);

export const EyeOffIcon = createIcon(
  "EyeOffIcon",
  <>
    <path d="M17.5 14.2C19.5 13.2 21.7 12.5 24 12.5C31.5 12.5 38 16.5 42 24C40.4 27 38.3 29.5 35.8 31.4" />
    <path d="M30 33.8C28.1 35.1 26.1 35.5 24 35.5C16.5 35.5 10 31.5 6 24C7.7 20.9 9.9 18.3 12.5 16.4" />
    <path d="M20 20.2C19.1 21.1 18.5 22.5 18.5 24C18.5 27 21 29.5 24 29.5C25.5 29.5 26.9 28.9 27.8 28" />
    <path d="M9 9L39 39" />
  </>
);

export const LockIcon = createIcon(
  "LockIcon",
  <>
    <rect x="11" y="21" width="26" height="18" rx="5" />
    <path d="M16.5 21V16C16.5 11.9 19.9 8.5 24 8.5C28.1 8.5 31.5 11.9 31.5 16V21" />
    <Dot cx={24} cy={29} r={2.2} />
    <path d="M24 31.5V34" />
  </>
);

export const MailIcon = createIcon(
  "MailIcon",
  <>
    <rect x="7" y="12" width="34" height="24" rx="5" />
    <path d="M9 16.5L24 27L39 16.5" />
  </>
);

export const ShieldIcon = createIcon(
  "ShieldIcon",
  <>
    <path d={SHIELD} />
    <path d="M17.5 24L22 28.5L30.5 19.5" />
  </>
);

export const PrivacyIcon = createIcon(
  "PrivacyIcon",
  <>
    <path d={SHIELD} />
    <rect x="19" y="23" width="10" height="8" rx="2" />
    <path d="M21 23V21.5C21 19.8 22.3 18.5 24 18.5C25.7 18.5 27 19.8 27 21.5V23" />
  </>
);

export const UserIcon = createIcon(
  "UserIcon",
  <>
    <circle cx="24" cy="17" r="7" />
    <path d="M10 40C11.5 32.5 16.7 28.5 24 28.5C31.3 28.5 36.5 32.5 38 40" />
  </>
);

/* =========================================================
   UTILITY
========================================================= */

export const BellIcon = createIcon(
  "BellIcon",
  <>
    <path d="M24 7C17.4 7 12 12.4 12 19V23.5C12 25.9 11.2 28.2 9.6 30L8 32C7 33.3 7.9 35.3 9.5 35.3H38.5C40.1 35.3 41 33.3 40 32L38.4 30C36.8 28.2 36 25.9 36 23.5V19C36 12.4 30.6 7 24 7Z" />
    <path d="M20 39.5C20.8 41.2 22.3 42.2 24 42.2C25.7 42.2 27.2 41.2 28 39.5" />
  </>
);

export const GlobeIcon = createIcon(
  "GlobeIcon",
  <>
    <circle cx="24" cy="24" r="17" />
    <path d="M7 24H41" />
    <path d="M24 7C28.5 11.5 31 17.4 31 24C31 30.6 28.5 36.5 24 41C19.5 36.5 17 30.6 17 24C17 17.4 19.5 11.5 24 7Z" />
  </>
);

export const SaveIcon = createIcon(
  "SaveIcon",
  <>
    <path d="M12 9H32L39 16V37C39 38.1 38.1 39 37 39H12C10.9 39 10 38.1 10 37V11C10 9.9 10.9 9 12 9Z" />
    <path d="M17 9V18H31V9" />
    <path d="M16 39V29H32V39" />
  </>
);

/* Slider: garis diputus di sekitar knob, jadi tidak perlu fill latar */
export const SettingsIcon = createIcon(
  "SettingsIcon",
  <>
    <path d="M9 14H14.5M21.5 14H39" />
    <circle cx="18" cy="14" r="3.5" />
    <path d="M9 24H26.5M33.5 24H39" />
    <circle cx="30" cy="24" r="3.5" />
    <path d="M9 34H12.5M19.5 34H39" />
    <circle cx="16" cy="34" r="3.5" />
  </>
);

/* =========================================================
   WELLBEING / MOOD
========================================================= */

/* Hati + centang → check-in harian */
export const CheckinIcon = createIcon(
  "CheckinIcon",
  <>
    <path d={HEART} />
    <path d="M18 23L22 27L30 18.5" />
  </>
);

/* Hati + wajah tenang */
export const WellbeingIcon = createIcon(
  "WellbeingIcon",
  <>
    <path d={HEART} />
    <Dot cx={19} cy={19} />
    <Dot cx={29} cy={19} />
    <path d="M19 24C20.4 25.6 22 26.4 24 26.4C26 26.4 27.6 25.6 29 24" />
  </>
);

/* Hati + garis denyut → aktivitas / self-care */
export const ActivityIcon = createIcon(
  "ActivityIcon",
  <>
    <path d={HEART} />
    <path d="M14.5 23H19.5L22 18L26 28L28.5 23H33.5" />
  </>
);

export const DiaryIcon = createIcon(
  "DiaryIcon",
  <>
    <path d="M13 9.5C13 8.1 14.1 7 15.5 7H35V41H15.5C14.1 41 13 39.9 13 38.5V9.5Z" />
    <path d="M19 7V41" />
    <path d="M24.5 15H30M24.5 21H30M24.5 27H28" />
  </>
);

export const InsightIcon = createIcon(
  "InsightIcon",
  <>
    <path d="M9 9V39H39" />
    <path d="M15 31L22 23.5L27 28L37 16" />
    <path d="M30.5 16H37V22.5" />
  </>
);

export const CalendarMoodIcon = createIcon(
  "CalendarMoodIcon",
  <>
    <rect x="8" y="11" width="32" height="29" rx="6" />
    <path d="M16 7V14M32 7V14" />
    <path d="M8 20H40" />
    <Dot cx={19} cy={27.5} />
    <Dot cx={29} cy={27.5} />
    <path d="M19.5 32.5C20.8 33.7 22.3 34.3 24 34.3C25.7 34.3 27.2 33.7 28.5 32.5" />
  </>
);

export const SupportIcon = createIcon(
  "SupportIcon",
  <>
    <path d="M24 9.5C15.7 9.5 9 15.1 9 22C9 26.2 11.5 29.9 15.4 32.1L14 38.5L20.7 35C21.8 35.2 22.9 35.3 24 35.3C32.3 35.3 39 29.7 39 22.8C39 15.1 32.3 9.5 24 9.5Z" />
    <Dot cx={19} cy={21} />
    <Dot cx={29} cy={21} />
    <path d="M19 26C20.4 27.4 22 28 24 28C26 28 27.6 27.4 29 26" />
  </>
);

/* =========================================================
   MOODIFY MARK
   Logo utama: matahari (mood) + tunas (growth).
   Wajah dibuat dengan mask sehingga tembus ke latar apa pun
   (tidak ada lagi warna #FDFBF7 yang di-hardcode).
========================================================= */

export function MoodifyMark({ className, ...props }: IconProps) {
  const rawId = useId();
  const maskId = `moodify-face-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <svg {...baseProps} {...props} className={className}>
      <defs>
        <mask id={maskId}>
          <rect width="48" height="48" fill="white" stroke="none" />
          <g stroke="black" strokeWidth="2.2">
            <path d="M20.5 15.5H20.51M27.5 15.5H27.51" strokeWidth="2.6" />
            <path d="M20.5 19.5C21.5 20.6 22.7 21.2 24 21.2C25.3 21.2 26.5 20.6 27.5 19.5" />
          </g>
        </mask>
      </defs>

      {/* Matahari */}
      <circle
        cx="24"
        cy="16.5"
        r="9"
        fill="currentColor"
        stroke="none"
        mask={`url(#${maskId})`}
      />

      {/* Daun kiri */}
      <path
        d="M22.5 28C17.2 26 11.6 27.6 8.5 32.5C13.1 36.2 19.5 35.2 23 29.8Z"
        fill="currentColor"
        stroke="none"
        opacity="0.75"
      />

      {/* Daun kanan */}
      <path
        d="M25.5 28C30.8 26 36.4 27.6 39.5 32.5C34.9 36.2 28.5 35.2 25 29.8Z"
        fill="currentColor"
        stroke="none"
        opacity="0.5"
      />

      {/* Batang */}
      <path d="M24 29V40" opacity="0.8" />
    </svg>
  );
}