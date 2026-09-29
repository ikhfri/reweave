/**
 * Convert a Date into the user's local date and time.
 *
 * Example:
 * getLocalDateTime(new Date(), "Asia/Jakarta")
 *
 * Returns:
 * {
 *   date: "2026-09-29",
 *   time: "21:30"
 * }
 */
export function getLocalDateTime(
  date: Date,
  timezone: string,
) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
}

/**
 * Get the UTC start and end boundaries of the user's local day.
 *
 * Example for Asia/Jakarta:
 *
 * Local:
 * 2026-09-29 00:00
 *        ↓
 * UTC:
 * 2026-09-28 17:00
 *
 * End:
 * 2026-09-30 00:00 local
 *        ↓
 * UTC:
 * 2026-09-29 17:00
 *
 * Query should use:
 *
 * gte: start
 * lt: end
 */
export function getLocalDayRange(
  date: Date,
  timezone: string,
) {
  const localDateTime = getLocalDateTime(
    date,
    timezone,
  );

  const [year, month, day] = localDateTime.date
    .split("-")
    .map(Number);

  /**
   * Gunakan waktu tengah hari sebagai
   * reference point untuk mendapatkan
   * offset timezone.
   */
  const referenceUtc = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      12,
      0,
      0,
    ),
  );

  const formatter = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    },
  );

  const parts = formatter.formatToParts(
    referenceUtc,
  );

  const values = Object.fromEntries(
    parts.map((part) => [
      part.type,
      part.value,
    ]),
  );

  /**
   * Representasi waktu lokal yang sedang
   * direpresentasikan sebagai UTC.
   */
  const representedUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );

  /**
   * Offset timezone dalam milliseconds.
   *
   * Contoh Asia/Jakarta:
   * +07:00
   */
  const offset =
    representedUtc -
    referenceUtc.getTime();

  /**
   * Local midnight → UTC.
   */
  const localMidnightUtc =
    Date.UTC(
      year,
      month - 1,
      day,
      0,
      0,
      0,
    ) - offset;

  const start = new Date(
    localMidnightUtc,
  );

  /**
   * End = awal hari berikutnya.
   *
   * Query sebaiknya:
   *
   * gte: start
   * lt: end
   */
  const end = new Date(
    localMidnightUtc +
      24 * 60 * 60 * 1000,
  );

  return {
    start,
    end,
    date: localDateTime.date,
  };
}