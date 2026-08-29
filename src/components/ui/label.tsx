"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import type * as React from "react";
import { cn } from "@/lib/utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "mb-1.5 block text-sm font-medium leading-none select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
