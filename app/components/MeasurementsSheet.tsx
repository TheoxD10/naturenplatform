"use client";

import { useEffect, useState } from "react";
import { getOrders, patchDoor, deleteOrder, type SavedOrder, type DoorLineItem } from "../lib/offerStore";
import {
  DIM_LATIMI,
  DIM_INALTIMI,
  DIM_GROSIMI_PERETE,
  DIM_REGLAJ_TOC,
  DIM_SCURARE,
  CULORI_USA,
  DESCHIDERI,
  TIP_BROASCA,
  UMPLERE,
} from "../data/constants";

// ── Editable cell components ──────────────────────────────────────────────────

function CellSelect({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-slate-200 rounded-lg bg-white text-slate-800 text-sm px-2 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer"
    >
      <option value="">—</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function CellInput({ value, onChange, placeholder = "—", wide }: { value: string; onChange: (v: string) => void; placeholder?: string; wide?: boolean }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`border border-slate-200 rounded-lg bg-white text-slate-800 text-sm px-2 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-full ${wide ? "text-left" : "text-center"}`}
    />
  );
}

// ── Table header ──────────────────────────────────────────────────────────────

function Th({ children, rowSpan, colSpan, width }: { children: React.ReactNode; rowSpan?: number; colSpan?: number; width?: string }) {
  return (
    <th
      rowSpan={rowSpan}
      colSpan={colSpan}
      style={width ? { minWidth: width } : undefined}
      className="border border-slate-400 bg-[#1A2E4A] text-white px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
    >
      {children}
    </th>
  );
}

// ── Door row ──────────────────────────────────────────────────────────────────

function DoorRow({ door, index, onChange }: { door: DoorLineItem; index: number; onChange: (field: keyof DoorLineItem, val: string) => void }) {
  return (
    <tr className="hover:bg-blue-50/20 transition-colors">
      {/* Model ușă — read-only */}
      <td className="border border-slate-200 px-4 py-3 align-top" style={{ minWidth: 200 }}>
        <div className="space-y-0.5">
          <div className="text-xs text-slate-400">#{index + 1}</div>
          <div className="text-sm font-bold text-slate-800">{door.finisaj}</div>
          {door.colectie && <div className="text-sm text-slate-500">{door.colectie}</div>}
          <div className="text-sm font-semibold text-slate-700">{door.model}</div>
          {door.addToc && door.tocModel && (
            <div className="text-xs text-blue-500 mt-0.5">Toc {door.tocFinisaj} {door.tocModel}</div>
          )}
        </div>
      </td>

      {/* Culoare */}
      <td className="border border-slate-200 px-2 py-2" style={{ minWidth: 140 }}>
        <CellSelect value={door.culoare} options={CULORI_USA} onChange={(v) => onChange("culoare", v)} />
      </td>

      {/* Deschidere */}
      <td className="border border-slate-200 px-2 py-2" style={{ minWidth: 110 }}>
        <CellSelect value={door.deschidere} options={DESCHIDERI} onChange={(v) => onChange("deschidere", v)} />
      </td>

      {/* Dim ușă */}
      <td className="border border-slate-200 px-2 py-2" style={{ minWidth: 100 }}>
        <CellSelect value={door.dimUsa} options={DIM_LATIMI} onChange={(v) => onChange("dimUsa", v)} />
      </td>

      {/* Gol inițial – Lățime */}
      <td className="border border-slate-200 px-2 py-2" style={{ minWidth: 100 }}>
        <CellInput value={door.golInitialLatime} onChange={(v) => onChange("golInitialLatime", v)} placeholder="mm" />
      </td>

      {/* Gol inițial – Înălțime */}
      <td className="border border-slate-200 px-2 py-2" style={{ minWidth: 100 }}>
        <CellSelect value={door.golInitialInaltime} options={DIM_INALTIMI} onChange={(v) => onChange("golInitialInaltime", v)} />
      </td>

      {/* Grosime perete */}
      <td className="border border-slate-200 px-2 py-2" style={{ minWidth: 110 }}>
        <CellSelect value={door.grosimePerete} options={DIM_GROSIMI_PERETE} onChange={(v) => onChange("grosimePerete", v)} />
      </td>

      {/* Reglaj toc */}
      <td className="border border-slate-200 px-2 py-2" style={{ minWidth: 120 }}>
        <CellSelect value={door.reglajToc} options={DIM_REGLAJ_TOC} onChange={(v) => onChange("reglajToc", v)} />
      </td>

      {/* Gol finisit – Lățime */}
      <td className="border border-slate-200 px-2 py-2" style={{ minWidth: 100 }}>
        <CellInput value={door.golFinisatLatime} onChange={(v) => onChange("golFinisatLatime", v)} placeholder="mm" />
      </td>

      {/* Gol finisit – Înălțime */}
      <td className="border border-slate-200 px-2 py-2" style={{ minWidth: 100 }}>
        <CellInput value={door.golFinisatInaltime} onChange={(v) => onChange("golFinisatInaltime", v)} placeholder="mm" />
      </td>

      {/* Scurtare */}
      <td className="border border-slate-200 px-2 py-2" style={{ minWidth: 100 }}>
        <CellSelect value={door.scurtare} options={DIM_SCURARE} onChange={(v) => onChange("scurtare", v)} />
      </td>

      {/* Tip broască */}
      <td className="border border-slate-200 px-2 py-2" style={{ minWidth: 130 }}>
        <CellSelect value={door.tipBroasca} options={TIP_BROASCA} onChange={(v) => onChange("tipBroasca", v)} />
      </td>

      {/* Umplere */}
      <td className="border border-slate-200 px-2 py-2" style={{ minWidth: 140 }}>
        <CellSelect value={door.umplere} options={UMPLERE} onChange={(v) => onChange("umplere", v)} />
      </td>

      {/* Observații */}
      <td className="border border-slate-200 px-2 py-2" style={{ minWidth: 180 }}>
        <CellInput value={door.observatii} onChange={(v) => onChange("observatii", v)} placeholder="observații…" wide />
      </td>
    </tr>
  );
}

