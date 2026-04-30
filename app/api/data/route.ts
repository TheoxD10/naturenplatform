import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DataMap = Record<string, Record<string, Record<string, any>>>;

export async function GET() {
  const data: DataMap = {};

  // ── 1. Noduri (main doors) ─────────────────────────────────
  const buffer = fs.readFileSync(path.join(process.cwd(), "public", "201_Usi_Restructured_v2.xlsx"));
  const wb = XLSX.read(buffer, { type: "buffer" });
  const ws = wb.Sheets["Noduri"];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

  for (const row of rows) {
    const [, l2, l3, l4, , , price] = row as [unknown, string, string, string, unknown, unknown, number];
    if (!l2 || l2 === "Level 2" || !l4 || l4 === l3) continue;
    if (!data[l2]) data[l2] = {};
    if (!data[l2][l3]) data[l2][l3] = {};
    data[l2][l3][l4] = typeof price === "number" ? price : null;
  }

  // ── 2. TOC from TOC Levels sheet ───────────────────────────
  const tocWs = wb.Sheets["TOC Levels"];
  const tocRows: unknown[][] = XLSX.utils.sheet_to_json(tocWs, { header: 1 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tocData: Record<string, Record<string, Record<string, any>>> = {};

  // Price rows: col[0] = "TOC <typeName>", col[6] = "Pret fara TVA", col[7] = number
  for (const row of tocRows) {
    const r = row as (string | number | null | undefined)[];
    if (
      typeof r[0] === "string" && r[0].startsWith("TOC ") &&
      r[6] === "Pret fara TVA" && typeof r[7] === "number"
    ) {
      const typeName = (r[0] as string).slice(4);
      const col1 = String(r[1] ?? "");
      // Code-only values like "01.05" mean no reglaj sub-level → sentinel "__"
      const reglaj = /^\d+(\.\d+)+$/.test(col1) ? "__" : col1;
      const finisaj = String(r[3] ?? "");
      if (!tocData[typeName]) tocData[typeName] = {};
      if (!tocData[typeName][reglaj]) tocData[typeName][reglaj] = {};
      tocData[typeName][reglaj][finisaj] = r[7] as number;
    }
  }

  // Hierarchy rows: add structural leaf types (no prices) from the Level 1-4 tree
  const hierRows = tocRows
    .map((r) => r as (string | null | undefined)[])
    .filter((r) => r[0] === "TOC" && r[1] != null);

  const l3HasL4 = new Set(hierRows.filter((r) => r[3] != null).map((r) => `${r[1]}|${r[2]}`));
  const l2HasL3 = new Set(hierRows.filter((r) => r[2] != null).map((r) => String(r[1])));

  for (const r of hierRows) {
    let name: string;
    if      (r[3] != null)                                         name = `${r[1]} ${r[2]} ${r[3]}`;
    else if (r[2] != null && !l3HasL4.has(`${r[1]}|${r[2]}`))    name = `${r[1]} ${r[2]}`;
    else if (r[2] == null && !l2HasL3.has(String(r[1])))          name = String(r[1]);
    else continue;
    if (!tocData[name]) tocData[name] = {};
  }

  data["TOC_V2"] = tocData;

  return NextResponse.json(data);
}
