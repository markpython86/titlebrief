import { describe, expect, it } from "vitest";
import { computeTaxTrace } from "../src/lib/tax";
import { parseAppraisalFeeInput, parseFactsInput, parseSpvInput } from "../src/lib/validations";

const now = new Date("2026-08-28T12:00:00.000Z");

describe("TB-02 input validation", () => {
  it("rejects empty, non-numeric, and negative money", () => {
    expect(parseFactsInput({
      salePrice: "",
      purchaseDate: "2026-08-01",
      countyId: "travis",
    }, now).ok).toBe(false);
    expect(parseFactsInput({
      salePrice: "abc",
      purchaseDate: "2026-08-01",
      countyId: "travis",
    }, now).ok).toBe(false);
    const negative = parseFactsInput({
      salePrice: "-10",
      purchaseDate: "2026-08-01",
      countyId: "travis",
    }, now);
    expect(negative.ok).toBe(false);
    if (!negative.ok) {
      expect(negative.fieldErrors.salePrice).toMatch(/negative/i);
    }
    expect(parseSpvInput("nope").ok).toBe(false);
    expect(parseSpvInput("-1").ok).toBe(false);
  });

  it("rejects an implausibly future purchase date", () => {
    const result = parseFactsInput({
      salePrice: "10000",
      purchaseDate: "2026-09-15",
      countyId: "dallas",
    }, now);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.purchaseDate).toMatch(/future/i);
    }
  });

  it("accepts valid money, today, and a locked county", () => {
    const result = parseFactsInput({
      salePrice: "10,250.50",
      purchaseDate: "2026-08-28",
      countyId: "harris",
    }, now);
    expect(result).toEqual({
      ok: true,
      salePriceCents: 1_025_050,
      purchaseDate: "2026-08-28",
      countyId: "harris",
    });
  });
});

describe("SPV persist shape (submitSpvAction contract)", () => {
  it("maps the pasted official SPV onto spvCents, not cents", () => {
    const parsed = parseSpvInput("12000");
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }
    expect(parsed.spvCents).toBe(1_200_000);
    expect("cents" in parsed).toBe(false);
    const trace = computeTaxTrace({
      salePriceCents: 8_000_00,
      spvCents: parsed.spvCents,
      rateBps: 625,
      ruleVersionId: "tx-mvst-96-254-2026-03",
      sourceDate: "2026-03-01",
    });
    expect(trace.spvCents).toBe(1_200_000);
    expect(trace.eightyPctSpvCents).toBe(9_600_00);
    expect(trace.taxBaseCents).toBe(9_600_00);
    expect(trace.taxCents).toBe(60_000);
    expect(trace.appraisalApplies).toBe(true);
  });

  it("maps an appraisal fee onto appraisalFeeCents", () => {
    const empty = parseAppraisalFeeInput("");
    expect(empty).toEqual({ ok: true, appraisalFeeCents: 0 });
    const parsed = parseAppraisalFeeInput("150");
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }
    expect(parsed.appraisalFeeCents).toBe(15_000);
    expect("cents" in parsed).toBe(false);
  });
});
