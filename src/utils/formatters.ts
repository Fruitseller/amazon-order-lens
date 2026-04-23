const LOCALE = "de-DE";
const EMPTY_PLACEHOLDER = "—";

const euroFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat(LOCALE, {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/Berlin",
});

function normalizeWhitespace(value: string): string {
  return value.replace(/[\u00A0\u202F]/g, " ");
}

export function formatEuro(value: number): string {
  return normalizeWhitespace(euroFormatter.format(value)).replace(/ (?=€$)/, "\u00A0");
}

export function formatPercent(fraction: number): string {
  return normalizeWhitespace(percentFormatter.format(fraction));
}

export function formatDate(value: Date | null): string {
  if (value === null) {
    return EMPTY_PLACEHOLDER;
  }
  return dateFormatter.format(value);
}

export function formatNumber(value: number, fractionDigits = 0): string {
  const formatter = new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  return normalizeWhitespace(formatter.format(value));
}

const MONTH_NAMES_DE: ReadonlyArray<string> = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

export function formatMonthKey(key: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(key);
  if (!match) return key;
  const month = parseInt(match[2] ?? "0", 10);
  const name = MONTH_NAMES_DE[month - 1];
  if (!name) return key;
  return `${name} ${match[1]}`;
}

export function formatWeekKey(key: string): string {
  const match = /^(\d{4})-W(\d{2})$/.exec(key);
  if (!match) return key;
  return `KW ${match[2]} / ${match[1]}`;
}
