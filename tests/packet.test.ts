import { describe, expect, it } from "vitest";
import { EXPIRED_PACKET_COPY, packetAccess } from "../src/lib/packet";

const now = new Date("2026-08-28T12:00:00.000Z");

describe("TB-09 delivery", () => {
  it("allows PDF only after paid", () => {
    expect(
      packetAccess({
        paymentState: "none",
        packetToken: "abc",
        expiresAt: new Date("2026-09-27T12:00:00.000Z"),
        deletedAt: null,
      }, now),
    ).toEqual({ ok: false, reason: "unpaid" });
    expect(
      packetAccess({
        paymentState: "paid",
        packetToken: "abc",
        expiresAt: new Date("2026-09-27T12:00:00.000Z"),
        deletedAt: null,
      }, now),
    ).toEqual({ ok: true });
  });

  it("fails closed on an expired token", () => {
    const access = packetAccess({
      paymentState: "paid",
      packetToken: "abc",
      expiresAt: new Date("2026-07-01T12:00:00.000Z"),
      deletedAt: null,
    }, now);
    expect(access).toEqual({ ok: false, reason: "expired" });
    expect(EXPIRED_PACKET_COPY).toBe("This packet link has expired.");
  });

  it("fails closed after delete", () => {
    expect(
      packetAccess({
        paymentState: "paid",
        packetToken: "abc",
        expiresAt: new Date("2026-09-27T12:00:00.000Z"),
        deletedAt: now,
      }, now),
    ).toEqual({ ok: false, reason: "deleted" });
  });
});
