export const FINISAJ_ORDER = [
  "FI3D", "Vopsit", "CPL", "GREKO", "Premium", "VOPSIT UV",
  "Vopsit Pulbere", "Sticla Graf", "Prefinisat Alb", "Finisaj PVC",
  "Usi Tehnice Reversibile", "Delight", "Forteca",
];
export const NONE_OPT = "—";

export const FERONERIE: Record<string, number> = {
  "2|1A Oval|Argintiu": 179,
  "2|1B Dreptunghiular|Argintiu": 179,
  "2|4AZ Oval EXT|Argintiu": 205,
  "2|4AW Oval INT|Argintiu": 205,
  "2|4BZ Drept. EXT|Argintiu": 205,
  "2|4BW Drept. INT|Argintiu": 205,
  "2|1A Oval|Negru/Alb": 231,
  "2|1B Dreptunghiular|Negru/Alb": 231,
  "2|4AZ Oval EXT|Negru/Alb": 258,
  "2|4AW Oval INT|Negru/Alb": 258,
  "2|4BZ Drept. EXT|Negru/Alb": 258,
  "2|4BW Drept. INT|Negru/Alb": 258,
  "3|1A Oval|Argintiu": 225,
  "3|1B Dreptunghiular|Argintiu": 228,
  "3|4AZ Oval EXT|Argintiu": 251,
  "3|4AW Oval INT|Argintiu": 251,
  "3|4BZ Drept. EXT|Argintiu": 254,
  "3|4BW Drept. INT|Argintiu": 254,
  "3|1A Oval|Negru/Alb": 288,
  "3|1B Dreptunghiular|Negru/Alb": 291,
  "3|4AZ Oval EXT|Negru/Alb": 315,
  "3|4AW Oval INT|Negru/Alb": 315,
  "3|4BZ Drept. EXT|Negru/Alb": 318,
  "3|4BW Drept. INT|Negru/Alb": 318,
};

export const BAL_MODELS = [
  "1A Oval", "1B Dreptunghiular", "4AZ Oval EXT",
  "4AW Oval INT", "4BZ Drept. EXT", "4BW Drept. INT",
];
export const BAL_CULORI = ["Argintiu", "Negru/Alb"];

export type ManereEntry = { culoare: string; price: number };
export type ManereData = Record<string, Record<string, ManereEntry[]>>;

