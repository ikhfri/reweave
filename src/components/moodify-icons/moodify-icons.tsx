import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const baseProps = {
  viewBox: "0 0 48 48",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
} as const;

/* =========================================================
   HOME
   Balanced house / home
========================================================= */

export function HomeIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      {...baseProps}
      {...props}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 22.5L24 11L38 22.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M13.5 21.5V36.5C13.5 37.3 14.2 38 15 38H33C33.8 38 34.5 37.3 34.5 36.5V21.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M20 38V28C20 27.4 20.4 27 21 27H27C27.6 27 28 27.4 28 28V38"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M21 17H21.01M27 17H27.01"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   CHECK-IN
   Heart + calm expression
========================================================= */

export function CheckinIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      {...baseProps}
      {...props}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M24 38.5C19 35.6 10 29.4 10 19.4C10 13.8 13.7 10 18.2 10C20.9 10 23 11.4 24 13.7C25 11.4 27.1 10 29.8 10C34.3 10 38 13.8 38 19.4C38 29.4 29 35.6 24 38.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M18.5 19.5H18.6M29.4 19.5H29.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      <path
        d="M18.5 25C20 26.6 21.8 27.4 24 27.4C26.2 27.4 28 26.6 29.5 25"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   DIARY
   Clean journal
========================================================= */

export function DiaryIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      {...baseProps}
      {...props}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M14 9.5C14 8.1 15.1 7 16.5 7H34V39H16.5C15.1 39 14 37.9 14 36.5V9.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      <path
        d="M14 11.5C15.1 10.6 16.4 10 18 10H34"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M19 16H29"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M19 22H31"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M19 28H27"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M19 34H29"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   INSIGHTS
   Balanced growth chart
========================================================= */

export function InsightIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      {...baseProps}
      {...props}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M9.5 34C13.5 33 15.2 28.2 18.3 26.5C21 25 22.5 25.8 24.8 22.5C27.3 19 28.5 14.5 35 11.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="9.5"
        cy="34"
        r="2.1"
        fill="currentColor"
      />

      <circle
        cx="18.3"
        cy="26.5"
        r="2.1"
        fill="currentColor"
      />

      <circle
        cx="24.8"
        cy="22.5"
        r="2.1"
        fill="currentColor"
      />

      <circle
        cx="35"
        cy="11.5"
        r="2.1"
        fill="currentColor"
      />

      <path
        d="M35 11.5H29.5M35 11.5V17"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   MOOD CALENDAR
========================================================= */

export function CalendarMoodIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      {...baseProps}
      {...props}
      className={className}
      aria-hidden="true"
    >
      <rect
        x="9"
        y="10"
        width="30"
        height="28"
        rx="6"
        stroke="currentColor"
        strokeWidth="2"
      />

      <path
        d="M15 8V14M33 8V14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M9 18H39"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M19 25H19.01M29 25H29.01"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      <path
        d="M19.5 30C20.8 31.3 22.3 32 24 32C25.7 32 27.2 31.3 28.5 30"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   ACTIVITIES
   Heart / self-care
========================================================= */

export function ActivityIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      {...baseProps}
      {...props}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M24 38C18 33.8 12 28.3 12 21.6C12 16.7 15.1 13 19.1 13C21.5 13 23.2 14.2 24 16.3C24.8 14.2 26.5 13 28.9 13C32.9 13 36 16.7 36 21.6C36 28.3 30 33.8 24 38Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M17 22.5C19.1 21 21.3 21 24 22.5C26.7 21 28.9 21 31 22.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M24 18V29"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   SUPPORT
   Speech bubble + calm face
========================================================= */

export function SupportIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      {...baseProps}
      {...props}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M24 9.5C16.3 9.5 10 14.5 10 21.4C10 25.7 12.5 29.4 16.4 31.5L15 37L21.5 33.5C22.3 33.6 23.2 33.7 24 33.7C31.7 33.7 38 28.7 38 21.4C38 14.5 31.7 9.5 24 9.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M19 20.5H19.01M29 20.5H29.01"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      <path
        d="M18.5 25C20 26.5 21.8 27.2 24 27.2C26.2 27.2 28 26.5 29.5 25"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

export function SettingsIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      {...baseProps}
      {...props}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M11 15H37M11 24H37M11 33H37"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <circle
        cx="20"
        cy="15"
        r="3"
        fill="#FDFBF7"
        stroke="currentColor"
        strokeWidth="2"
      />

      <circle
        cx="29"
        cy="24"
        r="3"
        fill="#FDFBF7"
        stroke="currentColor"
        strokeWidth="2"
      />

      <circle
        cx="19"
        cy="33"
        r="3"
        fill="#FDFBF7"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

/* =========================================================
   BACK
========================================================= */

export function BackIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      {...baseProps}
      {...props}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M29.5 12.5L18 24L29.5 35.5"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M18.5 24H39"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   ARROW RIGHT
========================================================= */

export function ArrowRightIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      {...baseProps}
      {...props}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M9 24H38"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M29 16L37 24L29 32"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================================================
   PRIVACY
========================================================= */

export function PrivacyIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      {...baseProps}
      {...props}
      className={className}
      aria-hidden="true"
    >
      <rect
        x="12"
        y="20"
        width="24"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
      />

      <path
        d="M17 20V16.5C17 12.4 20.1 9.5 24 9.5C27.9 9.5 31 12.4 31 16.5V20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <circle
        cx="24"
        cy="27.5"
        r="2"
        fill="currentColor"
      />

      <path
        d="M24 29.5V33"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   USER
========================================================= */

export function UserIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      {...baseProps}
      {...props}
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="24"
        cy="17"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
      />

      <path
        d="M12 38C13.7 31.8 17.7 28.5 24 28.5C30.3 28.5 34.3 31.8 36 38"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   WELLBEING
   Heart + calm face
========================================================= */

export function WellbeingIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      {...baseProps}
      {...props}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M24 38C19.2 35 10 28.7 10 19.3C10 13.8 13.7 10 18.2 10C20.9 10 23 11.5 24 14C25 11.5 27.1 10 29.8 10C34.3 10 38 13.8 38 19.3C38 28.7 28.8 35 24 38Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M19 19.5H19.01M29 19.5H29.01"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
      />

      <path
        d="M18.5 24.5C20 26 21.8 26.8 24 26.8C26.2 26.8 28 26 29.5 24.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   MOODIFY MARK
   Main brand mark
========================================================= */

export function MoodifyMark({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      {...baseProps}
      {...props}
      className={className}
      aria-hidden="true"
    >
      {/* Sun / mood */}

      <circle
        cx="24"
        cy="16.5"
        r="8"
        fill="currentColor"
      />

      {/* Face */}

      <path
        d="M20.5 16.5H20.51M27.5 16.5H27.51"
        stroke="#FDFBF7"
        strokeWidth="2.3"
        strokeLinecap="round"
      />

      <path
        d="M20.5 20C21.5 21 22.7 21.5 24 21.5C25.3 21.5 26.5 21 27.5 20"
        stroke="#FDFBF7"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Left leaf */}

      <path
        d="M22.5 27.5C17.5 25.5 12.3 27.1 9.5 31.5C13.8 34.8 19.7 33.8 23 29"
        fill="currentColor"
        opacity="0.72"
      />

      {/* Right leaf */}

      <path
        d="M25.5 27.5C30.5 25.5 35.7 27.1 38.5 31.5C34.2 34.8 28.3 33.8 25 29"
        fill="currentColor"
        opacity="0.48"
      />

      {/* Stem */}

      <path
        d="M24 28.5V37"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}
