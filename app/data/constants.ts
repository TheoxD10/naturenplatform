export const FINISAJ_ORDER = [
  "FI3D", "Vopsit", "CPL", "GREKO", "Premium", "VOPSIT UV",
  "Vopsit Pulbere", "Sticla Graf", "Sistem ascuns", "Finisaj PVC",
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
    "Aristo":       ["Stejar Gotic", "Carpen", "Nuc", "Alb", "Kasmir", "Stejar Riviera", "Stejar Pastel", "Wenge Alb", "Halifax"],
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
    "Cara Line":    ["Stejar Riviera"],
    "Tea Line":     ["Alb"],
    "Disano Line":  ["Kasmir"],
    "Lisbon Line":  ["Alb"],
    "Grasso Line":  ["Alb"],
    "Nola Line":    ["Wenge Alb"],
    "Vienna Line":  ["Alb"],
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
    "Surmia":       ["Wenge Dark St Cpl", "Stejar St Cpl", "Stejar Grist St Cpl", "Antracita St Cpl", "Negru St Cpl", "Verde Inchis St Cpl", "Bleumarin St Cpl", "Alb St Cpl", "Gri Deschis St Cpl", "Cenusiu St Cpl", "Cappuccino St Cpl", "Salvie St Cpl", "Piatra Gri St Cpl"],
    "Amarylis Line": ["Alb St Cpl"],
    "Peonia Line":   ["Cappuccino St Cpl"],
    "Nemezja Line":  ["Gri Deschis St Cpl"],
    "Hiacynt Line":  ["White"],
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
    "Sorano":      ["Nuc Greko", "Stejar Mediu Greko", "Stejar Auriu Greko", "Sonoma Greko", "Salcam Deschis Greko", "Stejar Gri Greko", "Alb Greko", "Alb Ca Zapada Greko"],
    "Nemezja Line": ["Alb Greko"],
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
    "Uno":           ["Stejar Premium", "Stejar Natur Premium", "Stejar Natur Transversal Premium", "Frasin Grafit Premium", "Nuc Classic Premium", "Beton Premium", "Artar Gri Premium", "Scoarta Alba Premium", "Alb Premium"],
    "Laurencja Line": ["Alb Premium", "Sticla Neagra"],
  },
  "Delight": {
    "Delight":      ["Nuc", "Alb", "Kasmir", "Stejar Riviera", "Wenge Alb", "Stejar Pastel", "Silver Oak", "Stejar Sesil"],
    "Delight Line": ["Sticla Transparenta", "Sticla Sablat"],
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
  "Sistem ascuns": {
    "Filomuro": ["prefinisat", "aluminiu"],
  },
  "INNOVA": {
    "3D":     ["alb", "carpen", "nuc", "stejar riviera", "stejar pastel", "wenge alb", "stejar gotic", "halifax", "silver oak", "attick wood", "bergan", "kasmir"],
    "LAMINAT":["alb", "carpen", "nuc", "stejar riviera", "stejar pastel", "wenge alb", "stejar gotic", "halifax", "silver oak", "attick wood", "bergan", "kasmir"],
  },
};

export const DESCHIDERI = ["Stanga", "Dreapta"];

export const STANDARD_OPTIONS = ["Standard Polonez", "Standard Ceh", "P2112"] as const;
export type StandardOption = typeof STANDARD_OPTIONS[number];

export const USA_DUBLA_TYPES = [
  "Foi Ușă Dublă",
  "Foi Ușă Debară",
  "Glisantă Simplă (max 900mm)",
  "Glisantă Dublă (max 1800mm)",
] as const;
export type UsaDublaType = typeof USA_DUBLA_TYPES[number];

export const TOC_VARIANTE = [
  "Standard",
  "Dublu (×2)",
  "Debară Reglabil (×1.5)",
  "Debară Fix (×2)",
  "Tunel Reglabil Drept (+11 EUR)",
  "Tunel Dublu Regl. Drept (×2, +22 EUR)",
] as const;
export type TocVarianta = typeof TOC_VARIANTE[number];

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

