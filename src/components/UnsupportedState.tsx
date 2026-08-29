import { OFFICIAL_SOURCES } from "@/lib/sources";
import { Button } from "@/components/ui/button";

export function UnsupportedState({
  rejectedType,
  onStartOver,
}: {
  rejectedType: string;
  onStartOver: () => void;
}) {
  return (
    <section className="grid gap-4 rounded-xl border border-danger bg-danger-soft p-5 text-danger">
      <h1>This purchase type is not supported</h1>
      <p className="text-sm">
        Titlebrief is only for an ordinary Texas private-party passenger-vehicle purchase.
        This session indicated: {rejectedType}.
      </p>
      <p className="text-sm">
        Titlebrief does not file a title, does not collect payment on unsupported cases, and
        does not give tax advice.
      </p>
      <ul className="grid gap-2 text-sm">
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
            href={OFFICIAL_SOURCES.comptrollerMvst.href}
            target="_blank"
            rel="noreferrer"
            className="text-brand underline-offset-4 hover:underline"
          >
            {OFFICIAL_SOURCES.comptrollerMvst.label} (opens official site)
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
      </ul>
      <Button type="button" onClick={onStartOver}>
        Start over
      </Button>
    </section>
  );
}
