export interface MontajEntry {
  name: string;
  qty: number;
  priceRon: number;
}

export interface TocLineItem {
  id: string;
  brand: "naturen" | "erkado";
  // Naturen flow
  tocFinisaj: string;
  tocColectie: string;
  tocModel: string;
  // Erkado flow
  erkadoRange: string;
  erkadoCollection: string;
  // Toc tunel specific
  faraFalt?: boolean;
  tunelBrand?: "naturen" | "erkado";
  tunelReglaj?: string;
  tunelFinisaj?: string;
  isDubla?: boolean;
  // Varianta (Dublu, Debara, Tunel Drept, etc.)
  tocVarianta?: string;
  // Standard (Standard Polonez / Ceh / P2112)
  standard?: string;
  // Pervaz fix (only for Toc fix 90mm)
  pervazFixBrand?: "erkado" | "naturen";
  pervazFixType?: string;
  pervazFixPrice?: number;
  // Common
  obs: string;
  tocPrice: number;
  costVars?: string[];
  costCustomPrices?: Record<string, number>;
  montaj?: MontajEntry[];
  qty: number;
  totalEur: number;
}

export interface DoorLineItem {
  id: string;
  // Door
  finisaj: string;
  colectie: string;
  model: string;
  culoare: string;
  deschidere: string;
  standard?: string; // "Standard Polonez" | "Standard Ceh" | "P2112"
  usaObs: string;
  usaPrice: number;
  // Usa dubla
  usaDubla?: boolean;
  usaDublaBrand?: "naturen" | "erkado";
  tipUsaDubla?: string;
  glisantaInchidere?: "carlig" | "fara";
  glisantaProfilOpt?: boolean;
  glisantaTocPret?: string;
  // Toc
  addToc: boolean;
  tocFinisaj: string;
  tocColectie: string;
  tocModel: string;
  tocObs: string;
  tocPrice: number;
  // Hardware
  nrBal: string;
  balMod: string;
  balCol: string;
  balDim: string;
  ferPrice: number;
  // Broasca spec
  broascaTip: string;
  broascaDim: string;
  broascaCuloare: string;
  manMod: string;
  manTip: string;
  manCol: string;
  manPrice: number;
  // Extra costs
  costVars: string[];
  costCustomPrices?: Record<string, number>;
  // Atipic door
  isAtipic?: boolean;
  atipicDesc?: string;
  // Montaj entries (in RON)
  montaj?: MontajEntry[];
  totalEur: number;
  qty?: number;
  // Measurements (filled in Fișa Măsurători)
  dimUsa: string;
  golInitialLatime: string;
  golInitialInaltime: string;
  grosimePerete: string;
  reglajToc: string;
  golFinisatLatime: string;
  golFinisatInaltime: string;
  scurtare: string;
  tipBroasca: string;
  umplere: string;
  observatii: string;
}

export interface SavedOrder {
  id: string;
  savedAt: string;
  offerNumber: string;
  offerDate: string;
  buyerName: string;
  buyerPhone: string;
  doors: DoorLineItem[];
  tocs?: TocLineItem[];
}

const KEY = "naturen_orders_v2";

export function getOrders(): SavedOrder[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

export function upsertOrder(order: SavedOrder): void {
  const list = getOrders();
  const i = list.findIndex((o) => o.id === order.id);
  if (i >= 0) list[i] = order; else list.unshift(order);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function patchDoor(orderId: string, doorId: string, patch: Partial<DoorLineItem>): void {
  const list = getOrders();
  const oi = list.findIndex((o) => o.id === orderId);
  if (oi < 0) return;
  const di = list[oi].doors.findIndex((d) => d.id === doorId);
  if (di < 0) return;
  list[oi].doors[di] = { ...list[oi].doors[di], ...patch };
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function deleteOrder(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(getOrders().filter((o) => o.id !== id)));
}

export function emptyDoor(): Omit<DoorLineItem, "id" | "totalEur"> {
  return {
    finisaj: "", colectie: "", model: "", culoare: "", deschidere: "",
    standard: "Standard Polonez", usaObs: "", usaPrice: 0,
    usaDubla: false, usaDublaBrand: undefined, tipUsaDubla: undefined,
    glisantaInchidere: undefined, glisantaProfilOpt: undefined, glisantaTocPret: undefined,
    addToc: false, tocFinisaj: "", tocColectie: "", tocModel: "", tocObs: "", tocPrice: 0,
    nrBal: "", balMod: "", balCol: "", balDim: "", ferPrice: 0,
    broascaTip: "Broasca cheie", broascaDim: "", broascaCuloare: "Argintiu",
    manMod: "", manTip: "", manCol: "", manPrice: 0,
    costVars: [],
    isAtipic: false, atipicDesc: "", montaj: [],
    dimUsa: "",
    golInitialLatime: "", golInitialInaltime: "",
    grosimePerete: "", reglajToc: "",
    golFinisatLatime: "", golFinisatInaltime: "",
    scurtare: "", tipBroasca: "", umplere: "", observatii: "",
  };
}
