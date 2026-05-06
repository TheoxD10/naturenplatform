export const FINISAJ_ORDER = [
  "FI3D", "Vopsit", "CPL", "GREKO", "Premium", "VOPSIT UV",
  "Vopsit Pulbere", "Sticla Graf", "Prefinisat Alb", "Finisaj PVC",
  "Usi Tehnice Reversibile", "Delight", "Forteca", "INNOVA",
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

export const COSTURI: [string, number | null][] = [
  ["Decupaj ventilatie", 10],
  ["Dimensiune foaie usa 100", 36],
  ["Inlocuire broasca magnetica neagra/aurie", 10],
  ["Inlocuire balamale + contraplaca neagra/aurie", 26],
  ["Prag retractabil", 42],
  ["Finisare culori RAL", 103],
  ["Décor stejar cu noduri", 172],
  ["Toc tunel", null],
  ["Scurtari", null],
  ["Redimensionari", null],
  ["Montaj", null],
  ["Transport", null],
  ["Cost Suplimentar Ajustare 40mm (ERKADO)", null],
];

export const COSTURI_LABELS = COSTURI.map(([l]) => l);
export const COSTURI_MAP: Record<string, number | null> = Object.fromEntries(COSTURI);

export const CULORI_USA = [
  "Alb mat", "Alb lucios", "Negru mat", "Gri mat", "Gri antracit",
  "Wenge", "Stejar natur", "Stejar inchis", "Nuc", "Pino natur",
  "Sonoma stejar", "Finisaj RAL personalizat",
];

// Per-collection color options derived from Excel Proprietati sheet
export const CULORI_PER_COLECTIE: Record<string, Record<string, string[]>> = {
  "FI3D": {
    "Aristo":       ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
    "Arte":         ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
    "Avens":        ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
    "Carena":       ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
    "Crystal":      ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
    "Essenza":      ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
    "Galla":        ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
    "Genua":        ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
    "Isis":         ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
    "Karma":        ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil", "Argintiu", "Auriu", "Negru"],
    "Laria":        ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
    "Leona":        ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil", "Argintiu", "Auriu", "Negru"],
    "Natura":       ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
    "Oria":         ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Stejar Pastel", "Wenge Alb", "Silver Oak", "Stejar Sesil"],
    "Passio":       ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
    "Piana":        ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
    "Renea":        ["Silver Oak", "Stejar Sesil", "Nuc", "Alb", "Kasmir"],
    "Ria":          ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
    "Riel":         ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
    "Selecta":      ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
    "Selena":       ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
    "Serina":       ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil", "Argintiu", "Auriu", "Negru"],
    "Syra":         ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
    "Tempo":        ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
    "Terra":        ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
    "Treviso":      ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
    "Velis":        ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
    "Venus":        ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil", "Argintiu", "Auriu", "Negru"],
    "Verano":       ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
    "Vincia":       ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil", "Argintiu", "Auriu", "Negru"],
  },
  "CPL": {
    "Altamura":    ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Gri St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Gri Deschis St Cpl", "Cappuccino St Cpl", "Antracita St Cpl", "Cenusiu St Cpl", "Alb St Cpl", "Grey Cpl", "Alb Cpl", "Antracita Satinata Cpl", "Nuc Classic Cpl", "Stejar Retro Cpl", "Stejar Classic Cpl"],
    "Amarylis":    ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Ansedonia":   ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Gri St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Gri Deschis St Cpl", "Cappuccino St Cpl", "Antracita St Cpl", "Cenusiu St Cpl", "Alb St Cpl", "Grey Cpl", "Alb Cpl", "Antracita Satinata Cpl", "Nuc Classic Cpl", "Stejar Retro Cpl", "Stejar Classic Cpl"],
    "Azalia":      ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Baldur":      ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Gri St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Gri Deschis St Cpl", "Cappuccino St Cpl", "Antracita St Cpl", "Cenusiu St Cpl", "Alb St Cpl", "Grey Cpl", "Alb Cpl", "Antracita Satinata Cpl", "Nuc Classic Cpl", "Stejar Retro Cpl", "Stejar Classic Cpl"],
    "Berberys":    ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Budleja":     ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Daglezja":    ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Debecja":     ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Epimedium":   ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Floks":       ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Forsycja":    ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Fragi":       ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Frezja":      ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Herse":       ["Wenge Dark ST CPL", "Stejar ST CPL", "Stejar Gri ST CPL", "Salvie ST CPL", "Piatra Gri ST CPL", "Negru ST CPL", "Verde Inchis ST CPL", "Bleumarin ST CPL", "Gri Deschis ST CPL", "Cappuccino ST CPL", "Antracita ST CPL", "Cenusiu ST CPL", "Alb ST CPL", "Cenusiu CPL", "Alb CPL", "Antracita Satinata CPL", "Nuc Classic CPL", "Stejar Retro CPL", "Stejar Classic CPL"],
    "Hiacynt":     ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Irys":        ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Jasmin":      ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Juka":        ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Kamelia":     ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Krokus":      ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Laurencja":   ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Lawenda":     ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Leda EI30":   ["Nuc Greko", "Stejar Greko", "Sonoma Greko", "Salcam Deschis Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko", "Wenge Dark St Cpl", "Stejar St Cpl", "Salvie St Cpl", "Stejar Gri St Cpl", "Piatra Gri St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Gri Deschis St Cpl", "Cappuccino St Cpl", "Antracita St Cpl", "Cenusiu St Cpl", "Alb St Cpl", "Grey Cpl", "Alb Cpl", "Antracita Satinata Cpl", "Nuc Classic Cpl", "Stejar Retro Cpl", "Stejar Classic Cpl", "Frasin Grafit Premium", "Stejar Premium", "Stejar Natur Premium", "Transversal Premium", "Nuc Classic Premium", "Beton Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Bialy Premium"],
    "Leda EI60":   ["Nuc Greko", "Stejar Greko", "Sonoma Greko", "Salcam Deschis Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko", "Wenge Dark St Cpl", "Stejar St Cpl", "Salvie St Cpl", "Stejar Gri St Cpl", "Piatra Gri St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Gri Deschis St Cpl", "Cappuccino St Cpl", "Antracita St Cpl", "Cenusiu St Cpl", "Alb St Cpl", "Grey Cpl", "Alb Cpl", "Antracita Satinata Cpl", "Nuc Classic Cpl", "Stejar Retro Cpl", "Stejar Classic Cpl", "Frasin Grafit Premium", "Stejar Premium", "Stejar Natur Premium", "Transversal Premium", "Nuc Classic Premium", "Beton Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Bialy Premium"],
    "Lorient":     ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Gri St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Gri Deschis St Cpl", "Cappuccino St Cpl", "Antracita St Cpl", "Cenusiu St Cpl", "Alb St Cpl"],
    "Lukrecja":    ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Magnolia":    ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Menton":      ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Gri St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Gri Deschis St Cpl", "Cappuccino St Cpl", "Antracita St Cpl", "Cenusiu St Cpl", "Alb St Cpl", "Grey Cpl", "Alb Cpl", "Antracita Satinata Cpl", "Nuc Classic Cpl", "Stejar Retro Cpl", "Stejar Classic Cpl"],
    "Miskant":     ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Nemezja":     ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Peonia":      ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Petunia":     ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Powojnik":    ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Sorano":      ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Gri St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Gri Deschis St Cpl", "Cappuccino St Cpl", "Antracita St Cpl", "Cenusiu St Cpl", "Alb St Cpl", "Grey Cpl", "Alb Cpl", "Antracita Satinata Cpl", "Nuc Classic Cpl", "Stejar Retro Cpl", "Stejar Classic Cpl"],
    "Surmia":      ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
  },
  "GREKO": {
    "Altamura":  ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Stejar Greko", "Sonoma Greko", "Salcam Deschis Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Amarylis":  ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Stejar Greko", "Sonoma Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Ansedonia": ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Stejar Greko", "Sonoma Greko", "Salcam Deschis Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Azalia":    ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Stejar Greko", "Sonoma Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Berberys":  ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Stejar Greko", "Sonoma Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Daglezja":  ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Stejar Greko", "Sonoma Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Debecja":   ["Nuc Greko", "Stejar Mediu Greko", "Stejar Greko", "Sonoma Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Epimedium": ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Stejar Greko", "Sonoma Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Floks":     ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Stejar Greko", "Sonoma Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Forsycja":  ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Stejar Greko", "Sonoma Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Fragi":     ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Stejar Greko", "Sonoma Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Frezja":    ["Nuc Greko", "Stejar Mediu Greko", "Stejar Greko", "Sonoma Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Herse":     ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Stejar Greko", "Sonoma Greko", "Salcam Deschis Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Hiacynt":   ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Stejar Greko", "Sonoma Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Irys":      ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Stejar Greko", "Sonoma Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Juka":      ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Stejar Greko", "Sonoma Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Kamelia":   ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Stejar Greko", "Sonoma Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Krokus":    ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Stejar Greko", "Sonoma Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Lawenda":   ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Stejar Greko", "Sonoma Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Lorient":   ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Sonoma Greko", "Saclam Deschis Greko", "Stajar Gri Greko", "Alb Greko", "Alba Ca Zapada Greko"],
    "Magnolia":  ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Stejar Greko", "Sonoma Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Menton":    ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Stejar Greko", "Sonoma Greko", "Salcam Deschis Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Miskant":   ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Stejar Greko", "Sonoma Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Nemezja":   ["Nuc Greko", "Stejar Mediu Greko", "Stejar Greko", "Sonoma Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Peonia":    ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Stejar Greko", "Sonoma Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Petunia":   ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Stejar Greko", "Sonoma Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Sorano":    ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Sonoma Greko", "Salcam Deschis Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
  },
  "Premium": {
    "Altamura":  ["Stejar Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Beton Premium", "Nuc Classic Premium", "Frasin Grafit Premium", "Alb Premium", "Stejar Natur Premium", "Stejar Natur Transversal Premium"],
    "Amarylis":  ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Ansedonia": ["Stejar Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Beton Premium", "Nuc Classic Premium", "Frasin Grafit Premium", "Alb Premium", "Stejar Natur Premium", "Stejar Natur Transversal Premium"],
    "Aralia":    ["Frasin Grafit Premium", "Stejar Natur Premium", "Stejar Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium"],
    "Azalia":    ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Baldur":    ["Frasin Grafit Premium", "Stejar Premium", "Stejar Natur Premium", "Stejar Natur Transversal Premium", "Nuc Classic Premium", "Beton Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Berberys":  ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Budleja":   ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Daglezja":  ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Debecja":   ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Epimedium": ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Ewodia":    ["Frasin Grafit Premium", "Stejar Natur Premium", "Stejar Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium"],
    "Floks":     ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Forsycja":  ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Fragi":     ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Frezja":    ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Herse":     ["Frasin Grafit Premium", "Stejar Premium", "Stejar Natur Premium", "Stejar Natur Transversal Premium", "Nuc Classic Premium", "Beton Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Hiacynt":   ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Irys":      ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Jasmin":    ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Juka":      ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Kamelia":   ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Krokus":    ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Laurencja": ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Lawenda":   ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Lorient":   ["Stejar Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Beton Premium", "Nuc Classic Premium", "Frasin Grafit Premium", "Alb Premium", "Stejar Natur Premium", "Stejar Natur Transversal Premium"],
    "Lukrecja":  ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Magnolia":  ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Menton":    ["Stejar Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Beton Premium", "Nuc Classic Premium", "Frasin Grafit Premium", "Stejar Natur Premium", "Stejar Natur Transversal Premium"],
    "Miskant":   ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Nemezja":   ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Nolia":     ["Frasin Grafit Premium", "Stejar Natur Premium", "Stejar Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium"],
    "Peonia":    ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Petunia":   ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Powojnik":  ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Sorano":    ["Stejar Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Beton Premium", "Nuc Classic Premium", "Frasin Grafit Premium", "Alb Premium", "Stejar Natur Premium", "Stejar Natur Transversal Premium"],
    "Surmia":    ["Stejar Natur Premium", "Stejar Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Uno":       ["Stejar Premium", "Stejar Natur Premium", "Stejar Natur Transversal Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Beton Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
  },
  "Delight": {
    "Delight": ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
  },
  "VOPSIT UV": {
    "Amarylis":  ["Alb Titan Uv"],
    "Anubis":    ["Alb Titan Uv"],
    "Baldur":    ["Alb Titan Uv"],
    "Laurencja": ["Alb Titan Uv"],
    "Milda":     ["Alb Titan Uv"],
    "Miskant":   ["Alb Titan Uv"],
    "Nemezja":   ["Alb Titan Uv"],
    "Peonia":    ["Alb Titan Uv"],
    "Sylena":    ["Alb Titan Uv"],
    "Turan":     ["Alb Titan Uv"],
    "Uno":       ["Alb Titan Uv"],
  },
  "Vopsit Pulbere": {
    "Loft Art":     ["Negru Str", "Alb Str"],
    "Loft Basic":   ["Negru Str", "Alb Str"],
    "Loft Classic": ["Negru Str", "Alb Str"],
  },
  "Finisaj PVC": {
    "Ingresso 1": ["antracit - alb", "antracit - antracit", "pecan - alb"],
    "Ingresso 2": ["antracit - alb"],
    "Ingresso 3": ["sand - sand"],
  },
  "Usi Tehnice Reversibile": {
    "Set usa multifunctionala": ["RAL 9010"],
  },
  "Prefinisat Alb": {
    "Filomuro deschidere interior/exterior": ["prefinisat", "aluminiu"],
  },
  "INNOVA": {
    "3D":     ["alb", "carpen", "nuc", "stejar riviera", "stejar pastel", "wenge alb", "stejar gotic", "halifax", "silver oak", "attick wood", "bergan", "kasmir"],
    "LAMINAT":["alb", "carpen", "nuc", "stejar riviera", "stejar pastel", "wenge alb", "stejar gotic", "halifax", "silver oak", "attick wood", "bergan", "kasmir"],
  },
};

export const DESCHIDERI = ["Stanga", "Dreapta"];

// Standard door leaf widths (mm)
export const DIM_LATIMI = ["600", "700", "800", "900", "1000"];
// Standard door leaf heights (mm)
export const DIM_INALTIMI = ["2000", "2100"];

export const ERKADO_REGLAJ: { range: string; priceEur: number }[] = [
  { range: "80 - 100",   priceEur: 204 },
  { range: "100 - 120",  priceEur: 206 },
  { range: "120 - 140",  priceEur: 212 },
  { range: "140 - 160",  priceEur: 217 },
  { range: "160 - 180",  priceEur: 227 },
  { range: "180 - 200",  priceEur: 229 },
  { range: "200 - 220",  priceEur: 235 },
  { range: "220 - 240",  priceEur: 240 },
  { range: "240 - 260",  priceEur: 246 },
  { range: "260 - 280",  priceEur: 252 },
  { range: "280 - 300",  priceEur: 263 },
  { range: "300 - 340",  priceEur: 269 },
  { range: "340 - 360",  priceEur: 290 },
  { range: "360 - 380",  priceEur: 296 },
  { range: "380 - 400",  priceEur: 308 },
  { range: "400 - 420",  priceEur: 314 },
];

export const ERKADO_COLLECTIONS = ["CPL", "Premium", "Greko"];
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
