export function asInt(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.trunc(value);
}

export function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(asInt(cents));
  const dollars = Math.floor(abs / 100);
  const rem = abs % 100;
  return `${sign}$${dollars.toLocaleString("en-US")}.${String(rem).padStart(2, "0")}`;
}

export function formatRateBps(rateBps: number): string {
  const bps = Math.max(0, asInt(rateBps));
  return `${(bps / 100).toFixed(2)}%`;
}

export function dollarsToCents(raw: string | number): number | null {
  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) {
      return null;
    }
    return Math.round(raw * 100);
  }
  const trimmed = raw.trim().replace(/[$,]/g, "");
  if (!trimmed) {
    return null;
  }
  if (!/^-?\d+(\.\d{1,2})?$/.test(trimmed)) {
    return null;
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n)) {
    return null;
  }
  return Math.round(n * 100);
}

export function parseMoneyInput(raw: string): {
  ok: true;
  cents: number;
} | {
  ok: false;
  error: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter a dollar amount." };
  }
  const cents = dollarsToCents(trimmed);
  if (cents === null) {
    return { ok: false, error: "Enter a valid dollar amount." };
  }
  if (cents < 0) {
    return { ok: false, error: "Amount cannot be negative." };
  }
  return { ok: true, cents };
}
