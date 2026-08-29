import { describe, expect, it } from "vitest";
import { calendarDaysBetween, deadlineTone, parseIsoDate, titleDeadline } from "../src/lib/dates";
import { DEADLINE_COPY } from "../src/lib/sources";

describe("TB-05 deadline", () => {
  it("adds 30 calendar days from the purchase date", () => {
    const purchase = parseIsoDate("2026-08-01");
    expect(purchase).not.toBeNull();
    const deadline = titleDeadline(purchase!);
    expect(deadline.toISOString().slice(0, 10)).toBe("2026-08-31");
    expect(calendarDaysBetween(purchase!, deadline)).toBe(30);
  });

  it("warns within 7 days and when past", () => {
    const deadline = titleDeadline(parseIsoDate("2026-08-01")!);
    expect(deadlineTone(deadline, new Date("2026-08-28T12:00:00.000Z"))).toBe("warn");
    expect(deadlineTone(deadline, new Date("2026-08-10T12:00:00.000Z"))).toBe("ok");
    expect(deadlineTone(deadline, new Date("2026-09-20T12:00:00.000Z"))).toBe("past");
  });

  it("uses the frozen 30-day copy", () => {
    expect(DEADLINE_COPY).toBe("Texas requires title transfer within 30 days of purchase.");
    expect(DEADLINE_COPY.toLowerCase()).not.toContain("working");
  });
});
