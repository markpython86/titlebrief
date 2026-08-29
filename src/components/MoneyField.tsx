"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MoneyField({
  id,
  label,
  value,
  onChange,
  error,
  disabled,
  helper,
  name,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  helper?: string;
  name?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name ?? id}
        inputMode="decimal"
        autoComplete="off"
        value={value}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
        className="font-mono"
        onChange={(event) => onChange(event.target.value)}
      />
      {helper ? (
        <p id={`${id}-helper`} className="mt-1.5 text-sm text-muted-foreground">
          {helper}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
