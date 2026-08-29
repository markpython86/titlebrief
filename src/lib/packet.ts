export type PacketSession = {
  paymentState: string;
  packetToken: string | null;
  expiresAt: Date | null;
  deletedAt: Date | null;
};

export type PacketAccess =
  | { ok: true }
  | { ok: false; reason: "unpaid" | "expired" | "deleted" | "missing" };

export function packetAccess(
  session: PacketSession | null,
  now: Date = new Date(),
): PacketAccess {
  if (!session || !session.packetToken) {
    return { ok: false, reason: "missing" };
  }
  if (session.deletedAt) {
    return { ok: false, reason: "deleted" };
  }
  if (session.paymentState !== "paid") {
    return { ok: false, reason: "unpaid" };
  }
  if (!session.expiresAt || session.expiresAt.getTime() <= now.getTime()) {
    return { ok: false, reason: "expired" };
  }
  return { ok: true };
}

export const EXPIRED_PACKET_COPY = "This packet link has expired.";