export const ERKADO_TOC_TUNEL_FINISAJE = ["GREKO", "CPL/PREMIUM", "CPL 0.2", "LACUIT"] as const;
export type ErkadoTocTunelFinisaj = typeof ERKADO_TOC_TUNEL_FINISAJE[number];

// Toc tunel Erkado + Toc reglabil cu falt (same price table)
export const ERKADO_TOC_TUNEL: { range: string; GREKO: number; "CPL/PREMIUM": number; "CPL 0.2": number; LACUIT: number }[] = [
  { range: "65 - 80",   GREKO: 122, "CPL/PREMIUM": 135, "CPL 0.2": 148, LACUIT: 228 },
  { range: "80 - 100",  GREKO: 122, "CPL/PREMIUM": 135, "CPL 0.2": 148, LACUIT: 228 },
  { range: "100 - 120", GREKO: 125, "CPL/PREMIUM": 137, "CPL 0.2": 151, LACUIT: 238 },
  { range: "120 - 140", GREKO: 129, "CPL/PREMIUM": 142, "CPL 0.2": 155, LACUIT: 246 },
  { range: "140 - 160", GREKO: 135, "CPL/PREMIUM": 147, "CPL 0.2": 161, LACUIT: 255 },
  { range: "160 - 180", GREKO: 141, "CPL/PREMIUM": 154, "CPL 0.2": 168, LACUIT: 265 },
  { range: "180 - 200", GREKO: 144, "CPL/PREMIUM": 156, "CPL 0.2": 170, LACUIT: 274 },
  { range: "200 - 220", GREKO: 149, "CPL/PREMIUM": 162, "CPL 0.2": 175, LACUIT: 282 },
  { range: "220 - 240", GREKO: 154, "CPL/PREMIUM": 167, "CPL 0.2": 180, LACUIT: 292 },
  { range: "240 - 260", GREKO: 159, "CPL/PREMIUM": 171, "CPL 0.2": 186, LACUIT: 301 },
  { range: "260 - 280", GREKO: 164, "CPL/PREMIUM": 176, "CPL 0.2": 190, LACUIT: 310 },
  { range: "280 - 300", GREKO: 173, "CPL/PREMIUM": 187, "CPL 0.2": 200, LACUIT: 331 },
  { range: "300 - 340", GREKO: 178, "CPL/PREMIUM": 191, "CPL 0.2": 204, LACUIT: 342 },
  { range: "340 - 360", GREKO: 196, "CPL/PREMIUM": 208, "CPL 0.2": 222, LACUIT: 353 },
  { range: "360 - 380", GREKO: 201, "CPL/PREMIUM": 214, "CPL 0.2": 227, LACUIT: 359 },
  { range: "380 - 400", GREKO: 211, "CPL/PREMIUM": 223, "CPL 0.2": 237, LACUIT: 372 },
  { range: "400 - 420", GREKO: 216, "CPL/PREMIUM": 228, "CPL 0.2": 242, LACUIT: 387 },
];

// Toc reglabil cu falt — same price table as Toc tunel Erkado
export const ERKADO_TOC_CU_FALT = ERKADO_TOC_TUNEL;

