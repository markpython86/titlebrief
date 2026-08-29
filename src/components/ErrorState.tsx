import type * as React from "react";
import { cn } from "@/lib/utils";

export function ErrorState({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border border-danger bg-danger-soft px-4 py-4 text-sm text-danger",
        className,
      )}
    >
      {children}
    </div>
  );
}
