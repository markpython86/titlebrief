"use client";

import { useEffect, useState, useTransition } from "react";
import {
  ensureSessionAction,
  continueFromCountyAction,
  continueFromTaxAction,
  deletePacketAction,
  emailPacketAction,
  goBackAction,
  mockPayAction,
  startOverAction,
  submitAppraisalAction,
  submitEligibilityAction,
  submitFactsAction,
  submitSpvAction,
} from "@/lib/actions";
import type { EligibilityAnswers, YesNo } from "@/lib/eligibility";
import { formatCents } from "@/lib/money";
import { COUNTY_IDS } from "@/lib/validations";
import type { BootstrapDTO, SessionDTO, CountyDTO, RuleDTO } from "@/lib/types";
import { EXPIRED_PACKET_COPY } from "@/lib/packet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StepList, type StepItem } from "@/components/StepList";
import { EligibilitySet } from "@/components/EligibilitySet";
import { MoneyField } from "@/components/MoneyField";
import { DateField } from "@/components/DateField";
import { SpvPaste } from "@/components/SpvPaste";
import { TaxTrace } from "@/components/TaxTrace";
import { AppraisalCompare } from "@/components/AppraisalCompare";
import { DeadlineBanner } from "@/components/DeadlineBanner";
import { CountyCard } from "@/components/CountyCard";
import { Checklist } from "@/components/Checklist";
import { PayBar } from "@/components/PayBar";
import { PacketCard } from "@/components/PacketCard";
import { UnsupportedState } from "@/components/UnsupportedState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

const COUNTY_LABELS: Record<string, string> = {
  travis: "Travis",
  harris: "Harris",
  williamson: "Williamson",
  dallas: "Dallas",
};

function visibleSteps(session: SessionDTO): StepItem[] {
  const appraisal =
    session.taxTrace?.appraisalApplies === true
      ? [{ id: "appraisal", label: "Appraisal comparison", index: 5 }]
      : [];
  const after = appraisal.length ? 6 : 5;
  return [
    { id: "eligibility", label: "Eligibility", index: 1 },
    { id: "facts", label: "Purchase facts", index: 2 },
    { id: "spv", label: "Official SPV", index: 3 },
    { id: "tax", label: "Tax preview", index: 4 },
    ...appraisal,
    { id: "county", label: "County checklist", index: after },
    { id: "pay", label: "Pay for packet", index: after + 1 },
  ];
}

function completedBefore(session: SessionDTO): string[] {
  const order = visibleSteps(session).map((step) => step.id);
  const current = session.step;
  const idx = order.indexOf(current);
  if (idx <= 0) {
    return [];
  }
  return order.slice(0, idx);
}

