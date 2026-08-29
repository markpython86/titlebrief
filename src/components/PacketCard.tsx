"use client";

import { formatCents } from "@/lib/money";
import { SUPPORT_CONTACT } from "@/lib/sources";
import type { SessionDTO } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { formatLongDate } from "@/lib/dates";

export function PacketCard({
  session,
  inboxNote,
  onEmail,
  onDelete,
  pending,
}: {
  session: SessionDTO;
  inboxNote?: string | null;
  onEmail: () => void;
  onDelete: () => void;
  pending?: boolean;
}) {
  const expires = session.expiresAt ? new Date(session.expiresAt) : null;
  return (
    <div className="grid gap-4">
      <p className="text-sm text-ok">Packet ready. Same numbers as the tax preview.</p>
      {expires ? (
        <p className="font-mono text-sm text-muted-foreground">
          Download expires {formatLongDate(expires)}.
        </p>
      ) : null}
      {session.packetToken ? (
        <a
          href={`/api/packet/${session.packetToken}/pdf`}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Download packet
        </a>
      ) : null}
      <Button type="button" variant="secondary" onClick={onEmail} disabled={pending}>
        {pending ? "Writing…" : "Email to local inbox"}
      </Button>
      {inboxNote ? (
        <p className="text-sm text-muted-foreground">Saved to local inbox: {inboxNote}</p>
      ) : null}
      <Button type="button" variant="destructive" onClick={onDelete} disabled={pending}>
        Delete now
      </Button>
      <p className="text-sm text-muted-foreground">
        Correction or refund: {SUPPORT_CONTACT}
      </p>
      {session.taxTrace ? (
        <p className="font-mono text-xs text-muted-foreground">
          Preview total {formatCents(session.taxTrace.taxCents)}. Rule version{" "}
          {session.taxTrace.ruleVersionId}. Current as of {session.taxTrace.sourceDate}.
        </p>
      ) : null}
    </div>
  );
}