// Toc reglabil fara falt Erkado
export const ERKADO_TOC_FARA_FALT: { range: string; GREKO: number; "CPL/PREMIUM": number; "CPL 0.2": number; LACUIT: number }[] = [
  { range: "80 - 95",   GREKO: 250, "CPL/PREMIUM": 266, "CPL 0.2": 279, LACUIT: 351 },
  { range: "95 - 115",  GREKO: 250, "CPL/PREMIUM": 266, "CPL 0.2": 279, LACUIT: 351 },
  { range: "115 - 135", GREKO: 250, "CPL/PREMIUM": 266, "CPL 0.2": 279, LACUIT: 351 },
  { range: "135 - 155", GREKO: 262, "CPL/PREMIUM": 277, "CPL 0.2": 291, LACUIT: 369 },
  { range: "155 - 175", GREKO: 262, "CPL/PREMIUM": 277, "CPL 0.2": 291, LACUIT: 369 },
  { range: "175 - 195", GREKO: 262, "CPL/PREMIUM": 277, "CPL 0.2": 291, LACUIT: 369 },
  { range: "195 - 215", GREKO: 269, "CPL/PREMIUM": 283, "CPL 0.2": 297, LACUIT: 387 },
  { range: "215 - 235", GREKO: 269, "CPL/PREMIUM": 283, "CPL 0.2": 297, LACUIT: 387 },
  { range: "235 - 255", GREKO: 269, "CPL/PREMIUM": 283, "CPL 0.2": 297, LACUIT: 387 },
  { range: "255 - 275", GREKO: 275, "CPL/PREMIUM": 291, "CPL 0.2": 304, LACUIT: 405 },
  { range: "275 - 295", GREKO: 275, "CPL/PREMIUM": 291, "CPL 0.2": 304, LACUIT: 405 },
  { range: "295 - 315", GREKO: 285, "CPL/PREMIUM": 300, "CPL 0.2": 314, LACUIT: 414 },
  { range: "315 - 355", GREKO: 297, "CPL/PREMIUM": 312, "CPL 0.2": 326, LACUIT: 427 },
  { range: "355 - 375", GREKO: 325, "CPL/PREMIUM": 341, "CPL 0.2": 354, LACUIT: 451 },
  { range: "375 - 395", GREKO: 340, "CPL/PREMIUM": 354, "CPL 0.2": 369, LACUIT: 468 },
  { range: "395 - 415", GREKO: 340, "CPL/PREMIUM": 354, "CPL 0.2": 369, LACUIT: 468 },
];

// Toc cu reversie Erkado (3 columns)
export const ERKADO_TOC_REVERSIE_FINISAJE = ["GREKO", "CPL ST/PREMIUM", "LACUITE"] as const;
export type ErkadoTocRevesieFinisaj = typeof ERKADO_TOC_REVERSIE_FINISAJE[number];
export const ERKADO_TOC_REVERSIE: { range: string; GREKO: number; "CPL ST/PREMIUM": number; LACUITE: number }[] = [
  { range: "75 - 95",   GREKO: 361, "CPL ST/PREMIUM": 377, LACUITE: 475 },
  { range: "95 - 115",  GREKO: 361, "CPL ST/PREMIUM": 377, LACUITE: 475 },
  { range: "115 - 135", GREKO: 361, "CPL ST/PREMIUM": 377, LACUITE: 475 },
  { range: "135 - 155", GREKO: 373, "CPL ST/PREMIUM": 387, LACUITE: 493 },
  { range: "155 - 175", GREKO: 373, "CPL ST/PREMIUM": 387, LACUITE: 493 },
  { range: "175 - 195", GREKO: 373, "CPL ST/PREMIUM": 387, LACUITE: 493 },
  { range: "195 - 215", GREKO: 379, "CPL ST/PREMIUM": 396, LACUITE: 513 },
  { range: "215 - 235", GREKO: 379, "CPL ST/PREMIUM": 396, LACUITE: 513 },
  { range: "235 - 255", GREKO: 386, "CPL ST/PREMIUM": 403, LACUITE: 532 },
  { range: "255 - 295", GREKO: 412, "CPL ST/PREMIUM": 428, LACUITE: 560 },
  { range: "295 - 315", GREKO: 412, "CPL ST/PREMIUM": 428, LACUITE: 560 },
  { range: "315 - 335", GREKO: 437, "CPL ST/PREMIUM": 453, LACUITE: 580 },
  { range: "335 - 355", GREKO: 437, "CPL ST/PREMIUM": 453, LACUITE: 580 },
];

