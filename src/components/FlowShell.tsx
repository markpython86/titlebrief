import Link from "next/link";
import type * as React from "react";

export function FlowShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-xl items-baseline justify-between px-4 py-4">
          <div>
            <p className="font-semibold tracking-tight text-foreground">Titlebrief</p>
            <p className="text-sm text-muted-foreground">Texas private-party preview</p>
          </div>
          <Link
            href="/methodology"
            className="text-sm text-brand underline-offset-4 hover:underline"
          >
            Methodology
          </Link>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}
