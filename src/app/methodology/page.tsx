import Link from "next/link";
import { FlowShell } from "@/components/FlowShell";
import { OFFICIAL_SOURCES, SUPPORT_CONTACT } from "@/lib/sources";
import { getActiveRule, toRuleDTO } from "@/lib/rules";
import { formatRateBps } from "@/lib/money";

export default async function MethodologyPage() {
  const rule = await getActiveRule();
  const dto = rule ? toRuleDTO(rule) : null;
  return (
    <FlowShell>
      <article className="grid gap-5">
        <h1>Methodology</h1>
        <p className="text-sm text-muted-foreground">
          Titlebrief is a local preview. It does not file a title and does not give tax
          advice. Official pages stay official.
        </p>
        {dto ? (
          <p className="font-mono text-sm">
            Stored rule version {dto.id}. Rate {formatRateBps(dto.rateBps)}. Current as of{" "}
            {dto.sourceDate}.
          </p>
        ) : (
          <p className="text-sm text-danger">No active rule version.</p>
        )}
        <ul className="grid gap-2 text-sm">
          {Object.values(OFFICIAL_SOURCES).map((source) => (
            <li key={source.href}>
              <a
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="text-brand underline-offset-4 hover:underline"
              >
                {source.label} (opens official site)
              </a>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          Tax base is the greater of sale price or 80 percent of the pasted SPV. The stored
          motor-vehicle sales-tax rate on the active rule version is applied. SPV is pasted
          from the official calculator. Titlebrief does not fetch or scrape it.
        </p>
        <p className="text-sm text-muted-foreground">
          Correction or refund contact: {SUPPORT_CONTACT}. A rules version can be
          invalidated from the local support path.
        </p>
        <Link href="/" className="text-sm text-brand underline-offset-4 hover:underline">
          Back to the preview
        </Link>
      </article>
    </FlowShell>
  );
}
