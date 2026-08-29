import { NextResponse } from "next/server";
import { getActiveRule, invalidateRuleVersion } from "@/lib/rules";

export async function POST() {
  const active = await getActiveRule();
  if (!active) {
    return NextResponse.json({ error: "No active rule version." }, { status: 404 });
  }
  const updated = await invalidateRuleVersion(active.id);
  return NextResponse.json({
    id: updated.id,
    invalidatedAt: updated.invalidatedAt,
  });
}
