"use server";

import { revalidatePath } from "next/cache";
import { getPrisma } from "./db";
import { getOrCreateSession, resetSession, toSessionDTO } from "./session";
import { evaluateEligibility } from "./eligibility";
import {
  parseAppraisalFeeInput,
  parseEligibilityInput,
  parseFactsInput,
  parseSpvInput,
} from "./validations";
import { computeTaxTrace } from "./tax";
import { getActiveRule, toRuleDTO } from "./rules";
import { applyMockPay } from "./pay";
import { packetAccess } from "./packet";
import { writeLocalEmail } from "./email";
import type { SessionDTO } from "./types";

export type ActionResult =
  | { ok: true; session: SessionDTO; inboxPath?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

async function persist(): Promise<SessionDTO> {
  const row = await getOrCreateSession();
  return toSessionDTO(row);
}

export async function ensureSessionAction(): Promise<ActionResult> {
  const row = await getOrCreateSession();
  return { ok: true, session: toSessionDTO(row) };
}

export async function startOverAction(): Promise<ActionResult> {
  const row = await resetSession();
  revalidatePath("/");
  return { ok: true, session: toSessionDTO(row) };
}

export async function submitEligibilityAction(
  raw: unknown,
): Promise<ActionResult> {
  const parsed = parseEligibilityInput(raw);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const result = evaluateEligibility(parsed.answers);
  const db = getPrisma();
  const current = await getOrCreateSession();
  if (current.paymentState === "paid") {
    return { ok: false, error: "This session is already paid." };
  }
  const updated = await db.session.update({
    where: { id: current.id },
    data: result.ok
      ? {
          eligible: true,
          rejectedType: null,
          answersJson: JSON.stringify(result.answers),
          step: "facts",
        }
      : {
          eligible: false,
          rejectedType: result.rejectedType,
          answersJson: JSON.stringify(result.answers),
          step: "unsupported",
        },
  });
  revalidatePath("/");
  return { ok: true, session: toSessionDTO(updated) };
}

export async function submitFactsAction(raw: {
  salePrice: string;
  purchaseDate: string;
  countyId: string;
}): Promise<ActionResult> {
  const current = await getOrCreateSession();
  if (current.paymentState === "paid") {
    return { ok: false, error: "This session is already paid." };
  }
  if (!current.eligible || current.rejectedType) {
    return { ok: false, error: "Eligibility is required first." };
  }
  const parsed = parseFactsInput(raw);
  if (!parsed.ok) {
    return {
      ok: false,
      error: "Check the highlighted fields.",
      fieldErrors: parsed.fieldErrors,
    };
  }
  const db = getPrisma();
  const updated = await db.session.update({
    where: { id: current.id },
    data: {
      salePriceCents: parsed.salePriceCents,
      purchaseDate: parsed.purchaseDate,
      countyId: parsed.countyId,
      step: "spv",
      taxTraceJson: null,
    },
  });
  revalidatePath("/");
  return { ok: true, session: toSessionDTO(updated) };
}

export async function submitSpvAction(raw: { spv: string }): Promise<ActionResult> {
  const current = await getOrCreateSession();
  if (current.paymentState === "paid") {
    return { ok: false, error: "This session is already paid." };
  }
  if (!current.eligible || current.salePriceCents === null) {
    return { ok: false, error: "Enter purchase facts first." };
  }
  const parsed = parseSpvInput(raw.spv);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error, fieldErrors: { spv: parsed.error } };
  }
  const rule = await getActiveRule();
  if (!rule) {
    return { ok: false, error: "Missing rule version." };
  }
  const trace = computeTaxTrace({
    salePriceCents: current.salePriceCents,
    spvCents: parsed.spvCents,
    rateBps: rule.rateBps,
    ruleVersionId: rule.id,
    sourceDate: toRuleDTO(rule).sourceDate,
  });
  const nextStep = trace.appraisalApplies ? "appraisal" : "county";
  const db = getPrisma();
  const updated = await db.session.update({
    where: { id: current.id },
    data: {
      spvCents: parsed.spvCents,
      taxTraceJson: JSON.stringify(trace),
      ruleVersionId: rule.id,
      step: "tax",
    },
  });
  void nextStep;
  revalidatePath("/");
  return { ok: true, session: toSessionDTO({ ...updated, step: "tax" }) };
}