// Toc reglabil suprapunere Erkado (2 columns)
export const ERKADO_TOC_SUPRAPUNERE_FINISAJE = ["GREKO", "CPL ST/PREMIUM"] as const;
export type ErkadoTocSuprapunereFinisaj = typeof ERKADO_TOC_SUPRAPUNERE_FINISAJE[number];
export const ERKADO_TOC_SUPRAPUNERE: { range: string; GREKO: number; "CPL ST/PREMIUM": number }[] = [
  { range: "80 - 100",  GREKO: 162, "CPL ST/PREMIUM": 188 },
  { range: "100 - 120", GREKO: 167, "CPL ST/PREMIUM": 192 },
  { range: "120 - 140", GREKO: 173, "CPL ST/PREMIUM": 200 },
  { range: "140 - 160", GREKO: 182, "CPL ST/PREMIUM": 210 },
  { range: "160 - 180", GREKO: 192, "CPL ST/PREMIUM": 219 },
  { range: "180 - 200", GREKO: 206, "CPL ST/PREMIUM": 233 },
  { range: "200 - 220", GREKO: 221, "CPL ST/PREMIUM": 247 },
  { range: "220 - 240", GREKO: 230, "CPL ST/PREMIUM": 257 },
  { range: "240 - 260", GREKO: 240, "CPL ST/PREMIUM": 267 },
  { range: "260 - 280", GREKO: 250, "CPL ST/PREMIUM": 276 },
  { range: "280 - 300", GREKO: 258, "CPL ST/PREMIUM": 285 },
  { range: "300 - 320", GREKO: 269, "CPL ST/PREMIUM": 296 },
  { range: "320 - 340", GREKO: 278, "CPL ST/PREMIUM": 305 },
  { range: "340 - 360", GREKO: 288, "CPL ST/PREMIUM": 315 },
  { range: "360 - 380", GREKO: 298, "CPL ST/PREMIUM": 324 },
  { range: "380 - 400", GREKO: 311, "CPL ST/PREMIUM": 338 },
  { range: "400 - 420", GREKO: 326, "CPL ST/PREMIUM": 353 },
  { range: "420 - 440", GREKO: 341, "CPL ST/PREMIUM": 367 },
];

// Tocuri metalice Erkado (single price, no finisaj selection)
export const ERKADO_TOC_METALIC: { range: string; price: number }[] = [
  { range: "95 - 125",  price: 409 },
  { range: "125 - 155", price: 434 },
  { range: "155 - 185", price: 470 },
  { range: "185 - 215", price: 506 },
  { range: "215 - 245", price: 542 },
  { range: "245 - 275", price: 579 },
  { range: "275 - 305", price: 628 },
];

// All special Erkado-only toc types (not Toc tunel which has brand selector)
export const ERKADO_SPECIAL_TOC_TYPES = [
  "Toc reglabil cu falt",
  "Toc reglabil fara falt",
  "Toc cu reversie",
  "Toc reglabil suprapunere",
  "Toc metalic",
] as const;
export type ErkadoSpecialTocType = typeof ERKADO_SPECIAL_TOC_TYPES[number];

export function getErkadoSpecialTocRanges(tipToc: string): string[] {
  if (tipToc === "Toc reglabil cu falt") return ERKADO_TOC_CU_FALT.map(e => e.range);
  if (tipToc === "Toc reglabil fara falt") return ERKADO_TOC_FARA_FALT.map(e => e.range);
  if (tipToc === "Toc cu reversie") return ERKADO_TOC_REVERSIE.map(e => e.range);
  if (tipToc === "Toc reglabil suprapunere") return ERKADO_TOC_SUPRAPUNERE.map(e => e.range);
  if (tipToc === "Toc metalic") return ERKADO_TOC_METALIC.map(e => e.range);
  return [];
}

