"use client";

import { APPRAISAL_COMPARE_COPY } from "@/lib/sources";
import { formatCents } from "@/lib/money";
import { parseMoneyInput } from "@/lib/money";
import { computeAppraisalCompare, type TaxTrace } from "@/lib/tax";
import { MoneyField } from "@/components/MoneyField";
import { Button } from "@/components/ui/button";

function feeCentsFromInput(raw: string): number {
  if (!raw.trim()) {
    return 0;
  }
  const parsed = parseMoneyInput(raw);
  return parsed.ok ? parsed.cents : 0;
}

export function AppraisalCompare({
  trace,
  feeValue,
  onFeeChange,
  error,
  disabled,
  onSubmit,
  pending,
}: {
  trace: TaxTrace;
  feeValue: string;
  onFeeChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  onSubmit?: () => void;
  pending?: boolean;
}) {
  if (!trace.appraisalApplies) {
    return null;
  }
  const live = computeAppraisalCompare(trace, feeCentsFromInput(feeValue));
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <p className="text-sm text-muted-foreground">{APPRAISAL_COMPARE_COPY}</p>
      {live ? (
        <dl className="grid gap-3">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-sm text-muted-foreground">Potential tax difference</dt>
            <dd className="font-mono text-base">
              {formatCents(live.potentialDifferenceCents)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-sm text-muted-foreground">Appraisal fee</dt>
            <dd className="font-mono text-base">{formatCents(live.appraisalFeeCents)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-sm text-muted-foreground">Net estimated comparison</dt>
            <dd className="font-mono text-base">{formatCents(live.netEstimatedCents)}</dd>
          </div>
        </dl>
      ) : null}
      {onSubmit && onFeeChange ? (
        <>
          <MoneyField
            id="appraisalFee"
            label="Appraisal fee (optional)"
            value={feeValue}
            onChange={onFeeChange}
            error={error}
            disabled={disabled}
            helper="Optional. Leave blank if you are not entering a fee."
          />
          <Button type="submit" disabled={disabled || pending}>
            {pending ? "Saving…" : "Continue"}
          </Button>
        </>
      ) : null}
    </form>
  );
}
