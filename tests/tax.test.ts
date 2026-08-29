import { describe, expect, it } from "vitest";
import { computeAppraisalCompare, computeTaxTrace } from "../src/lib/tax";

const rule = {
  rateBps: 625,
  ruleVersionId: "tx-mvst-96-254-2026-03",
  sourceDate: "2026-03-01",
};

describe("TB-03 tax engine", () => {
  it("uses 80% SPV when sale is below 80% SPV", () => {
    const trace = computeTaxTrace({
      salePriceCents: 8_000_00,
      spvCents: 12_000_00,
      ...rule,
    });
    expect(trace.eightyPctSpvCents).toBe(9_600_00);
    expect(trace.taxBaseCents).toBe(9_600_00);
    expect(trace.taxBaseSource).toBe("eighty_pct_spv");
    expect(trace.appraisalApplies).toBe(true);
    expect(trace.taxCents).toBe(60_000);
    expect(trace.ruleVersionId).toBe(rule.ruleVersionId);
    expect(trace.sourceDate).toBe("2026-03-01");
  });

  it("uses sale price when sale equals 80% SPV", () => {
    const trace = computeTaxTrace({
      salePriceCents: 9_600_00,
      spvCents: 12_000_00,
      ...rule,
    });
    expect(trace.eightyPctSpvCents).toBe(9_600_00);
    expect(trace.taxBaseCents).toBe(9_600_00);
    expect(trace.taxBaseSource).toBe("sale_price");
    expect(trace.appraisalApplies).toBe(false);
    expect(trace.taxCents).toBe(60_000);
    expect(computeAppraisalCompare(trace, 0)).toBeNull();
  });

  it("uses sale price when sale is above 80% SPV", () => {
    const trace = computeTaxTrace({
      salePriceCents: 15_000_00,
      spvCents: 12_000_00,
      ...rule,
    });
    expect(trace.eightyPctSpvCents).toBe(9_600_00);
    expect(trace.taxBaseCents).toBe(15_000_00);
    expect(trace.taxBaseSource).toBe("sale_price");
    expect(trace.appraisalApplies).toBe(false);
    expect(trace.taxCents).toBe(93_750);
    expect(computeAppraisalCompare(trace, 15_000)).toBeNull();
  });
});
