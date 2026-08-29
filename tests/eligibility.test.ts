import { describe, expect, it } from "vitest";
import { canReachPay, evaluateEligibility, type EligibilityAnswers } from "../src/lib/eligibility";
import { applyMockPay } from "../src/lib/pay";

const yesAll: EligibilityAnswers = {
  texasPrivateParty: "yes",
  passengerVehicle: "yes",
  notSalvageRebuiltBonded: "yes",
  notGiftInheritance: "yes",
  notDealer: "yes",
  notOutOfState: "yes",
  notLienComplex: "yes",
  requiredCopy: "yes",
};

describe("TB-01 unsupported cannot pay", () => {
  it("rejects salvage before checkout and names the type", () => {
    const result = evaluateEligibility({ ...yesAll, notSalvageRebuiltBonded: "no" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.rejectedType).toBe("salvage, rebuilt, or bonded title");
      expect(canReachPay({ eligible: false, rejectedType: result.rejectedType })).toBe(false);
    }
  });

  it("blocks mock pay for unsupported sessions", () => {
    const paid = applyMockPay({
      eligible: false,
      rejectedType: "dealer sale",
      salePriceCents: 100000,
      spvCents: 120000,
      taxTrace: { taxCents: 1 },
      paymentState: "none",
      orderId: null,
      packetToken: null,
      expiresAt: null,
    }, "success");
    expect(paid.ok).toBe(false);
    if (!paid.ok) {
      expect(paid.reason).toBe("unsupported");
    }
  });

  it("allows pay only after eligibility", () => {
    expect(canReachPay({ eligible: true, rejectedType: null })).toBe(true);
  });
});
