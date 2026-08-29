"use client";

import { ELIGIBILITY_QUESTIONS, type EligibilityAnswers, type YesNo } from "@/lib/eligibility";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function EligibilitySet({
  answers,
  onChange,
  onSubmit,
  disabled,
  pending,
}: {
  answers: Partial<EligibilityAnswers>;
  onChange: (id: keyof EligibilityAnswers, value: YesNo) => void;
  onSubmit: () => void;
  disabled?: boolean;
  pending?: boolean;
}) {
  const complete = ELIGIBILITY_QUESTIONS.every(
    (question) => answers[question.id] === "yes" || answers[question.id] === "no",
  );
  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {ELIGIBILITY_QUESTIONS.map((question) => (
        <fieldset key={question.id} className="grid gap-2" disabled={disabled}>
          <legend className="text-sm font-medium">{question.statement}</legend>
          <RadioGroup
            className="grid grid-cols-2 gap-2"
            value={answers[question.id] ?? ""}
            onValueChange={(value) => onChange(question.id, value as YesNo)}
          >
            <Label className="flex min-h-11 items-center gap-2 rounded-md border border-border bg-surface px-3">
              <RadioGroupItem value="yes" id={`${question.id}-yes`} />
              Yes
            </Label>
            <Label className="flex min-h-11 items-center gap-2 rounded-md border border-border bg-surface px-3">
              <RadioGroupItem value="no" id={`${question.id}-no`} />
              No
            </Label>
          </RadioGroup>
        </fieldset>
      ))}
      <Button type="submit" disabled={!complete || disabled || pending}>
        {pending ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}