function SummaryRow({
  title,
  body,
  onBack,
  canBack,
}: {
  title: string;
  body: string;
  onBack?: () => void;
  canBack?: boolean;
}) {
  return (
    <Card className="bg-surface">
      <CardHeader className="flex-row items-center justify-between gap-3 py-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {canBack && onBack ? (
          <Button type="button" variant="ghost" size="sm" onClick={onBack}>
            Back
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="pt-0">
        <p className="font-mono text-sm text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}

export function Flow({ initial }: { initial: BootstrapDTO }) {
  const [session, setSession] = useState<SessionDTO>(initial.session);
  const [rule] = useState<RuleDTO | null>(initial.rule);
  const [counties] = useState<CountyDTO[]>(initial.counties);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<Partial<EligibilityAnswers>>(
    initial.session.answers ?? {},
  );
  const [salePrice, setSalePrice] = useState(
    initial.session.salePriceCents !== null
      ? (initial.session.salePriceCents / 100).toFixed(2)
      : "",
  );
  const [purchaseDate, setPurchaseDate] = useState(initial.session.purchaseDate ?? "");
  const [countyId, setCountyId] = useState(initial.session.countyId ?? "");
  const [spv, setSpv] = useState(
    initial.session.spvCents !== null ? (initial.session.spvCents / 100).toFixed(2) : "",
  );
  const [appraisalFee, setAppraisalFee] = useState(
    initial.session.appraisalFeeCents
      ? (initial.session.appraisalFeeCents / 100).toFixed(2)
      : "",
  );
  const [inboxNote, setInboxNote] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (session.id) {
      return;
    }
    startTransition(async () => {
      const result = await ensureSessionAction();
      if (result.ok) {
        setSession(result.session);
      }
    });
  }, [session.id]);

  const applySession = (next: SessionDTO) => {
    setSession(next);
    if (next.answers) {
      setAnswers(next.answers);
    }
  };

  const run = (fn: () => Promise<{ ok: boolean; session?: SessionDTO; error?: string; fieldErrors?: Record<string, string>; inboxPath?: string }>) => {
    setError(null);
    setFieldErrors({});
    startTransition(async () => {
      const result = await fn();
      if (result.ok && result.session) {
        applySession(result.session);
        if (result.inboxPath) {
          setInboxNote(result.inboxPath);
        }
        if (result.session.paymentState === "failed") {
          setPayError("Payment did not go through. Try again.");
        } else if (result.session.paymentState === "paid") {
          setPayError(null);
        }
        return;
      }
      setError(result.error ?? "Something went wrong.");
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      }
    });
  };

  const startOver = () => {
    run(async () => {
      const result = await startOverAction();
      if (result.ok) {
        setAnswers({});
        setSalePrice("");
        setPurchaseDate("");
        setCountyId("");
        setSpv("");
        setAppraisalFee("");
        setInboxNote(null);
        setPayError(null);
      }
      return result;
    });
  };

  const canBack = session.paymentState !== "paid";
  const county = counties.find((row) => row.id === session.countyId) ?? null;

  if (session.step === "unsupported" || session.rejectedType) {
    return (
      <UnsupportedState
        rejectedType={session.rejectedType ?? "unsupported purchase type"}
        onStartOver={startOver}
      />
    );
  }

  if (session.step === "expired" || (session.expiresAt && new Date(session.expiresAt) <= new Date() && session.paymentState === "paid" && !session.deletedAt)) {
    return (
      <section className="grid gap-4">
        <h1>Packet expired</h1>
        <ErrorState>{EXPIRED_PACKET_COPY}</ErrorState>
        <Button type="button" onClick={startOver}>
          Start over
        </Button>
      </section>
    );
  }

  if (session.step === "deleted" || session.deletedAt) {
    return (
      <section className="grid gap-4">
        <h1>Packet deleted</h1>
        <EmptyState>This packet was deleted. Start over to begin a new preview.</EmptyState>
        <Button type="button" onClick={startOver}>
          Start over
        </Button>
      </section>
    );
  }

  if (session.step === "packet" && session.paymentState === "paid") {
    return (
      <section className="grid gap-5">
        <h1>Your packet</h1>
        {session.taxTrace ? <TaxTrace trace={session.taxTrace} /> : null}
        {session.taxTrace?.appraisalApplies ? (
          <AppraisalCompare
            trace={session.taxTrace}
            feeValue={appraisalFee}
          />
        ) : null}
        {session.purchaseDate ? <DeadlineBanner purchaseDate={session.purchaseDate} /> : null}
        {county ? <CountyCard county={county} /> : null}
        <Checklist />
        <PacketCard
          session={session}
          inboxNote={inboxNote}
          onEmail={() => run(() => emailPacketAction())}
          onDelete={() => run(() => deletePacketAction())}
          pending={pending}
        />
      </section>
    );
  }

  const steps = visibleSteps(session);
  const completed = completedBefore(session);

  return (
    <div className="grid gap-4">
      <h1>Texas private-party preview</h1>
      <StepList steps={steps} currentId={session.step} completedIds={completed} />
      {error ? <ErrorState>{error}</ErrorState> : null}

      {completed.includes("eligibility") ? (
        <SummaryRow
          title="Eligibility"
          body="Ordinary Texas private-party passenger vehicle"
          canBack={canBack}
          onBack={() => run(() => goBackAction("eligibility"))}
        />
      ) : null}

      {session.step === "eligibility" ? (
        <Card>
          <CardHeader>
            <CardTitle>Eligibility</CardTitle>
          </CardHeader>
          <CardContent>
            <EligibilitySet
              answers={answers}
              pending={pending}
              onChange={(id, value: YesNo) =>
                setAnswers((prev) => ({ ...prev, [id]: value }))
              }
              onSubmit={() => run(() => submitEligibilityAction(answers))}
            />
          </CardContent>
        </Card>
      ) : null}

      {completed.includes("facts") && session.salePriceCents !== null ? (
        <SummaryRow
          title="Purchase facts"
          body={`${formatCents(session.salePriceCents)} · ${session.purchaseDate} · ${COUNTY_LABELS[session.countyId ?? ""] ?? ""}`}
          canBack={canBack}
          onBack={() => run(() => goBackAction("facts"))}
        />
      ) : null}

      {session.step === "facts" ? (
        <Card>
          <CardHeader>
            <CardTitle>Purchase facts</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                run(() =>
                  submitFactsAction({ salePrice, purchaseDate, countyId }),
                );
              }}
            >
              <MoneyField
                id="salePrice"
                label="Sale price"
                value={salePrice}
                onChange={setSalePrice}
                error={fieldErrors.salePrice}
              />
              <DateField
                id="purchaseDate"
                label="Purchase date"
                value={purchaseDate}
                onChange={setPurchaseDate}
                error={fieldErrors.purchaseDate}
              />
              <fieldset>
                <legend className="mb-1.5 text-sm font-medium">Buyer county</legend>
                <RadioGroup
                  className="grid gap-2"
                  value={countyId}
                  onValueChange={setCountyId}
                >
                  {COUNTY_IDS.map((id) => (
                    <Label
                      key={id}
                      className="flex min-h-11 items-center gap-2 rounded-md border border-border bg-surface px-3"
                    >
                      <RadioGroupItem value={id} id={`county-${id}`} />
                      {COUNTY_LABELS[id]}
                    </Label>
                  ))}
                </RadioGroup>
                {fieldErrors.countyId ? (
                  <p className="mt-1.5 text-sm text-danger">{fieldErrors.countyId}</p>
                ) : null}
              </fieldset>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => run(() => goBackAction("eligibility"))}
                >
                  Back
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Saving…" : "Continue"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {completed.includes("spv") && session.spvCents !== null ? (
        <SummaryRow
          title="Official SPV"
          body={formatCents(session.spvCents)}
          canBack={canBack}
          onBack={() => run(() => goBackAction("spv"))}
        />
      ) : null}

      {session.step === "spv" ? (
        <Card>
          <CardHeader>
            <CardTitle>Official SPV</CardTitle>
          </CardHeader>
          <CardContent>
            <SpvPaste
              value={spv}
              onChange={setSpv}
              error={fieldErrors.spv}
              pending={pending}
              onSubmit={() => run(() => submitSpvAction({ spv }))}
            />
            <div className="mt-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => run(() => goBackAction("facts"))}
              >
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {completed.includes("tax") && session.taxTrace ? (
        <SummaryRow
          title="Tax preview"
          body={formatCents(session.taxTrace.taxCents)}
          canBack={canBack}
          onBack={() => run(() => goBackAction("tax"))}
        />
      ) : null}

      {session.step === "tax" ? (
        <Card>
          <CardHeader>
            <CardTitle>Tax preview</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {session.taxTrace ? (
              <TaxTrace trace={session.taxTrace} />
            ) : rule ? (
              <EmptyState>Paste an official SPV to see the estimated tax preview.</EmptyState>
            ) : (
              <ErrorState>Missing rule version.</ErrorState>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => run(() => goBackAction("spv"))}
              >
                Back
              </Button>
              <Button
                type="button"
                disabled={!session.taxTrace || pending}
                onClick={() => run(() => continueFromTaxAction())}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {completed.includes("appraisal") && session.taxTrace?.appraisalApplies ? (
        <SummaryRow
          title="Appraisal comparison"
          body="Estimated comparison"
          canBack={canBack}
          onBack={() => run(() => goBackAction("appraisal"))}
        />
      ) : null}

      {session.step === "appraisal" && session.taxTrace ? (
        <Card className="border-warn bg-warn-soft">
          <CardHeader>
            <CardTitle>Appraisal comparison</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <AppraisalCompare
              trace={session.taxTrace}
              feeValue={appraisalFee}
              onFeeChange={setAppraisalFee}
              error={fieldErrors.appraisalFee}
              pending={pending}
              onSubmit={() =>
                run(() => submitAppraisalAction({ appraisalFee }))
              }
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => run(() => goBackAction("tax"))}
            >
              Back
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {completed.includes("county") && county ? (
        <SummaryRow
          title="County checklist"
          body={county.officeName}
          canBack={canBack}
          onBack={() => run(() => goBackAction("county"))}
        />
      ) : null}

      {session.step === "county" ? (
        <Card>
          <CardHeader>
            <CardTitle>County checklist</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {session.purchaseDate ? (
              <DeadlineBanner purchaseDate={session.purchaseDate} />
            ) : null}
            {county ? <CountyCard county={county} /> : <ErrorState>County row missing.</ErrorState>}
            <Checklist />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  run(() =>
                    goBackAction(
                      session.taxTrace?.appraisalApplies ? "appraisal" : "tax",
                    ),
                  )
                }
              >
                Back
              </Button>
              <Button
                type="button"
                disabled={pending}
                onClick={() => run(() => continueFromCountyAction())}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {session.step === "pay" ? (
        <Card>
          <CardHeader>
            <CardTitle>Pay for the packet</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-sm text-muted-foreground">
              The preview above is free. The packet is a downloadable copy of the same
              numbers, checklist, and official links.
            </p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => run(() => goBackAction("county"))}
            >
              Back
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {session.step === "pay" ? (
        <PayBar
          pending={pending}
          error={payError}
          onPay={() => run(() => mockPayAction("success"))}
          onFail={() => run(() => mockPayAction("fail"))}
        />
      ) : null}
    </div>
  );
}
