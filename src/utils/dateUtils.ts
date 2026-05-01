const BERLIN_TZ = "Europe/Berlin";

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

const berlinPartsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: BERLIN_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  weekday: "short",
  hour12: false,
});

interface BerlinParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  weekday: number;
}

const ISO_WEEKDAY_MAP: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

export const dayOfWeekLabelsDE: ReadonlyArray<string> = [
  "Mo",
  "Di",
  "Mi",
  "Do",
  "Fr",
  "Sa",
  "So",
];

function getBerlinParts(date: Date): BerlinParts {
  const parts = berlinPartsFormatter.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }
  const rawHour = parseInt(map.hour ?? "0", 10);
  return {
    year: parseInt(map.year ?? "0", 10),
    month: parseInt(map.month ?? "0", 10),
    day: parseInt(map.day ?? "0", 10),
    hour: rawHour === 24 ? 0 : rawHour,
    weekday: ISO_WEEKDAY_MAP[map.weekday ?? ""] ?? 0,
  };
}

export function getDayOfWeek(date: Date): number {
  return getBerlinParts(date).weekday;
}

export function getHourOfDay(date: Date): number {
  return getBerlinParts(date).hour;
}

export function getMonthKey(date: Date): string {
  const { year, month } = getBerlinParts(date);
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function getYear(date: Date): number {
  return getBerlinParts(date).year;
}

export function getISOWeekKey(date: Date): string {
  const { year, month, day, weekday } = getBerlinParts(date);
  const isoDow = weekday + 1;
  const thursday = new Date(Date.UTC(year, month - 1, day + (4 - isoDow)));
  const isoYear = thursday.getUTCFullYear();
  const jan4 = new Date(Date.UTC(isoYear, 0, 4));
  const jan4DowUTC = jan4.getUTCDay() || 7;
  const week1Monday = new Date(Date.UTC(isoYear, 0, 4 - (jan4DowUTC - 1)));
  const diffDays = Math.floor(
    (thursday.getTime() - week1Monday.getTime()) / MS_PER_DAY,
  );
  const week = Math.floor(diffDays / 7) + 1;
  return `${isoYear}-W${String(week).padStart(2, "0")}`;
}
