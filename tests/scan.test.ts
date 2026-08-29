import { execSync } from "child_process";
import { describe, expect, it } from "vitest";

const ROOT = "/workspace/titlebrief";

function scan(pattern: string): string {
  try {
    return execSync(
      `rg -n -i --glob '!node_modules/**' --glob '!.next/**' --glob '!var/**' --glob '!tests/**' --glob '!package-lock.json' ${JSON.stringify(pattern)} ${ROOT}`,
      { encoding: "utf8" },
    );
  } catch (error) {
    const err = error as { status?: number; stdout?: string };
    if (err.status === 1) {
      return "";
    }
    throw error;
  }
}

describe("copy scan", () => {
  it("rejects outdated working-day deadline language", () => {
    expect(scan("20 working day")).toBe("");
  });

  it("rejects appraisal-directive language", () => {
    expect(scan("you should obtain an appraisal")).toBe("");
  });

  it("rejects savings-directive language", () => {
    expect(scan("you will save")).toBe("");
  });
});
