import { OFFICIAL_SOURCES, SELLER_VTN_REMINDER } from "@/lib/sources";

const ITEMS = [
  OFFICIAL_SOURCES.form130U,
  OFFICIAL_SOURCES.sellerVtn,
  OFFICIAL_SOURCES.sellerVtnOnline,
  OFFICIAL_SOURCES.formVtr346,
  OFFICIAL_SOURCES.txdmvBuyingSelling,
  OFFICIAL_SOURCES.comptrollerPrivatePartySpv,
  OFFICIAL_SOURCES.form14128,
] as const;

export function Checklist() {
  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted-foreground">{SELLER_VTN_REMINDER}</p>
      <ul className="grid gap-2">
        {ITEMS.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-brand underline-offset-4 hover:underline"
            >
              {item.label} (opens official site)
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