export function getErkadoSpecialTocFinisaje(tipToc: string): string[] {
  if (tipToc === "Toc reglabil cu falt" || tipToc === "Toc reglabil fara falt")
    return [...ERKADO_TOC_TUNEL_FINISAJE];
  if (tipToc === "Toc cu reversie") return [...ERKADO_TOC_REVERSIE_FINISAJE];
  if (tipToc === "Toc reglabil suprapunere") return [...ERKADO_TOC_SUPRAPUNERE_FINISAJE];
  return []; // Toc metalic has no finisaj
}

export function getErkadoSpecialTocPrice(tipToc: string, range: string, finisaj: string): number | null {
  if (tipToc === "Toc reglabil cu falt") {
    const e = ERKADO_TOC_CU_FALT.find(r => r.range === range);
    return e ? (e[finisaj as keyof typeof e] as number ?? null) : null;
  }
  if (tipToc === "Toc reglabil fara falt") {
    const e = ERKADO_TOC_FARA_FALT.find(r => r.range === range);
    return e ? (e[finisaj as keyof typeof e] as number ?? null) : null;
  }
  if (tipToc === "Toc cu reversie") {
    const e = ERKADO_TOC_REVERSIE.find(r => r.range === range);
    return e ? (e[finisaj as keyof typeof e] as number ?? null) : null;
  }
  if (tipToc === "Toc reglabil suprapunere") {
    const e = ERKADO_TOC_SUPRAPUNERE.find(r => r.range === range);
    return e ? (e[finisaj as keyof typeof e] as number ?? null) : null;
  }
  if (tipToc === "Toc metalic") {
    const e = ERKADO_TOC_METALIC.find(r => r.range === range);
    return e ? e.price : null;
  }
  return null;
}

export function getErkadoSpecialTocRangePrices(tipToc: string, finisaj: string): Record<string, number | null> {
  return Object.fromEntries(
    getErkadoSpecialTocRanges(tipToc).map(r => [r, getErkadoSpecialTocPrice(tipToc, r, finisaj)])
  );
}

export function getErkadoSpecialTocFinisajPrices(tipToc: string, range: string): Record<string, number | null> {
  return Object.fromEntries(
    getErkadoSpecialTocFinisaje(tipToc).map(f => [f, getErkadoSpecialTocPrice(tipToc, range, f)])
  );
}
// Standard wall thicknesses (mm)
export const DIM_GROSIMI_PERETE = ["100", "115", "120", "125", "150", "175", "200", "250", "300", "350"];
// Reglaj toc ranges based on wall thickness
export const DIM_REGLAJ_TOC = ["60-80", "80-100", "100-130", "130-160", "160-200", "200-250", "250-300", "300-350"];
// Pervaz options
export const DIM_PERVAZ_OPTS = ["Fara pervaz", "Pervaz 40mm", "Pervaz 60mm", "Pervaz 80mm", "Pervaz 100mm"];
// Scurare (undercutting) options mm
export const DIM_SCURARE = ["5", "8", "10", "12", "15", "20"];

export const TIP_BROASCA = ["Simpla", "WC", "Magnetica", "Cilindru", "Yale", "Fara broasca"];

// Hardware spec options (FI3D and named-model catalog)
export const BROASCA_TIPURI_HW = ["Broasca cheie", "Broasca WC", "Broasca cilindru"];
export const BROASCA_DIMENSIUNI = ["Dimensiune 1", "Dimensiune 2", "Dimensiune 3", "Dimensiune 4", "Dimensiune 5"];
export const BROASCA_CULORI_HW = ["Argintiu", "Negru"];
export const BAL_DIMENSIUNI = ["Dimensiune 1", "Dimensiune 2", "Dimensiune 3", "Dimensiune 4", "Dimensiune 5"];

// Models that always use 3 balamale (override FI3D default of 2)
export const MODELE_3_BALAMALE = new Set([
  "Nola Line", "Cara Line", "Tea Line", "Grasso Line", "Lisbon Line",
  "Amarylis Line", "Peonia Line", "Nemezja Line", "Laurencja Line",
]);
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
