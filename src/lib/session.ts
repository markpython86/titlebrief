import { cookies } from "next/headers";
import type { Session } from "@prisma/client";
import { getPrisma } from "./db";
import type { EligibilityAnswers } from "./eligibility";
import type { TaxTrace } from "./tax";
import type { PayState } from "./pay";
import type { CountyId } from "./validations";
import type { SessionDTO, StepId } from "./types";

export const SESSION_COOKIE = "tb_session";

function asStep(value: string): StepId {
  return value as StepId;
}

export function toSessionDTO(row: Session): SessionDTO {
  return {
    id: row.id,
    step: asStep(row.step),
    eligible: row.eligible,
    rejectedType: row.rejectedType,
    answers: row.answersJson
      ? (JSON.parse(row.answersJson) as Partial<EligibilityAnswers>)
      : null,
    salePriceCents: row.salePriceCents,
    purchaseDate: row.purchaseDate,
    countyId: (row.countyId as CountyId | null) ?? null,
    spvCents: row.spvCents,
    appraisalFeeCents: row.appraisalFeeCents,
    taxTrace: row.taxTraceJson
      ? (JSON.parse(row.taxTraceJson) as TaxTrace)
      : null,
    ruleVersionId: row.ruleVersionId,
    paymentState: row.paymentState as PayState,
    orderId: row.orderId,
    packetToken: row.packetToken,
    expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
    deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
  };
}

export async function getOrCreateSession(): Promise<Session> {
  const store = await cookies();
  const existingId = store.get(SESSION_COOKIE)?.value;
  const db = getPrisma();
  if (existingId) {
    const found = await db.session.findUnique({ where: { id: existingId } });
    if (found) {
      return found;
    }
  }
  const created = await db.session.create({ data: {} });
  store.set(SESSION_COOKIE, created.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return created;
}

export async function resetSession(): Promise<Session> {
  const store = await cookies();
  const db = getPrisma();
  const created = await db.session.create({ data: {} });
  store.set(SESSION_COOKIE, created.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return created;
}

export async function getExistingSession(): Promise<Session | null> {
  const store = await cookies();
  const existingId = store.get(SESSION_COOKIE)?.value;
  if (!existingId) {
    return null;
  }
  return getPrisma().session.findUnique({ where: { id: existingId } });
}

export function emptySessionDTO(): import("./types").SessionDTO {
  return {
    id: "",
    step: "eligibility",
    eligible: false,
    rejectedType: null,
    answers: null,
    salePriceCents: null,
    purchaseDate: null,
    countyId: null,
    spvCents: null,
    appraisalFeeCents: null,
    taxTrace: null,
    ruleVersionId: null,
    paymentState: "none",
    orderId: null,
    packetToken: null,
    expiresAt: null,
    deletedAt: null,
  };
}
