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
  // Common
  obs: string;
  tocPrice: number;
  costVars?: string[];
  costCustomPrices?: Record<string, number>;
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
  usaObs: string;
  usaPrice: number;
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
    finisaj: "", colectie: "", model: "", culoare: "", deschidere: "", usaObs: "", usaPrice: 0,
    addToc: false, tocFinisaj: "", tocColectie: "", tocModel: "", tocObs: "", tocPrice: 0,
    nrBal: "", balMod: "", balCol: "", balDim: "", ferPrice: 0,
    broascaTip: "Broasca cheie", broascaDim: "", broascaCuloare: "Argintiu",
    manMod: "", manTip: "", manCol: "", manPrice: 0,
    costVars: [],
    dimUsa: "",
    golInitialLatime: "", golInitialInaltime: "",
    grosimePerete: "", reglajToc: "",
    golFinisatLatime: "", golFinisatInaltime: "",
    scurtare: "", tipBroasca: "", umplere: "", observatii: "",
  };
}
