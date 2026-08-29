import { formatCents, formatRateBps } from "@/lib/money";
import { OFFICIAL_SOURCES, TAX_PREVIEW_LABEL } from "@/lib/sources";
import type { TaxTrace as TaxTraceModel } from "@/lib/tax";

export function TaxTrace({ trace }: { trace: TaxTraceModel }) {
  const items: Array<{ term: string; value: string }> = [
    { term: "Sale price", value: formatCents(trace.salePriceCents) },
    { term: "80% of SPV", value: formatCents(trace.eightyPctSpvCents) },
    { term: "Tax base (greater of those two)", value: formatCents(trace.taxBaseCents) },
    {
      term: `Estimated tax at stored rate ${formatRateBps(trace.rateBps)}`,
      value: formatCents(trace.taxCents),
    },
  ];
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">{TAX_PREVIEW_LABEL}</p>
      <dl className="grid gap-3">
        {items.map((item) => (
          <div key={item.term} className="flex items-baseline justify-between gap-4">
            <dt className="text-sm text-muted-foreground">{item.term}</dt>
            <dd className="font-mono text-base">{item.value}</dd>
          </div>
        ))}
      </dl>
      <p className="font-mono text-xs text-muted-foreground">
        Rule version {trace.ruleVersionId}. Current as of {trace.sourceDate}.
      </p>
      <ul className="grid gap-1.5 text-sm">
        <li>
          <a
            href={OFFICIAL_SOURCES.comptrollerTaxRates.href}
            target="_blank"
            rel="noreferrer"
            className="text-brand underline-offset-4 hover:underline"
          >
            {OFFICIAL_SOURCES.comptrollerTaxRates.label} (opens official site)
          </a>
        </li>
        <li>
          <a
            href={OFFICIAL_SOURCES.comptrollerSpvGuide.href}
            target="_blank"
            rel="noreferrer"
            className="text-brand underline-offset-4 hover:underline"
          >
            {OFFICIAL_SOURCES.comptrollerSpvGuide.label} (opens official site)
          </a>
        </li>
        <li>
          <a
            href={OFFICIAL_SOURCES.comptrollerPrivatePartySpv.href}
            target="_blank"
            rel="noreferrer"
            className="text-brand underline-offset-4 hover:underline"
          >
            {OFFICIAL_SOURCES.comptrollerPrivatePartySpv.label} (opens official site)
          </a>
        </li>
        <li>
          <a
            href={OFFICIAL_SOURCES.txdmvBuyingSelling.href}
            target="_blank"
            rel="noreferrer"
            className="text-brand underline-offset-4 hover:underline"
          >
            {OFFICIAL_SOURCES.txdmvBuyingSelling.label} (opens official site)
          </a>
        </li>
        <li>
          <a
            href={OFFICIAL_SOURCES.form130U.href}
            target="_blank"
            rel="noreferrer"
            className="text-brand underline-offset-4 hover:underline"
          >
            {OFFICIAL_SOURCES.form130U.label} (opens official site)
          </a>
        </li>
      </ul>
    </div>
  );
}
