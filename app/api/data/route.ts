import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DataMap = Record<string, Record<string, Record<string, any>>>;

const FILOMURO_TOC_MODELS: Record<string, string> = {
  "Filomuro Naturen interior cu toc aluminiu": "Toc Naturen Filomuro deschidere interioara",
  "Filomuro Naturen exterior cu toc aluminiu": "Toc Naturen Filomuro deschidere exterioara",
  "Filomuro Erkado cu toc aluminiu aferent deschidere exterioara": "Toc Erkado Filomuro deschidere exterioara",
  "Filomuro Erkado cu toc aluminiu deschidere interioara": "Toc Erkado Filomuro deschidere interioara",
};

export async function GET() {
  const data: DataMap = {};

  // ── 1. Noduri (main doors) ─────────────────────────────────
  const buffer = fs.readFileSync(path.join(process.cwd(), "public", "201_Usi_Restructured_v2.xlsx"));
  const wb = XLSX.read(buffer, { type: "buffer" });
  const ws = wb.Sheets["Noduri"];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
  const filomuroTocPrices: Record<string, number> = {};

  for (const row of rows) {
    const [, l2, l3, l4, , , price] = row as [unknown, string, string, string, unknown, unknown, number];
    if (!l2 || l2 === "Level 2" || !l3 || !l4 || l4 === l3) continue;
    const filomuroTocModel = FILOMURO_TOC_MODELS[l4];
    if (filomuroTocModel) {
      if (typeof price === "number") filomuroTocPrices[filomuroTocModel] = price;
      continue;
    }
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

  if (Object.keys(filomuroTocPrices).length > 0) {
    tocData["Toc sistem ascuns"] = {
      ...(tocData["Toc sistem ascuns"] ?? {}),
      "__": {
        ...(tocData["Toc sistem ascuns"]?.["__"] ?? {}),
        ...filomuroTocPrices,
      },
    };
  }

  data["TOC_V2"] = tocData;

  // ── 3. INNOVA static supplement (prices TBD — add rows to Excel Noduri to set real prices) ──
  if (!data["INNOVA"]) {
    data["INNOVA"] = { "3D": {}, "LAMINAT": {} };
    for (const w of [60, 70, 80, 90]) {
      data["INNOVA"]["3D"][`INNOVA 3D ${w}`] = 0;
      data["INNOVA"]["LAMINAT"][`LAMINAT ${w}`] = 0;
    }
  }

  return NextResponse.json(data);
}
