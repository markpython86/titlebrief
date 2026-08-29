"use client";

import { formatCents } from "@/lib/money";
import { PACKET_PRICE_CENTS } from "@/lib/sources";
import { Button } from "@/components/ui/button";

export function PayBar({
  onPay,
  onFail,
  pending,
  error,
  disabled,
}: {
  onPay: () => void;
  onFail: () => void;
  pending?: boolean;
  error?: string | null;
  disabled?: boolean;
}) {
  return (
    <div className="sticky bottom-0 -mx-4 border-t border-border bg-surface px-4 py-4">
      <div className="mx-auto grid max-w-xl gap-3">
        <p className="text-sm text-muted-foreground">
          Pay {formatCents(PACKET_PRICE_CENTS)} for the downloadable packet. Mock checkout
          only. No card data is collected.
        </p>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="grid gap-2 sm:grid-cols-2">
          <Button type="button" onClick={onPay} disabled={disabled || pending}>
            {pending ? "Working…" : `Pay ${formatCents(PACKET_PRICE_CENTS)}`}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onFail}
            disabled={disabled || pending}
          >
            Simulate failed payment
          </Button>
        </div>
      </div>
    </div>
  );
}
