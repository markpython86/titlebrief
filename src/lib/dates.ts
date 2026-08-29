const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseIsoDate(value: string): Date | null {
  const match = ISO_DATE.exec(value.trim());
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function utcToday(now: Date = new Date()): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export function addCalendarDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function calendarDaysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  const b = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate());
  return Math.round((b - a) / 86_400_000);
}

export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function titleDeadline(purchaseDate: Date): Date {
  return addCalendarDays(purchaseDate, 30);
}

export type DeadlineTone = "ok" | "warn" | "past";

export function deadlineTone(deadline: Date, now: Date = new Date()): DeadlineTone {
  const days = calendarDaysBetween(utcToday(now), deadline);
  if (days < 0) {
    return "past";
  }
  if (days <= 7) {
    return "warn";
  }
  return "ok";
}

export function isImplausiblyFuture(purchaseDate: Date, now: Date = new Date()): boolean {
  return calendarDaysBetween(utcToday(now), purchaseDate) > 0;
}

export function validatePurchaseDate(raw: string, now: Date = new Date()): {
  ok: true;
  iso: string;
} | {
  ok: false;
  error: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter the purchase date." };
  }
  const date = parseIsoDate(trimmed);
  if (!date) {
    return { ok: false, error: "Enter a valid purchase date." };
  }
  if (isImplausiblyFuture(date, now)) {
    return { ok: false, error: "Purchase date cannot be in the future." };
  }
  return { ok: true, iso: toIsoDate(date) };
}
