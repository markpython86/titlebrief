import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { computeAppraisalCompare, computeTaxTrace } from "../src/lib/tax";
import { APPRAISAL_COMPARE_COPY } from "../src/lib/sources";

const rule = {
  rateBps: 625,
  ruleVersionId: "tx-mvst-96-254-2026-03",
  sourceDate: "2026-03-01",
};

describe("TB-04 appraisal comparison", () => {
  it("hides comparison when sale is at or above 80% SPV", () => {
    const equal = computeTaxTrace({
      salePriceCents: 8_000_00,
      spvCents: 10_000_00,
      ...rule,
    });
    const above = computeTaxTrace({
      salePriceCents: 9_000_00,
      spvCents: 10_000_00,
      ...rule,
    });
    expect(equal.appraisalApplies).toBe(false);
    expect(above.appraisalApplies).toBe(false);
    expect(computeAppraisalCompare(equal, 0)).toBeNull();
    expect(computeAppraisalCompare(above, 2500)).toBeNull();
  });

  it("shows estimated comparison language and net when sale is below 80% SPV", () => {
    const trace = computeTaxTrace({
      salePriceCents: 6_000_00,
      spvCents: 10_000_00,
      ...rule,
    });
    expect(trace.appraisalApplies).toBe(true);
    const compare = computeAppraisalCompare(trace, 15_000);
    expect(compare).not.toBeNull();
    expect(compare?.potentialDifferenceCents).toBe(trace.potentialDifferenceCents);
    expect(compare?.netEstimatedCents).toBe(trace.potentialDifferenceCents - 15_000);
    expect(APPRAISAL_COMPARE_COPY).toContain("Estimated comparison");
    expect(APPRAISAL_COMPARE_COPY).not.toMatch(/you should get that document/i);
    expect(APPRAISAL_COMPARE_COPY).not.toMatch(/you will reduce tax/i);
  });
});
