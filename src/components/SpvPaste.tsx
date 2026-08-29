"use client";

import { OFFICIAL_SOURCES } from "@/lib/sources";
import { MoneyField } from "@/components/MoneyField";
import { Button } from "@/components/ui/button";

export function SpvPaste({
  value,
  onChange,
  error,
  disabled,
  onSubmit,
  pending,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  onSubmit: () => void;
  pending?: boolean;
}) {
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <p className="text-sm text-muted-foreground">
        Copy the number from the official calculator. We do not fetch it.
      </p>
      <a
        href={OFFICIAL_SOURCES.spvCalculator.href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 items-center text-sm text-brand underline-offset-4 hover:underline"
      >
        {OFFICIAL_SOURCES.spvCalculator.label} (opens official site)
      </a>
      <a
        href={OFFICIAL_SOURCES.comptrollerPrivatePartySpv.href}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-brand underline-offset-4 hover:underline"
      >
        {OFFICIAL_SOURCES.comptrollerPrivatePartySpv.label} (opens official site)
      </a>
      <MoneyField
        id="spv"
        label="Official SPV amount"
        value={value}
        onChange={onChange}
        error={error}
        disabled={disabled}
      />
      <Button type="submit" disabled={!value.trim() || disabled || pending}>
        {pending ? "Saving…" : "Show tax preview"}
      </Button>
    </form>
  );
}
