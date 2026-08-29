import { REQUIRED_ELIGIBILITY_COPY } from "./sources";

export type EligibilityId =
  | "texasPrivateParty"
  | "passengerVehicle"
  | "notSalvageRebuiltBonded"
  | "notGiftInheritance"
  | "notDealer"
  | "notOutOfState"
  | "notLienComplex"
  | "requiredCopy";

export type YesNo = "yes" | "no";

export type EligibilityAnswers = Record<EligibilityId, YesNo>;

export type EligibilityQuestion = {
  id: EligibilityId;
  statement: string;
  rejectType: string;
};

export const ELIGIBILITY_QUESTIONS: EligibilityQuestion[] = [
  {
    id: "texasPrivateParty",
    statement: "This is a Texas private-party purchase.",
    rejectType: "non-Texas or non-private-party purchase",
  },
  {
    id: "passengerVehicle",
    statement: "This is a passenger vehicle.",
    rejectType: "non-passenger or commercial vehicle",
  },
  {
    id: "notSalvageRebuiltBonded",
    statement: "The vehicle is not salvage, rebuilt, or bonded.",
    rejectType: "salvage, rebuilt, or bonded title",
  },
  {
    id: "notGiftInheritance",
    statement: "This is not a gift or inheritance.",
    rejectType: "gift or inheritance",
  },
  {
    id: "notDealer",
    statement: "Neither the buyer nor the seller is a licensed dealer.",
    rejectType: "dealer sale",
  },
  {
    id: "notOutOfState",
    statement: "The buyer is in Texas and the seller title is a Texas title.",
    rejectType: "out-of-state buyer or seller title",
  },
  {
    id: "notLienComplex",
    statement: "This is not a lien-complex title.",
    rejectType: "lien-complex title",
  },
  {
    id: "requiredCopy",
    statement: REQUIRED_ELIGIBILITY_COPY,
    rejectType: "required confirmation not given",
  },
];

export type EligibilityResult =
  | { ok: true; answers: EligibilityAnswers }
  | { ok: false; rejectedType: string; answers: Partial<EligibilityAnswers> };

export function evaluateEligibility(
  answers: Partial<EligibilityAnswers>,
): EligibilityResult {
  for (const question of ELIGIBILITY_QUESTIONS) {
    const value = answers[question.id];
    if (value !== "yes" && value !== "no") {
      return {
        ok: false,
        rejectedType: "incomplete eligibility",
        answers,
      };
    }
    if (value === "no") {
      return {
        ok: false,
        rejectedType: question.rejectType,
        answers,
      };
    }
  }
  return { ok: true, answers: answers as EligibilityAnswers };
}

export function canReachPay(input: {
  eligible: boolean;
  rejectedType: string | null;
}): boolean {
  return input.eligible && !input.rejectedType;
}
