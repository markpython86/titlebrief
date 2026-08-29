import PDFDocument from "pdfkit";
import { formatCents, formatRateBps } from "./money";
import { formatLongDate, parseIsoDate, titleDeadline } from "./dates";
import {
  APPRAISAL_COMPARE_COPY,
  DEADLINE_COPY,
  OFFICIAL_SOURCES,
  SELLER_VTN_REMINDER,
  SUPPORT_CONTACT,
  TAX_PREVIEW_LABEL,
} from "./sources";
import { computeAppraisalCompare, type TaxTrace } from "./tax";
import type { CountyDTO } from "./types";

export type PacketPdfInput = {
  taxTrace: TaxTrace;
  purchaseDate: string;
  county: CountyDTO;
  appraisalFeeCents: number | null;
};

function collectPdf(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => {
      chunks.push(chunk as Buffer);
    });
    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    doc.on("error", reject);
  });
}

export async function renderPacketPdf(input: PacketPdfInput): Promise<Buffer> {
  const doc = new PDFDocument({ size: "LETTER", margin: 54 });
  const done = collectPdf(doc);
  const { taxTrace, county } = input;
  const purchase = parseIsoDate(input.purchaseDate);
  const deadline = purchase ? titleDeadline(purchase) : null;
  const compare = computeAppraisalCompare(
    taxTrace,
    input.appraisalFeeCents ?? 0,
  );

  doc.fillColor("#1c1914").fontSize(18).text("Titlebrief packet");
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor("#5e594e").text("Texas private-party preview");
  doc.moveDown(0.6);
  doc.fontSize(11).fillColor("#1c1914").text(TAX_PREVIEW_LABEL);

  doc.moveDown(0.8);
  doc.fontSize(13).text("Tax preview");
  doc.moveDown(0.3);
  doc.font("Courier").fontSize(11);
  const rows: Array<[string, string]> = [
    ["Sale price", formatCents(taxTrace.salePriceCents)],
    ["80% of SPV", formatCents(taxTrace.eightyPctSpvCents)],
    ["Tax base", formatCents(taxTrace.taxBaseCents)],
    [
      `Estimated tax at stored rate ${formatRateBps(taxTrace.rateBps)}`,
      formatCents(taxTrace.taxCents),
    ],
  ];
  for (const [label, value] of rows) {
    doc.text(`${label}: ${value}`);
  }
  doc.font("Helvetica").fontSize(10).fillColor("#5e594e");
  doc.text(`Rule version ${taxTrace.ruleVersionId}`);
  doc.text(`Current as of ${taxTrace.sourceDate}`);

  if (compare) {
    doc.moveDown(0.7);
    doc.fontSize(13).fillColor("#1c1914").text("Appraisal comparison");
    doc.moveDown(0.3);
    doc.font("Courier").fontSize(11);
    doc.text(`Potential tax difference: ${formatCents(compare.potentialDifferenceCents)}`);
    doc.text(`Appraisal fee: ${formatCents(compare.appraisalFeeCents)}`);
    doc.text(`Net estimated comparison: ${formatCents(compare.netEstimatedCents)}`);
    doc.font("Helvetica").fontSize(10).fillColor("#5e594e").text(APPRAISAL_COMPARE_COPY);
  }

  doc.moveDown(0.7);
  doc.fontSize(13).fillColor("#1c1914").text("County checklist");
  doc.moveDown(0.3);
  doc.fontSize(11).text(DEADLINE_COPY);
  if (deadline) {
    doc.font("Courier").text(`Deadline: ${formatLongDate(deadline)}`);
    doc.font("Helvetica");
  }
  doc.text(county.officeName);
  doc.text(county.address);
  doc.fillColor("#1f4d46").text(county.officialUrl);
  doc.fillColor("#1c1914").text(county.hoursText);
  doc.fontSize(10).fillColor("#5e594e").text(`Last verified ${county.lastVerified}`);
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#1c1914").text(SELLER_VTN_REMINDER);
  doc.moveDown(0.3);
  doc.fontSize(10);
  doc.fillColor("#1f4d46").text(OFFICIAL_SOURCES.form130U.label);
  doc.text(OFFICIAL_SOURCES.form130U.href);
  doc.text(OFFICIAL_SOURCES.sellerVtn.label);
  doc.text(OFFICIAL_SOURCES.sellerVtn.href);
  doc.text(OFFICIAL_SOURCES.txdmvBuyingSelling.label);
  doc.text(OFFICIAL_SOURCES.txdmvBuyingSelling.href);
  doc.text(OFFICIAL_SOURCES.comptrollerSpvGuide.label);
  doc.text(OFFICIAL_SOURCES.comptrollerSpvGuide.href);
  doc.text(OFFICIAL_SOURCES.comptrollerPrivatePartySpv.label);
  doc.text(OFFICIAL_SOURCES.comptrollerPrivatePartySpv.href);

  doc.moveDown(0.8);
  doc.fillColor("#5e594e").fontSize(9);
  doc.text("Not tax advice. Not a filing service. Not a substitute for county or Comptroller instructions.");
  doc.text(`Rule version ${taxTrace.ruleVersionId}. Current as of ${taxTrace.sourceDate}.`);
  doc.text(`Correction or refund: ${SUPPORT_CONTACT}`);
  doc.end();
  return done;
}