// ── Order detail view ─────────────────────────────────────────────────────────

function OrderDetail({
  order,
  onBack,
  onChange,
}: {
  order: SavedOrder;
  onBack: () => void;
  onChange: (doorId: string, field: keyof DoorLineItem, val: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
          >
            ← Înapoi
          </button>
          <span className="text-slate-300">|</span>
          <span className="text-sm font-bold text-[#1A2E4A]">Ofertă #{order.offerNumber}</span>
          {order.buyerName && <span className="text-sm text-slate-600">— {order.buyerName}</span>}
          {order.buyerPhone && <span className="text-sm text-slate-400">{order.buyerPhone}</span>}
          <span className="text-xs text-slate-400">{order.offerDate}</span>
        </div>
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-[#1A2E4A] hover:bg-[#243d61] text-white text-sm font-semibold px-5 py-2.5 transition shadow-sm"
        >
          🖨 Printează fișa
        </button>
      </div>

      {/* Print-only header */}
      <div className="hidden print:block mb-4">
        <h2 className="text-lg font-bold">Fișa Măsurători — Ofertă #{order.offerNumber}</h2>
        {order.buyerName && <p className="text-sm">Client: {order.buyerName} {order.buyerPhone}</p>}
        <p className="text-sm">Data: {order.offerDate}</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="border-collapse w-full">
          <thead>
            <tr>
              <Th rowSpan={2} width="200px">Model ușă</Th>
              <Th rowSpan={2} width="140px">Culoare</Th>
              <Th rowSpan={2} width="110px">Deschidere</Th>
              <Th rowSpan={2} width="100px">Dim.<br />ușă (mm)</Th>
              <Th colSpan={2}>Gol inițial</Th>
              <Th rowSpan={2} width="110px">Grosime<br />perete (mm)</Th>
              <Th rowSpan={2} width="120px">Reglaj<br />toc (mm)</Th>
              <Th colSpan={2}>Gol finisit necesar</Th>
              <Th rowSpan={2} width="100px">Scurtare<br />(mm)</Th>
              <Th rowSpan={2} width="130px">Tip broască</Th>
              <Th rowSpan={2} width="140px">Umplere</Th>
              <Th rowSpan={2} width="180px">Observații</Th>
            </tr>
            <tr>
              <Th width="100px">Lățime (mm)</Th>
              <Th width="100px">Înălțime (mm)</Th>
              <Th width="100px">Lățime (mm)</Th>
              <Th width="100px">Înălțime (mm)</Th>
            </tr>
          </thead>
          <tbody>
            {order.doors.map((door, i) => (
              <DoorRow
                key={door.id}
                door={door}
                index={i}
                onChange={(field, val) => onChange(door.id, field, val)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400 print:hidden">Modificările se salvează automat.</p>
    </div>
  );
}

// ── Orders list view ──────────────────────────────────────────────────────────

function OrdersList({
  orders,
  onSelect,
  onDelete,
}: {
  orders: SavedOrder[];
  onSelect: (order: SavedOrder) => void;
  onDelete: (id: string) => void;
}) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
        <span className="text-5xl">📋</span>
        <p className="font-medium text-base">Nu există oferte salvate.</p>
        <p className="text-sm text-center">Generează o ofertă în tab-ul Configurator — va apărea automat aici.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      <p className="text-sm text-slate-500 mb-4">
        {orders.length} {orders.length === 1 ? "ofertă salvată" : "oferte salvate"} — selectează una pentru a completa măsurătorile
      </p>
      {orders.map((order) => {
        const filled = order.doors.filter((d) => d.dimUsa || d.golInitialLatime).length;
        const total = order.doors.length;
        return (
          <div
            key={order.id}
            className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-blue-300 transition cursor-pointer"
            onClick={() => onSelect(order)}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#1A2E4A] flex items-center justify-center text-white text-lg shrink-0">
                  📋
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">Ofertă #{order.offerNumber}</span>
                    <span className="text-slate-400 text-sm">{order.offerDate}</span>
                  </div>
                  {order.buyerName && (
                    <div className="text-sm text-slate-600">{order.buyerName}{order.buyerPhone && ` · ${order.buyerPhone}`}</div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {order.doors.map((d, i) => (
                      <span key={d.id} className="text-xs bg-slate-100 text-slate-500 rounded px-2 py-0.5">
                        #{i + 1} {d.finisaj} {d.model}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 ml-4 shrink-0">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Completat</div>
                  <div className={`text-sm font-bold ${filled === total ? "text-emerald-600" : "text-amber-500"}`}>
                    {filled}/{total} uși
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelect(order); }}
                    className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 transition"
                  >
                    Deschide →
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(order.id); }}
                    className="text-red-300 hover:text-red-600 text-lg leading-none px-1"
                    title="Șterge"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────

export default function MeasurementsSheet() {
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [selected, setSelected] = useState<SavedOrder | null>(null);

  function reload() { setOrders(getOrders()); }

  useEffect(() => {
    reload();
    const onFocus = () => reload();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Keep selected in sync with store
  useEffect(() => {
    if (selected) {
      const fresh = orders.find((o) => o.id === selected.id);
      if (fresh) setSelected(fresh);
    }
  }, [orders]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(orderId: string, doorId: string, field: keyof DoorLineItem, val: string) {
    patchDoor(orderId, doorId, { [field]: val } as Partial<DoorLineItem>);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, doors: o.doors.map((d) => (d.id === doorId ? { ...d, [field]: val } : d)) }
          : o
      )
    );
  }

  function handleDelete(id: string) {
    if (!confirm("Ștergi această ofertă din fișa de măsurători?")) return;
    deleteOrder(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  if (selected) {
    return (
      <OrderDetail
        order={selected}
        onBack={() => setSelected(null)}
        onChange={(doorId, field, val) => handleChange(selected.id, doorId, field, val)}
      />
    );
  }

  return (
    <OrdersList
      orders={orders}
      onSelect={setSelected}
      onDelete={handleDelete}
    />
  );
}
