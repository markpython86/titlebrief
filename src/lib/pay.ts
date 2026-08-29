import { canReachPay } from "./eligibility";
import { randomBytes } from "crypto";

export type PayState = "none" | "pending" | "paid" | "failed";

export type PaySession = {
  eligible: boolean;
  rejectedType: string | null;
  salePriceCents: number | null;
  spvCents: number | null;
  taxTrace: unknown | null;
  paymentState: PayState;
  orderId: string | null;
  packetToken: string | null;
  expiresAt: Date | null;
};

export function newPacketToken(): string {
  return randomBytes(24).toString("base64url");
}

export function newOrderId(): string {
  return `tb_${randomBytes(12).toString("hex")}`;
}

export function assertCanPay(session: PaySession): {
  ok: true;
} | {
  ok: false;
  reason: "unsupported" | "incomplete";
} {
  if (!canReachPay(session)) {
    return { ok: false, reason: "unsupported" };
  }
  if (
    session.salePriceCents === null ||
    session.spvCents === null ||
    session.taxTrace === null
  ) {
    return { ok: false, reason: "incomplete" };
  }
  return { ok: true };
}

export function applyMockPay(
  session: PaySession,
  outcome: "success" | "fail",
  now: Date = new Date(),
): {
  ok: true;
  paymentState: PayState;
  orderId: string;
  packetToken: string | null;
  expiresAt: Date | null;
  idempotent: boolean;
} | {
  ok: false;
  reason: "unsupported" | "incomplete";
} {
  const gate = assertCanPay(session);
  if (!gate.ok) {
    return gate;
  }
  if (session.paymentState === "paid" && session.orderId && session.packetToken) {
    return {
      ok: true,
      paymentState: "paid",
      orderId: session.orderId,
      packetToken: session.packetToken,
      expiresAt: session.expiresAt,
      idempotent: true,
    };
  }
  const orderId = session.orderId ?? newOrderId();
  if (outcome === "fail") {
    return {
      ok: true,
      paymentState: "failed",
      orderId,
      packetToken: null,
      expiresAt: null,
      idempotent: false,
    };
  }
  const expiresAt = new Date(now.getTime());
  expiresAt.setUTCDate(expiresAt.getUTCDate() + 30);
  return {
    ok: true,
    paymentState: "paid",
    orderId,
    packetToken: session.packetToken ?? newPacketToken(),
    expiresAt,
    idempotent: false,
  };
}
