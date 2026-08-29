# Titlebrief local cut

Texas private-party title preview. Local only. No remotes, no live Stripe, no Resend, no Clerk.

Titlebrief does not file a title and does not give tax advice.

Open the app at http://localhost:3002 after installing dependencies, generating Prisma, pushing the sqlite schema, seeding, and running the Next dev server on port 3002.

Do not use ports 3000 (Hallside) or 3001 (Extrasign).

Local dotenv may set only DATABASE_URL to the sqlite file and NEXT_PUBLIC_APP_URL to http://localhost:3002. The example env file stays empty.

Run the Vitest suite from this directory.

Flow: eligibility, facts, official SPV paste, estimated tax preview from the stored rule version, estimated comparison only when sale is below 80 percent of SPV, county checklist with a 30 calendar day deadline, mock pay of 19 USD, then the packet PDF. Unsupported cases cannot pay. Expired downloads fail closed.

The stored rule version uses the Comptroller motor-vehicle sales-tax rate from publication 96-254 (March 2026), source dated 2026-03-01.

Methodology is a separate page with official source links and no checkout. Form 130-U is linked, not copied.

Correction or refund: support@titlebrief.local

## How to run

From /workspace/titlebrief, install packages, generate the Prisma client, push the sqlite schema, seed rule_version and the four counties, then start Next on port 3002 with the dev script.