const MANERE_RAW: [string, string, string, number][] = [
  ["QUBIK", "Maner", "Nichel velvet / Crom lucios / Alb mat / Negru mat", 21],
  ["QUBIK", "Bocheta cheie/cil.", "Nichel velvet / Crom lucios / Alb mat / Negru mat", 12],
  ["QUBIK", "Bocheta WC", "Nichel velvet / Crom lucios / Alb mat / Negru mat", 15],
  ["QUBIK", "Maner", "Alamă lucioasă", 24],
  ["QUBIK", "Bocheta cheie/cil.", "Alamă lucioasă", 12],
  ["QUBIK", "Bocheta WC", "Alamă lucioasă", 15],

  ["LUNA PREMIUM rozeta patrata", "Maner", "Crom lucios / Crom periat / Alamă lucioasă / Negru mat", 38],
  ["LUNA PREMIUM rozeta patrata", "Bocheta cheie/cil.", "—", 15],
  ["LUNA PREMIUM rozeta patrata", "Bocheta WC", "—", 25],

  ["LUNA PREMIUM rozeta rotunda", "Maner", "Crom lucios / Crom periat / Alamă lucioasă / Negru mat", 34],
  ["LUNA PREMIUM rozeta rotunda", "Bocheta cheie/cil.", "—", 15],
  ["LUNA PREMIUM rozeta rotunda", "Bocheta WC", "—", 25],

  ["BELLA SLIM rozeta patrata", "Maner", "Crom lucios / Crom satinat / Alamă lucioasă / Alamă satin / Negru mat", 41],
  ["BELLA SLIM rozeta patrata", "Bocheta cheie/cil.", "—", 15],
  ["BELLA SLIM rozeta patrata", "Bocheta WC", "—", 25],

  ["BELLA SLIM rozeta rotunda", "Maner", "Crom lucios / Crom satinat / Alamă lucioasă / Alamă satin / Negru mat", 41],
  ["BELLA SLIM rozeta rotunda", "Bocheta cheie/cil.", "—", 15],
  ["BELLA SLIM rozeta rotunda", "Bocheta WC", "—", 25],

  ["CUBE", "Maner", "Crom lucios / Crom satinat / Nichel satinat / Negru mat", 38],
  ["CUBE", "Bocheta cheie/cil.", "—", 13],
  ["CUBE", "Bocheta WC", "—", 23],

  ["CUBE slim", "Maner", "Crom lucios / Crom satinat / Alamă lucioasă / Alamă satin / Negru mat", 45],
  ["CUBE slim", "Bocheta cheie/cil.", "—", 15],
  ["CUBE slim", "Bocheta WC", "—", 25],

  ["CUBE PREMIUM", "Maner", "Crom lucios / Crom satinat / Nichel satinat / Negru mat", 49],
  ["CUBE PREMIUM", "Bocheta cheie/cil.", "—", 15],
  ["CUBE PREMIUM", "Bocheta WC", "—", 25],

  ["CORONA TIME SLIM R", "Maner", "Alamă mată / Gunmetal", 119],
  ["CORONA TIME SLIM R", "Bocheta cheie/cil.", "Alamă mată / Gunmetal", 24],
  ["CORONA TIME SLIM R", "Bocheta WC", "Alamă mată / Gunmetal", 34],
  ["CORONA TIME SLIM R", "Maner", "Negru mat", 102],
  ["CORONA TIME SLIM R", "Bocheta cheie/cil.", "Negru mat", 21],
  ["CORONA TIME SLIM R", "Bocheta WC", "Negru mat", 31],

  ["CORONA IMPERA RT", "Maner", "Crom lucios / Crom periat / Nichel periat / Negru mat", 126],
  ["CORONA IMPERA RT", "Bocheta cheie", "Crom lucios / Crom periat / Nichel periat / Negru mat", 21],
  ["CORONA IMPERA RT", "Bocheta cilindru", "Crom lucios / Crom periat / Nichel periat / Negru mat", 17],
  ["CORONA IMPERA RT", "Bocheta WC", "Crom lucios / Crom periat / Nichel periat / Negru mat", 34],
  ["CORONA IMPERA RT", "Maner", "Cupru lucios / Alb mat", 136],
  ["CORONA IMPERA RT", "Bocheta cheie/cil.", "Cupru lucios / Alb mat", 21],
  ["CORONA IMPERA RT", "Bocheta WC", "Cupru lucios / Alb mat", 41],

  ["CORONA ARROW R", "Maner", "Crom lucios / Crom periat / Negru mat", 54],
  ["CORONA ARROW R", "Bocheta cheie/cil.", "Crom lucios / Crom periat / Negru mat", 16],
  ["CORONA ARROW R", "Bocheta WC", "Crom lucios / Crom periat / Negru mat", 28],
  ["CORONA ARROW R", "Maner", "Alb mat", 64],
  ["CORONA ARROW R", "Bocheta cheie/cil.", "Alb mat", 21],
  ["CORONA ARROW R", "Bocheta WC", "Alb mat", 34],

  ["CORONA ARROW Q", "Maner", "Crom lucios / Crom periat / Negru mat", 58],
  ["CORONA ARROW Q", "Bocheta cheie/cil.", "Crom lucios / Crom periat / Negru mat", 17],
  ["CORONA ARROW Q", "Bocheta WC", "Crom lucios / Crom periat / Negru mat", 29],
  ["CORONA ARROW Q", "Maner", "Alb mat", 68],
  ["CORONA ARROW Q", "Bocheta cheie/cil.", "Alb mat", 21],
  ["CORONA ARROW Q", "Bocheta WC", "Alb mat", 34],

  ["CORONA MOON R SLIM", "Maner", "Crom lucios / Negru mat", 78],
  ["CORONA MOON R SLIM", "Bocheta cheie/cil.", "Crom lucios / Negru mat", 21],
  ["CORONA MOON R SLIM", "Bocheta WC", "Crom lucios / Negru mat", 31],
  ["CORONA MOON R SLIM", "Maner", "Alamă lucioasă / Alamă mată", 92],
  ["CORONA MOON R SLIM", "Bocheta cheie/cil.", "Alamă lucioasă / Alamă mată", 24],
  ["CORONA MOON R SLIM", "Bocheta WC", "Alamă lucioasă / Alamă mată", 34],
];

