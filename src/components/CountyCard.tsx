import type { CountyDTO } from "@/lib/types";

export function CountyCard({ county }: { county: CountyDTO }) {
  return (
    <section className="grid gap-2 rounded-xl border border-border bg-surface p-4">
      <h3 className="font-semibold">{county.officeName}</h3>
      <p className="text-sm">{county.address}</p>
      <p className="text-sm text-muted-foreground">{county.hoursText}</p>
      <a
        href={county.officialUrl}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-brand underline-offset-4 hover:underline"
      >
        Official {county.name} County tax office page (opens official site)
      </a>
      <p className="font-mono text-xs text-muted-foreground">
        Last verified {county.lastVerified}
      </p>
    </section>
  );
}
