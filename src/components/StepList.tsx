import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepItem = {
  id: string;
  label: string;
  index: number;
};

export function StepList({
  steps,
  currentId,
  completedIds,
}: {
  steps: StepItem[];
  currentId: string;
  completedIds: string[];
}) {
  return (
    <ol className="mb-5 grid gap-2" aria-label="Preview steps">
      {steps.map((step) => {
        const current = step.id === currentId;
        const done = completedIds.includes(step.id);
        const locked = !current && !done;
        return (
          <li
            key={step.id}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm",
              current && "border-brand bg-brand-soft",
              done && "border-border bg-surface",
              locked && "border-transparent bg-surface-subtle text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full font-mono text-xs",
                current && "bg-brand text-white",
                done && "bg-ok-soft text-ok",
                locked && "bg-surface-subtle text-muted-foreground",
              )}
              aria-hidden
            >
              {done ? <Check className="size-3.5" /> : step.index}
            </span>
            <span className={cn(current && "font-medium")}>{step.label}</span>
            {current ? (
              <span className="sr-only">Current step</span>
            ) : done ? (
              <span className="sr-only">Completed</span>
            ) : (
              <span className="sr-only">Locked</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
