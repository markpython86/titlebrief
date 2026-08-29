import { describe, expect, it } from "vitest";
import { applyMockPay, type PaySession } from "../src/lib/pay";

const ready: PaySession = {
  eligible: true,
  rejectedType: null,
  salePriceCents: 1000000,
  spvCents: 1200000,
  taxTrace: { taxCents: 62500 },
  paymentState: "none",
  orderId: null,
  packetToken: null,
  expiresAt: null,
};

describe("TB-08 mock pay", () => {
  it("is idempotent after the first success", () => {
    const first = applyMockPay(ready, "success", new Date("2026-08-28T12:00:00.000Z"));
    expect(first.ok).toBe(true);
    if (!first.ok) {
      return;
    }
    expect(first.paymentState).toBe("paid");
    expect(first.packetToken).toBeTruthy();
    expect(first.idempotent).toBe(false);
    const second = applyMockPay({
      ...ready,
      paymentState: "paid",
      orderId: first.orderId,
      packetToken: first.packetToken,
      expiresAt: first.expiresAt,
    }, "success");
    expect(second.ok).toBe(true);
    if (!second.ok) {
      return;
    }
    expect(second.idempotent).toBe(true);
    expect(second.orderId).toBe(first.orderId);
    expect(second.packetToken).toBe(first.packetToken);
  });

  it("stays unpaid on mock fail and can retry", () => {
    const fail = applyMockPay(ready, "fail");
    expect(fail.ok).toBe(true);
    if (!fail.ok) {
      return;
    }
    expect(fail.paymentState).toBe("failed");
    expect(fail.packetToken).toBeNull();
    const retry = applyMockPay({
      ...ready,
      paymentState: "failed",
      orderId: fail.orderId,
    }, "success");
    expect(retry.ok).toBe(true);
    if (retry.ok) {
      expect(retry.paymentState).toBe("paid");
      expect(retry.orderId).toBe(fail.orderId);
    }
  });
});
