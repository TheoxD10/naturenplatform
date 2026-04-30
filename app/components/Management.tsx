"use client";

import { useState, useEffect } from "react";
import { SavedOrder, getOrders, deleteOrder } from "../lib/offerStore";

type MgmtTab = "dashboard" | "clienti" | "oferte";

interface ClientSummary {
  name: string;
  phone: string;
  offerCount: number;
  totalEur: number;
  lastOffer: string;
}

function formatEur(n: number) {
  return n.toLocaleString("ro-RO", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
}

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString("ro-RO"); } catch { return "—"; }
}

function orderTotal(order: SavedOrder) {
  return order.doors.reduce((s, d) => s + d.totalEur, 0);
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0 select-none">
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

export default function Management() {
  const [tab, setTab] = useState<MgmtTab>("dashboard");
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const refresh = () => setOrders(getOrders());
  useEffect(() => { refresh(); }, []);

  const totalValue = orders.reduce((s, o) => s + orderTotal(o), 0);
  const avgValue = orders.length ? totalValue / orders.length : 0;

  const clientMap = new Map<string, ClientSummary>();
  orders.forEach((o) => {
    const total = orderTotal(o);
    const key = o.buyerName || "—";
    const ex = clientMap.get(key);
    if (ex) {
      ex.offerCount++;
      ex.totalEur += total;
      if (o.savedAt > ex.lastOffer) ex.lastOffer = o.savedAt;
    } else {
      clientMap.set(key, { name: key, phone: o.buyerPhone || "—", offerCount: 1, totalEur: total, lastOffer: o.savedAt });
    }
  });
  const clients = Array.from(clientMap.values()).sort((a, b) => b.totalEur - a.totalEur);

  const sl = search.toLowerCase();
  const filteredOrders = orders.filter(
    (o) => !search || o.buyerName?.toLowerCase().includes(sl) || o.offerNumber?.toLowerCase().includes(sl)
  );
  const filteredClients = clients.filter(
    (c) => !search || c.name.toLowerCase().includes(sl) || c.phone.includes(search)
  );

  const handleDelete = (id: string) => {
    if (confirm("Ștergi această ofertă definitiv?")) { deleteOrder(id); refresh(); }
  };

  const switchTab = (t: MgmtTab) => { setTab(t); setSearch(""); setSelectedClient(null); };

  const statCards = [
    { label: "Oferte totale", value: String(orders.length), icon: "📄", border: "border-blue-200", bg: "bg-blue-50", text: "text-blue-700" },
    { label: "Clienți unici", value: String(clients.length), icon: "👥", border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700" },
    { label: "Valoare totală", value: formatEur(totalValue), icon: "💶", border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-700" },
    { label: "Medie / ofertă", value: formatEur(avgValue), icon: "📈", border: "border-purple-200", bg: "bg-purple-50", text: "text-purple-700" },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 bg-white rounded-xl shadow-sm p-1 mb-6 w-fit border border-slate-200">
        {([ { id: "dashboard", label: "📊 Dashboard" }, { id: "clienti", label: "👥 Clienți" }, { id: "oferte", label: "📄 Oferte" } ] as { id: MgmtTab; label: string }[]).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => switchTab(id)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === id ? "bg-[#1A2E4A] text-white shadow" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD ── */}
      {tab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((s) => (
              <div key={s.label} className={`rounded-xl p-5 border shadow-sm ${s.bg} ${s.border}`}>
                <div className="text-2xl mb-3">{s.icon}</div>
                <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent offers */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-700">Oferte recente</h2>
                <span className="text-xs text-slate-400">{orders.length} total</span>
              </div>
              {orders.length === 0 ? (
                <p className="text-center text-slate-400 py-10 text-sm">Nicio ofertă salvată</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="text-left px-5 py-3">Nr. / Client</th>
                      <th className="text-right px-5 py-3">Uși</th>
                      <th className="text-right px-5 py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.slice(0, 6).map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3">
                          <p className="font-medium text-blue-600 text-xs">{o.offerNumber || "—"}</p>
                          <p className="text-slate-600">{o.buyerName || "—"}</p>
                          <p className="text-slate-400 text-xs">{formatDate(o.savedAt)}</p>
                        </td>
                        <td className="px-5 py-3 text-right text-slate-500">{o.doors.length}</td>
                        <td className="px-5 py-3 text-right font-semibold text-emerald-600">{formatEur(orderTotal(o))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Top clients */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-700">Top clienți</h2>
                <span className="text-xs text-slate-400">{clients.length} total</span>
              </div>
              {clients.length === 0 ? (
                <p className="text-center text-slate-400 py-10 text-sm">Niciun client înregistrat</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="text-left px-5 py-3">Client</th>
                      <th className="text-right px-5 py-3">Oferte</th>
                      <th className="text-right px-5 py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clients.slice(0, 6).map((c, i) => (
                      <tr key={c.name} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-300 font-medium w-4 text-xs">{i + 1}</span>
                            <Avatar name={c.name} />
                            <div>
                              <p className="font-medium text-slate-800">{c.name}</p>
                              <p className="text-slate-400 text-xs">{c.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right text-slate-500">{c.offerCount}</td>
                        <td className="px-5 py-3 text-right font-semibold text-emerald-600">{formatEur(c.totalEur)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CLIENȚI ── */}
      {tab === "clienti" && (
        <div className="space-y-4">
          {!selectedClient && (
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Caută după nume sau telefon..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 max-w-sm px-4 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <span className="text-slate-500 text-sm">{filteredClients.length} clienți</span>
            </div>
          )}

          {selectedClient ? (
            <div>
              <button
                onClick={() => setSelectedClient(null)}
                className="mb-4 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
              >
                ← Înapoi la clienți
              </button>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl">
                    {selectedClient.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 text-lg">{selectedClient}</h2>
                    <p className="text-slate-500 text-sm">{clientMap.get(selectedClient)?.phone}</p>
                  </div>
                  <div className="ml-auto flex gap-6 text-right">
                    <div>
                      <p className="text-xs text-slate-400">Oferte</p>
                      <p className="font-bold text-slate-700">{clientMap.get(selectedClient)?.offerCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Total valoare</p>
                      <p className="font-bold text-emerald-600">{formatEur(clientMap.get(selectedClient)?.totalEur ?? 0)}</p>
                    </div>
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="text-left px-5 py-3">Nr. ofertă</th>
                      <th className="text-left px-5 py-3">Data</th>
                      <th className="text-right px-5 py-3">Uși</th>
                      <th className="text-right px-5 py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.filter((o) => (o.buyerName || "—") === selectedClient).map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-medium text-blue-600">{o.offerNumber || "—"}</td>
                        <td className="px-5 py-3 text-slate-500">{formatDate(o.savedAt)}</td>
                        <td className="px-5 py-3 text-right text-slate-600">{o.doors.length}</td>
                        <td className="px-5 py-3 text-right font-semibold text-emerald-600">{formatEur(orderTotal(o))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {filteredClients.length === 0 ? (
                <p className="text-center text-slate-400 py-12 text-sm">
                  {search ? "Niciun client găsit" : "Niciun client înregistrat"}
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="text-left px-5 py-3">Client</th>
                      <th className="text-left px-5 py-3">Telefon</th>
                      <th className="text-right px-5 py-3">Oferte</th>
                      <th className="text-right px-5 py-3">Valoare totală</th>
                      <th className="text-right px-5 py-3">Ultima ofertă</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredClients.map((c) => (
                      <tr
                        key={c.name}
                        className="hover:bg-blue-50 cursor-pointer transition"
                        onClick={() => setSelectedClient(c.name)}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={c.name} />
                            <span className="font-medium text-slate-800">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-500">{c.phone}</td>
                        <td className="px-5 py-3 text-right text-slate-600">{c.offerCount}</td>
                        <td className="px-5 py-3 text-right font-semibold text-emerald-600">{formatEur(c.totalEur)}</td>
                        <td className="px-5 py-3 text-right text-slate-400">{formatDate(c.lastOffer)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── OFERTE ── */}
      {tab === "oferte" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Caută după client sau număr ofertă..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 max-w-sm px-4 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <span className="text-slate-500 text-sm">{filteredOrders.length} oferte</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {filteredOrders.length === 0 ? (
              <p className="text-center text-slate-400 py-12 text-sm">
                {search ? "Nicio ofertă găsită" : "Nicio ofertă salvată"}
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-5 py-3">Nr. ofertă</th>
                    <th className="text-left px-5 py-3">Client</th>
                    <th className="text-left px-5 py-3">Telefon</th>
                    <th className="text-left px-5 py-3">Data</th>
                    <th className="text-right px-5 py-3">Uși</th>
                    <th className="text-right px-5 py-3">Total</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3 font-medium text-blue-600">{o.offerNumber || "—"}</td>
                      <td className="px-5 py-3 font-medium text-slate-800">{o.buyerName || "—"}</td>
                      <td className="px-5 py-3 text-slate-500">{o.buyerPhone || "—"}</td>
                      <td className="px-5 py-3 text-slate-500">{formatDate(o.savedAt)}</td>
                      <td className="px-5 py-3 text-right text-slate-600">{o.doors.length}</td>
                      <td className="px-5 py-3 text-right font-semibold text-emerald-600">{formatEur(orderTotal(o))}</td>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => handleDelete(o.id)}
                          title="Șterge oferta"
                          className="text-slate-300 hover:text-red-500 transition p-1 rounded"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
