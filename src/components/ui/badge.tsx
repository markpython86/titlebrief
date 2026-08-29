import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center rounded-sm border border-transparent px-2 py-0.5 font-mono text-xs font-medium tracking-[0.04em] whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-surface-subtle text-muted-foreground",
        outline: "border-border text-foreground",
        warn: "bg-warn-soft text-warn",
        ok: "bg-ok-soft text-ok",
        danger: "bg-danger-soft text-danger",
        brand: "bg-brand-soft text-brand",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
