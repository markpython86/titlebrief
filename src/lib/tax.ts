import { asInt } from "./money";

export type TaxInputs = {
  salePriceCents: number;
  spvCents: number;
  rateBps: number;
  ruleVersionId: string;
  sourceDate: string;
};

export type TaxTrace = {
  salePriceCents: number;
  spvCents: number;
  eightyPctSpvCents: number;
  taxBaseCents: number;
  taxBaseSource: "sale_price" | "eighty_pct_spv";
  taxCents: number;
  rateBps: number;
  ruleVersionId: string;
  sourceDate: string;
  appraisalApplies: boolean;
  taxIfSaleBaseCents: number;
  potentialDifferenceCents: number;
};

export type AppraisalCompare = {
  potentialDifferenceCents: number;
  appraisalFeeCents: number;
  netEstimatedCents: number;
};

export function eightyPercentSpvCents(spvCents: number): number {
  return Math.round(asInt(spvCents) * 0.8);
}

export function taxOnCents(baseCents: number, rateBps: number): number {
  const base = Math.max(0, asInt(baseCents));
  const bps = Math.max(0, asInt(rateBps));
  return Math.round((base * bps) / 10_000);
}

export function computeTaxTrace(input: TaxInputs): TaxTrace {
  const salePriceCents = Math.max(0, asInt(input.salePriceCents));
  const spvCents = Math.max(0, asInt(input.spvCents));
  const eightyPct = eightyPercentSpvCents(spvCents);
  const appraisalApplies = salePriceCents < eightyPct;
  const taxBaseSource = salePriceCents >= eightyPct ? "sale_price" : "eighty_pct_spv";
  const taxBaseCents = Math.max(salePriceCents, eightyPct);
  const taxCents = taxOnCents(taxBaseCents, input.rateBps);
  const taxIfSaleBaseCents = taxOnCents(salePriceCents, input.rateBps);
  return {
    salePriceCents,
    spvCents,
    eightyPctSpvCents: eightyPct,
    taxBaseCents,
    taxBaseSource,
    taxCents,
    rateBps: asInt(input.rateBps),
    ruleVersionId: input.ruleVersionId,
    sourceDate: input.sourceDate,
    appraisalApplies,
    taxIfSaleBaseCents,
    potentialDifferenceCents: taxCents - taxIfSaleBaseCents,
  };
}

export function computeAppraisalCompare(
  trace: TaxTrace,
  appraisalFeeCents: number,
): AppraisalCompare | null {
  if (!trace.appraisalApplies) {
    return null;
  }
  const fee = Math.max(0, asInt(appraisalFeeCents));
  return {
    potentialDifferenceCents: trace.potentialDifferenceCents,
    appraisalFeeCents: fee,
    netEstimatedCents: trace.potentialDifferenceCents - fee,
  };
}
