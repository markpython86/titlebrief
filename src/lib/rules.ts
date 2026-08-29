import { getPrisma } from "./db";
import type { RuleDTO } from "./types";

export function toRuleDTO(row: {
  id: string;
  rateBps: number;
  sourceDate: Date;
  sourceUrl: string;
  sourceLabel: string;
}): RuleDTO {
  return {
    id: row.id,
    rateBps: row.rateBps,
    sourceDate: row.sourceDate.toISOString().slice(0, 10),
    sourceUrl: row.sourceUrl,
    sourceLabel: row.sourceLabel,
  };
}

export async function getActiveRule() {
  const db = getPrisma();
  return db.ruleVersion.findFirst({
    where: { invalidatedAt: null },
    orderBy: { sourceDate: "desc" },
  });
}

export async function invalidateRuleVersion(id: string, now: Date = new Date()) {
  const db = getPrisma();
  return db.ruleVersion.update({
    where: { id },
    data: { invalidatedAt: now },
  });
}
