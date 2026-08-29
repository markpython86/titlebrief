import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { packetAccess, EXPIRED_PACKET_COPY } from "@/lib/packet";
import { renderPacketPdf } from "@/lib/pdf";
import type { TaxTrace } from "@/lib/tax";
import type { CountyDTO } from "@/lib/types";
import type { CountyId } from "@/lib/validations";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const db = getPrisma();
  const session = await db.session.findUnique({
    where: { packetToken: token },
    include: { county: true },
  });
  const access = packetAccess(
    session
      ? {
          paymentState: session.paymentState,
          packetToken: session.packetToken,
          expiresAt: session.expiresAt,
          deletedAt: session.deletedAt,
        }
      : null,
  );
  if (!access.ok) {
    const expired = access.reason === "expired";
    return NextResponse.json(
      { error: expired ? EXPIRED_PACKET_COPY : "Packet is not available." },
      { status: expired ? 410 : 404 },
    );
  }
  if (!session?.taxTraceJson || !session.county || !session.purchaseDate) {
    return NextResponse.json({ error: "Packet is not available." }, { status: 404 });
  }
  const county: CountyDTO = {
    id: session.county.id as CountyId,
    name: session.county.name,
    officeName: session.county.officeName,
    address: session.county.address,
    officialUrl: session.county.officialUrl,
    hoursText: session.county.hoursText,
    lastVerified: session.county.lastVerified.toISOString().slice(0, 10),
  };
  const pdf = await renderPacketPdf({
    taxTrace: JSON.parse(session.taxTraceJson) as TaxTrace,
    purchaseDate: session.purchaseDate,
    county,
    appraisalFeeCents: session.appraisalFeeCents,
  });
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="titlebrief-packet.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