export const MANERE_DATA: ManereData = {};
export const MANERE_TIPS: Record<string, string[]> = {};
export const MANERE_MODELS: string[] = [];

for (const [model, tip, culoare, price] of MANERE_RAW) {
  if (!MANERE_DATA[model]) {
    MANERE_DATA[model] = {};
    MANERE_TIPS[model] = [];
    MANERE_MODELS.push(model);
  }
  if (!MANERE_DATA[model][tip]) {
    MANERE_DATA[model][tip] = [];
    MANERE_TIPS[model].push(tip);
  }
  MANERE_DATA[model][tip].push({ culoare, price });
}

export function getManereColLabels(model: string, tip: string): string[] {
  const opts = MANERE_DATA[model]?.[tip] ?? [];
  return opts.map(({ culoare, price }) =>
    culoare === "—" ? `${price} EUR` : `${culoare}  –  ${price} EUR`
  );
}

export function manerePriceFromLabel(model: string, tip: string, label: string): number | null {
  const opts = MANERE_DATA[model]?.[tip] ?? [];
  for (const { culoare, price } of opts) {
    const expected = culoare === "—" ? `${price} EUR` : `${culoare}  –  ${price} EUR`;
    if (expected === label) return price;
  }
  return null;
}

export const COSTURI: [string, number][] = [
  ["Decupaj ventilatie", 10],
  ["Dimensiune foaie usa 100", 36],
  ["Inlocuire broasca magnetica neagra/aurie", 10],
  ["Inlocuire balamale + contraplaca neagra/aurie", 26],
  ["Prag retractabil", 42],
  ["Finisare culori RAL", 103],
  ["Décor stejar cu noduri", 172],
];

export const COSTURI_LABELS = COSTURI.map(([l, p]) => `${l}  (+${p} EUR)`);
export const COSTURI_MAP: Record<string, number> = Object.fromEntries(
  COSTURI.map(([l, p]) => [`${l}  (+${p} EUR)`, p])
);

export const CULORI_USA = [
  "Alb mat", "Alb lucios", "Negru mat", "Gri mat", "Gri antracit",
  "Wenge", "Stejar natur", "Stejar inchis", "Nuc", "Pino natur",
  "Sonoma stejar", "Finisaj RAL personalizat",
];
export const DESCHIDERI = ["Stanga", "Dreapta"];

// Standard door leaf widths (mm)
export const DIM_LATIMI = ["600", "700", "800", "900", "1000"];
// Standard door leaf heights (mm)
export const DIM_INALTIMI = ["2000", "2100"];
// Standard wall thicknesses (mm)
export const DIM_GROSIMI_PERETE = ["100", "115", "120", "125", "150", "175", "200", "250", "300", "350"];
// Reglaj toc ranges based on wall thickness
export const DIM_REGLAJ_TOC = ["60-80", "80-100", "100-130", "130-160", "160-200", "200-250", "250-300", "300-350"];
// Pervaz options
export const DIM_PERVAZ_OPTS = ["Fara pervaz", "Pervaz 40mm", "Pervaz 60mm", "Pervaz 80mm", "Pervaz 100mm"];
// Scurare (undercutting) options mm
export const DIM_SCURARE = ["5", "8", "10", "12", "15", "20"];

export const TIP_BROASCA = ["Simpla", "WC", "Magnetica", "Cilindru", "Yale", "Fara broasca"];
export const UMPLERE = ["Panou plin", "MDF simplu", "Geam simplu", "Geam mat", "Geam ornament", "Geam securizat", "Fara umplere"];

export interface DimFields {
  latime: string;
  inaltime: string;
  grosimePerete: string;
  reglajToc: string;
  pervaz: string;
  scurare: string;
}

export function formatDimSummary(d: DimFields): string {
  const parts: string[] = [];
  if (d.latime && d.inaltime) parts.push(`${d.latime}×${d.inaltime} mm`);
  if (d.grosimePerete) parts.push(`perete ${d.grosimePerete} mm`);
  if (d.reglajToc) parts.push(`reglaj ${d.reglajToc} mm`);
  if (d.pervaz && d.pervaz !== "Fara pervaz") parts.push(d.pervaz);
  if (d.scurare) parts.push(`scurare ${d.scurare} mm`);
  return parts.join(", ");
}
