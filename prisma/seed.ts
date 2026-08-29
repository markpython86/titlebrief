import { PrismaClient } from "@prisma/client";
import { ACTIVE_RULE_ID, OFFICIAL_SOURCES } from "../src/lib/sources";

const prisma = new PrismaClient();

async function main() {
  await prisma.ruleVersion.upsert({
    where: { id: ACTIVE_RULE_ID },
    update: {
      rateBps: 625,
      sourceDate: new Date("2026-03-01T00:00:00.000Z"),
      sourceUrl: OFFICIAL_SOURCES.comptrollerTaxRates.href,
      sourceLabel: OFFICIAL_SOURCES.comptrollerTaxRates.label,
      invalidatedAt: null,
    },
    create: {
      id: ACTIVE_RULE_ID,
      rateBps: 625,
      sourceDate: new Date("2026-03-01T00:00:00.000Z"),
      sourceUrl: OFFICIAL_SOURCES.comptrollerTaxRates.href,
      sourceLabel: OFFICIAL_SOURCES.comptrollerTaxRates.label,
    },
  });

  const counties = [
    {
      id: "travis",
      name: "Travis",
      officeName: "Travis County Tax Office",
      address: "2433 Ridgepoint Dr, Austin, TX 78754-5231",
      officialUrl: "https://tax-office.traviscountytx.gov/visit-us",
      hoursText:
        "Vehicle title and registration walk-in hours: 8 a.m. to 3:30 p.m., Monday through Friday (Nelda Wells Spears Building / HQ).",
      lastVerified: new Date("2026-08-28T00:00:00.000Z"),
    },
    {
      id: "harris",
      name: "Harris",
      officeName: "Harris County Tax Assessor-Collector",
      address: "1001 Preston, Houston, TX 77002",
      officialUrl: "https://www.hctax.net/auto/automotive",
      hoursText:
        "Branches open Monday, Tuesday, Thursday, and Friday, 8:00 a.m. to 4:30 p.m. Closed Wednesdays. Title-transfer walk-ins 8:00 a.m. to 12:00 p.m. without an appointment.",
      lastVerified: new Date("2026-08-28T00:00:00.000Z"),
    },
    {
      id: "williamson",
      name: "Williamson",
      officeName: "Williamson County Tax Assessor Collector",
      address: "1848 Texas Trail, Georgetown, TX 78626",
      officialUrl: "https://www.wilcotx.gov/694/Motor-Vehicle",
      hoursText:
        "Title and new-resident transfers: Monday 8 a.m. to 5:30 p.m.; Tuesday through Friday 8 a.m. to 4 p.m. Georgetown Administration Building.",
      lastVerified: new Date("2026-08-28T00:00:00.000Z"),
    },
    {
      id: "dallas",
      name: "Dallas",
      officeName: "Dallas County Tax Office",
      address: "500 Elm Street, Suite 1200, Dallas, TX 75202",
      officialUrl: "https://www.dallascounty.org/departments/tax/office-locations.php",
      hoursText:
        "Downtown branch: 7:30 a.m. to 4:30 p.m., Monday through Friday. Other motor-vehicle branches 8:00 a.m. to 4:30 p.m.",
      lastVerified: new Date("2026-08-28T00:00:00.000Z"),
    },
  ];

  for (const county of counties) {
    await prisma.county.upsert({
      where: { id: county.id },
      update: county,
      create: county,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
