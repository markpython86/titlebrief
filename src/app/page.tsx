import { FlowShell } from "@/components/FlowShell";
import { Flow } from "@/components/Flow";
import { emptySessionDTO, getExistingSession, toSessionDTO } from "@/lib/session";
import { getPrisma } from "@/lib/db";
import { getActiveRule, toRuleDTO } from "@/lib/rules";
import type { CountyDTO } from "@/lib/types";
import type { CountyId } from "@/lib/validations";

export default async function HomePage() {
  const [session, rule, counties] = await Promise.all([
    getExistingSession(),
    getActiveRule(),
    getPrisma().county.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <FlowShell>
      <Flow
        initial={{
          session: session ? toSessionDTO(session) : emptySessionDTO(),
          rule: rule ? toRuleDTO(rule) : null,
          counties: counties.map(
            (row): CountyDTO => ({
              id: row.id as CountyId,
              name: row.name,
              officeName: row.officeName,
              address: row.address,
              officialUrl: row.officialUrl,
              hoursText: row.hoursText,
              lastVerified: row.lastVerified.toISOString().slice(0, 10),
            }),
          ),
        }}
      />
    </FlowShell>
  );
}
