import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Normalize Romanian diacritics for PDF (standard fonts don't support them)
function n(s: string): string {
  return s
    .replace(/[ăÅŸ]/g, (c) => ({ ă: "a", Ă: "A" }[c] ?? c))
    .replace(/[âÂ]/g, (c) => ({ â: "a", Â: "A" }[c] ?? c))
    .replace(/[îÎ]/g, (c) => ({ î: "i", Î: "I" }[c] ?? c))
    .replace(/[șşŞ]/g, (c) => "s")
    .replace(/[ȘŞ]/g, () => "S")
    .replace(/[țţ]/g, () => "t")
    .replace(/[ȚŢ]/g, () => "T");
}

export interface OfferItem {
  name: string;
  obs?: string;
  um: string;
  qty: number;
  priceRon: number;
  isDiscount?: boolean;
}

export interface OfferData {
  items: OfferItem[];
  offerNumber: string;
  offerDate: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  discountPercent: number;
  deliveryDays: string;
  agent: string;
  advanceRon: number;
}

const COMPANY = {
  name: "S.C. NATUREN CONCEPT S.R.L.",
  cui: "CUI: RO33222186",
  reg: "Nr. Reg. Com.: J2014000877058",
  iban: "IBAN: RO93 RNCB 0032 1422 4044 0001",
  address: "Sediu: Calea Borsului, nr. 53A, Oradea, jud. Bihor",
};

const AGENTS: Record<string, string[]> = {
  "Magazin Oradea": [
    "Email: magazin.oradea@naturen.ro",
    "SHOWROOM ORADEA: 0724.222.548",
    "BIRAU RAZVAN: 0786.512.704",
    "Punct de lucru:",
    "P-TA EMANUIL GOJDU NR.53",
    "ORADEA",
  ],
};

const TVA = 0.21;

export function generateOfferPdf(data: OfferData): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const margin = 14;
  const contentW = W - margin * 2;

  // ── Helpers ────────────────────────────────────────────────
  const right = (x: number) => W - margin - x;
  const fmt = (v: number) =>
    v.toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " RON";

  // ── Header ─────────────────────────────────────────────────
  let y = 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(26, 46, 74);
  doc.text("NATUREN", margin, y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.text(n(COMPANY.name), margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  const compLines = [COMPANY.cui, COMPANY.reg, COMPANY.iban, n(COMPANY.address)];
  for (const line of compLines) {
    y += 4.5;
    doc.text(line, margin, y);
  }

  // Buyer info (right column)
  const colR = W / 2 + 5;
  let yR = 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  doc.text(n("Cumparator:"), colR, yR);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  yR += 5;
  doc.text(n(data.buyerName || "—"), colR, yR);
  yR += 4.5;
  doc.text(n("Telefon: " + (data.buyerPhone || "—")), colR, yR);
  if (data.buyerAddress) {
    const addrLines = doc.splitTextToSize(n("Adresa: " + data.buyerAddress), 85);
    for (const line of addrLines) {
      yR += 4.5;
      doc.text(line as string, colR, yR);
    }
  }

  yR += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(n("Oferta Nr.: " + data.offerNumber), colR, yR);
  yR += 5;
  doc.text(n("Data Ofertei: " + data.offerDate), colR, yR);

  // Separator line
  y = Math.max(y, yR) + 6;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(margin, y, W - margin, y);

  // ── Title ──────────────────────────────────────────────────
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(26, 46, 74);
  doc.text(n("OFERTA COMERCIALA"), W / 2, y, { align: "center" });

  // ── Build items ────────────────────────────────────────────
  y += 5;
  const subtotal = data.items.reduce((s, i) => s + i.priceRon, 0);
  const discountAmt = data.discountPercent > 0 ? -(subtotal * data.discountPercent) / 100 : 0;
  const totalFaraTva = subtotal + discountAmt;
  const tvaAmt = totalFaraTva * TVA;
  const totalCuTva = totalFaraTva + tvaAmt;

  const tableBody: (string | { content: string; styles: object })[][] = data.items.map((item, i) => {
    const nameLine = item.obs ? `${n(item.name)}\nObs: ${n(item.obs)}` : n(item.name);
    const priceFara = item.priceRon;
    const priceCu = item.priceRon * (1 + TVA);
    return [
      String(i + 1),
      nameLine,
      n(item.um),
      String(item.qty),
      fmt(priceFara),
      fmt(priceFara),
      fmt(priceCu),
    ];
  });

  if (discountAmt < 0) {
    tableBody.push([
      "",
      n(`REDUCERE COMERCIALA (${data.discountPercent}%)`),
      "",
      "",
      "",
      fmt(discountAmt),
      fmt(discountAmt * (1 + TVA)),
    ]);
  }

  autoTable(doc, {
    startY: y,
    head: [[
      "Nr.", n("Produs / Serviciu"), "UM", "Cant.",
      n("Pret Unitar\n(fara TVA)"),
      n("Valoare\n(fara TVA)"),
      n("Valoare\n(cu TVA)"),
    ]],
    body: tableBody,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: {
      fillColor: [26, 46, 74],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 65 },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 13, halign: "center" },
      4: { cellWidth: 25, halign: "right" },
      5: { cellWidth: 25, halign: "right" },
      6: { cellWidth: 28, halign: "right" },
    },
    alternateRowStyles: { fillColor: [247, 248, 250] },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 6;

  // ── Footer: Agent (left) + Totals (right) ─────────────────
  const agentLines = AGENTS[data.agent] ?? [data.agent];
  const agentX = margin;
  let yA = y;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text(n("Agent Vanzari:"), agentX, yA);
  yA += 4.5;
  doc.setFont("helvetica", "normal");
  doc.text(n(data.agent), agentX, yA);
  for (const line of agentLines) {
    yA += 4;
    doc.setTextColor(100, 100, 100);
    doc.text(n(line), agentX, yA);
  }

  // Totals box (right)
  const boxX = W / 2 + 10;
  const boxW = contentW / 2 - 5;
  let yT = y;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);

  const totals: [string, number][] = [
    [n("Total Oferta (fara TVA):"), totalFaraTva],
    [n(`TVA (${Math.round(TVA * 100)}%):`), tvaAmt],
  ];
  for (const [label, val] of totals) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(40, 40, 40);
    doc.text(label, boxX, yT);
    doc.setFont("helvetica", "bold");
    doc.text(fmt(val), W - margin, yT, { align: "right" });
    yT += 6;
  }
  // Total general with box
  doc.setFillColor(26, 46, 74);
  doc.rect(boxX - 1, yT - 4.5, boxW + 2, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(n("Total General (cu TVA):"), boxX + 1, yT);
  doc.text(fmt(totalCuTva), W - margin - 1, yT, { align: "right" });
  yT += 9;

  // Signature line (right side)
  doc.setDrawColor(150, 150, 150);
  doc.line(boxX, yT, W - margin, yT);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text(n("Nume, Prenume si Semnatura Cumparator"), (boxX + W - margin) / 2, yT + 4, { align: "center" });

  y = Math.max(yA, yT + 8) + 8;

  // ── Terms ──────────────────────────────────────────────────
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, W - margin, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  doc.text(n(`Conditii Comerciale Principale Pentru Oferta Cu Nr. ${data.offerNumber}`), margin, y);
  y += 5;

  const advance = data.advanceRon > 0 ? fmt(data.advanceRon) : fmt(totalCuTva / 2);
  const terms = [
    n(`Termen de livrare: ${data.deliveryDays || "____"} zile lucratoare, din momentul achitarii avansului de ${advance} si efectuarii masuratorilor finale.`),
    n(`Livrarea comenzii se efectueaza doar dupa achitarea integrala a valorii contractului (${fmt(totalCuTva)}).`),
    n("Transportul produselor este asigurat de catre Vanzator in baza unei programari prealabile."),
    n("Reducerea comerciala nu se aplica pe servicii."),
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);
  for (const term of terms) {
    const lines = doc.splitTextToSize(`• ${term}`, contentW);
    for (const line of lines as string[]) {
      doc.text(line, margin + (line.startsWith("•") ? 0 : 4), y);
      y += 4.5;
    }
    y += 1;
  }

  // ── Save ───────────────────────────────────────────────────
  doc.save(`Oferta_${data.offerNumber}_${data.buyerName.replace(/\s+/g, "_")}.pdf`);
}
