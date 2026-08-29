# Titlebrief walk

App: http://localhost:3002
Methodology, no checkout: http://localhost:3002/methodology

## Happy path

Open the home page. Confirm every eligibility item with Yes, including the required ordinary Texas private-party copy.
Facts: sale price 8000, purchase date today or earlier, county Travis.
Open the official SPV calculator in a new tab. Paste 12000. The helper says the product does not fetch the number.
Tax preview shows sale price, 80 percent of SPV (9600), tax base 9600, and tax at the stored rule rate. Same numbers later appear on the packet.
Because 8000 is below 80 percent of SPV, the appraisal comparison appears. Optional fee is allowed. Copy is estimated comparison, not a recommendation.
County checklist: 30 calendar days from purchase, Travis office card, official form links, seller Vehicle Transfer Notification reminder. Titlebrief does not file it.
Pay 19 USD. Mock success. The page becomes the packet.
Download the PDF. Totals match the preview. The local email control writes under var/inbox. Expiry is 30 days. Delete now removes download.

## Unsupported path

Start over. Answer No on any disqualifier (dealer, salvage or rebuilt or bonded, gift or inheritance, out-of-state, lien-complex, or the required confirmation).
The full-page unsupported state names the rejected type and links official TxDMV and Comptroller pages. There is no Pay control.

## Mock fail

Complete a supported preview through the checklist. On pay, choose Simulate failed payment. Stay on the pay step. The copy is: Payment did not go through. Try again.
Pay 19 USD again. Success is idempotent: one order, same packet token if already paid.

## Expired packet

After a paid session, move expiresAt into the past on that session row, or wait until the 30-day stamp lapses.
Download returns closed. The copy is: This packet link has expired. No re-download. Start over only. Deleted packets also fail closed.

## Notes

Collects no SSN, driver license image, title image, VIN, or card data. Prices and counties are not placed in URLs. The packet token is the only download key.
