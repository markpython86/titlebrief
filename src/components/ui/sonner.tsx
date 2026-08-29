"use client";

import { Toaster as Sonner } from "sonner";

function Toaster() {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "border-border bg-surface text-foreground",
        },
      }}
    />
  );
}

export { Toaster };