export async function continueFromTaxAction(): Promise<ActionResult> {
  const current = await getOrCreateSession();
  if (!current.taxTraceJson) {
    return { ok: false, error: "Tax preview is not ready." };
  }
  const trace = JSON.parse(current.taxTraceJson) as { appraisalApplies: boolean };
  const db = getPrisma();
  const updated = await db.session.update({
    where: { id: current.id },
    data: { step: trace.appraisalApplies ? "appraisal" : "county" },
  });
  revalidatePath("/");
  return { ok: true, session: toSessionDTO(updated) };
}

export async function submitAppraisalAction(raw: {
  appraisalFee: string;
}): Promise<ActionResult> {
  const current = await getOrCreateSession();
  if (current.paymentState === "paid") {
    return { ok: false, error: "This session is already paid." };
  }
  if (!current.taxTraceJson) {
    return { ok: false, error: "Tax preview is not ready." };
  }
  const parsed = parseAppraisalFeeInput(raw.appraisalFee);
  if (!parsed.ok) {
    return {
      ok: false,
      error: parsed.error,
      fieldErrors: { appraisalFee: parsed.error },
    };
  }
  const db = getPrisma();
  const updated = await db.session.update({
    where: { id: current.id },
    data: {
      appraisalFeeCents: parsed.appraisalFeeCents,
      step: "county",
    },
  });
  revalidatePath("/");
  return { ok: true, session: toSessionDTO(updated) };
}

export async function continueFromCountyAction(): Promise<ActionResult> {
  const current = await getOrCreateSession();
  if (!current.eligible || current.rejectedType) {
    return { ok: false, error: "Unsupported cases cannot continue to pay." };
  }
  if (!current.taxTraceJson) {
    return { ok: false, error: "Tax preview is not ready." };
  }
  const db = getPrisma();
  const updated = await db.session.update({
    where: { id: current.id },
    data: { step: "pay" },
  });
  revalidatePath("/");
  return { ok: true, session: toSessionDTO(updated) };
}

export async function goBackAction(step: string): Promise<ActionResult> {
  const current = await getOrCreateSession();
  if (current.paymentState === "paid") {
    return { ok: false, error: "Paid packets cannot go back." };
  }
  const allowed = new Set([
    "eligibility",
    "facts",
    "spv",
    "tax",
    "appraisal",
    "county",
    "pay",
  ]);
  if (!allowed.has(step)) {
    return { ok: false, error: "Cannot open that step." };
  }
  const db = getPrisma();
  const updated = await db.session.update({
    where: { id: current.id },
    data: { step },
  });
  revalidatePath("/");
  return { ok: true, session: toSessionDTO(updated) };
}

export async function mockPayAction(outcome: "success" | "fail"): Promise<ActionResult> {
  const current = await getOrCreateSession();
  const result = applyMockPay(
    {
      eligible: current.eligible,
      rejectedType: current.rejectedType,
      salePriceCents: current.salePriceCents,
      spvCents: current.spvCents,
      taxTrace: current.taxTraceJson,
      paymentState: current.paymentState as "none" | "pending" | "paid" | "failed",
      orderId: current.orderId,
      packetToken: current.packetToken,
      expiresAt: current.expiresAt,
    },
    outcome,
  );
  if (!result.ok) {
    return {
      ok: false,
      error:
        result.reason === "unsupported"
          ? "Unsupported cases cannot pay."
          : "Complete the preview before paying.",
    };
  }
  const db = getPrisma();
  const updated = await db.session.update({
    where: { id: current.id },
    data: {
      paymentState: result.paymentState,
      orderId: result.orderId,
      packetToken: result.packetToken,
      expiresAt: result.expiresAt,
      step: result.paymentState === "paid" ? "packet" : "pay",
    },
  });
  revalidatePath("/");
  return { ok: true, session: toSessionDTO(updated) };
}

export async function emailPacketAction(): Promise<ActionResult> {
  const current = await getOrCreateSession();
  const access = packetAccess(current);
  if (!access.ok) {
    return {
      ok: false,
      error:
        access.reason === "expired"
          ? "This packet link has expired."
          : "Packet is not available.",
    };
  }
  const path = await writeLocalEmail(toSessionDTO(current));
  return { ok: true, session: toSessionDTO(current), inboxPath: path };
}

export async function deletePacketAction(): Promise<ActionResult> {
  const current = await getOrCreateSession();
  const db = getPrisma();
  const updated = await db.session.update({
    where: { id: current.id },
    data: {
      deletedAt: new Date(),
      step: "deleted",
    },
  });
  revalidatePath("/");
  return { ok: true, session: toSessionDTO(updated) };
}

export async function refreshSessionAction(): Promise<ActionResult> {
  return { ok: true, session: await persist() };
}
