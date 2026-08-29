import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { formatCents } from "./money";
import type { SessionDTO } from "./types";

export const INBOX_DIR = path.join(process.cwd(), "var", "inbox");

export async function writeLocalEmail(session: SessionDTO): Promise<string> {
  await mkdir(INBOX_DIR, { recursive: true });
  const token = session.packetToken ?? session.id;
  const filename = `${token}.txt`;
  const filePath = path.join(INBOX_DIR, filename);
  const tax = session.taxTrace;
  const lines = [
    "Titlebrief packet notice (local inbox)",
    `Session: ${session.id}`,
    `Order: ${session.orderId ?? ""}`,
    `Token: ${token}`,
    tax ? `Sale price: ${formatCents(tax.salePriceCents)}` : "",
    tax ? `Tax preview: ${formatCents(tax.taxCents)}` : "",
    tax ? `Rule version: ${tax.ruleVersionId}` : "",
    session.expiresAt ? `Expires: ${session.expiresAt}` : "",
    "",
    "This local cut writes a file instead of sending email.",
    "Titlebrief does not file a title and does not give tax advice.",
  ].filter((line) => line !== undefined);
  await writeFile(filePath, `${lines.join("\n")}\n`, "utf8");
  return filePath;
}
