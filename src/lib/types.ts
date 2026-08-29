import type { TaxTrace } from "./tax";
import type { EligibilityAnswers } from "./eligibility";
import type { PayState } from "./pay";
import type { CountyId } from "./validations";

export type StepId =
  | "eligibility"
  | "facts"
  | "spv"
  | "tax"
  | "appraisal"
  | "county"
  | "pay"
  | "packet"
  | "unsupported"
  | "expired"
  | "deleted";

export type CountyDTO = {
  id: CountyId;
  name: string;
  officeName: string;
  address: string;
  officialUrl: string;
  hoursText: string;
  lastVerified: string;
};

export type RuleDTO = {
  id: string;
  rateBps: number;
  sourceDate: string;
  sourceUrl: string;
  sourceLabel: string;
};

export type SessionDTO = {
  id: string;
  step: StepId;
  eligible: boolean;
  rejectedType: string | null;
  answers: Partial<EligibilityAnswers> | null;
  salePriceCents: number | null;
  purchaseDate: string | null;
  countyId: CountyId | null;
  spvCents: number | null;
  appraisalFeeCents: number | null;
  taxTrace: TaxTrace | null;
  ruleVersionId: string | null;
  paymentState: PayState;
  orderId: string | null;
  packetToken: string | null;
  expiresAt: string | null;
  deletedAt: string | null;
};

export type BootstrapDTO = {
  session: SessionDTO;
  rule: RuleDTO | null;
  counties: CountyDTO[];
};
