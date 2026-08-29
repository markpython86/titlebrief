import { z } from "zod";
import { ELIGIBILITY_QUESTIONS, type EligibilityAnswers, type YesNo } from "./eligibility";
import { parseMoneyInput } from "./money";
import { validatePurchaseDate } from "./dates";

export const COUNTY_IDS = ["travis", "harris", "williamson", "dallas"] as const;
export type CountyId = (typeof COUNTY_IDS)[number];

const yesNo = z.enum(["yes", "no"]);

export const eligibilityInputSchema = z.object({
  texasPrivateParty: yesNo,
  passengerVehicle: yesNo,
  notSalvageRebuiltBonded: yesNo,
  notGiftInheritance: yesNo,
  notDealer: yesNo,
  notOutOfState: yesNo,
  notLienComplex: yesNo,
  requiredCopy: yesNo,
});

export function parseEligibilityInput(raw: unknown): {
  ok: true;
  answers: EligibilityAnswers;
} | {
  ok: false;
  error: string;
} {
  const parsed = eligibilityInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Answer every eligibility question." };
  }
  return { ok: true, answers: parsed.data };
}

export function parseFactsInput(
  raw: { salePrice: string; purchaseDate: string; countyId: string },
  now: Date = new Date(),
): {
  ok: true;
  salePriceCents: number;
  purchaseDate: string;
  countyId: CountyId;
} | {
  ok: false;
  fieldErrors: Partial<Record<"salePrice" | "purchaseDate" | "countyId", string>>;
} {
  const fieldErrors: Partial<Record<"salePrice" | "purchaseDate" | "countyId", string>> = {};
  const money = parseMoneyInput(raw.salePrice);
  if (!money.ok) {
    fieldErrors.salePrice = money.error;
  }
  const date = validatePurchaseDate(raw.purchaseDate, now);
  if (!date.ok) {
    fieldErrors.purchaseDate = date.error;
  }
  const county = z.enum(COUNTY_IDS).safeParse(raw.countyId);
  if (!county.success) {
    fieldErrors.countyId = "Choose Travis, Harris, Williamson, or Dallas.";
  }
  if (fieldErrors.salePrice || fieldErrors.purchaseDate || fieldErrors.countyId) {
    return { ok: false, fieldErrors };
  }
  return {
    ok: true,
    salePriceCents: money.ok ? money.cents : 0,
    purchaseDate: date.ok ? date.iso : "",
    countyId: county.data as CountyId,
  };
}

export function parseSpvInput(raw: string): {
  ok: true;
  spvCents: number;
} | {
  ok: false;
  error: string;
} {
  const money = parseMoneyInput(raw);
  if (!money.ok) {
    return money;
  }
  return { ok: true, spvCents: money.cents };
}

export function parseAppraisalFeeInput(raw: string): {
  ok: true;
  appraisalFeeCents: number;
} | {
  ok: false;
  error: string;
} {
  if (!raw.trim()) {
    return { ok: true, appraisalFeeCents: 0 };
  }
  const money = parseMoneyInput(raw);
  if (!money.ok) {
    return money;
  }
  return { ok: true, appraisalFeeCents: money.cents };
}

export { type YesNo };
export { ELIGIBILITY_QUESTIONS };
