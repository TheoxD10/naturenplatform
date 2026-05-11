'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { useConfiguratorOptions } from '@/app/hooks/useConfiguratorOptions';
import type { FerenerieItem, ManereItem, CosturiItem, CuloriData } from '@/app/hooks/useConfiguratorOptions';

type Tab = 'feronerie' | 'manere' | 'costuri' | 'culori' | 'modele';
type DoorsData = Record<string, Record<string, Record<string, number | null>>>;

export default function OpciuniPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('feronerie');
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

  const {
    loading,
    feronerie, balModels, balCulori,
    manere, manereModels,
    costuri,
    culori,
    doorPriceOverrides,
    persistFeronerie,
    persistManere,
    persistCosturi,
    persistCulori,
    updateDoorPriceOverride,
    deleteDoorPriceOverride,
  } = useConfiguratorOptions();

  const [doorsData, setDoorsData] = useState<DoorsData>({});
  const [doorsLoading, setDoorsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data')
      .then(r => r.json())
      .then((d: DoorsData) => { setDoorsData(d); setDoorsLoading(false); })
      .catch(() => setDoorsLoading(false));
  }, []);

  const withFeedback = useCallback(async (fn: () => Promise<void>) => {
    setGlobalError(null);
    try {
      await fn();
      setGlobalSuccess('Salvat cu succes.');
      setTimeout(() => setGlobalSuccess(null), 2500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setGlobalError('Eroare la salvare în Firebase: ' + msg);
    }
  }, []);

  if (authLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <svg className="h-8 w-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
    </div>
  );
  if (!user) { router.push('/login'); return null; }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'feronerie', label: 'Balamale' },
    { key: 'manere',    label: 'Mânere' },
    { key: 'costuri',   label: 'Costuri' },
    { key: 'culori',    label: 'Culori' },
    { key: 'modele',    label: 'Prețuri Modele' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Opțiuni Configurator</h1>
          <p className="text-sm text-slate-500 mt-1">Gestionați opțiunile din configuratorul de oferte</p>
        </div>

        {globalError && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold">Salvarea a eșuat</p>
              <p className="mt-0.5 text-xs font-mono">{globalError}</p>
              <p className="mt-1 text-xs text-red-600">Verificați că regulile Firestore sunt publicate în Firebase Console.</p>
            </div>
            <button onClick={() => setGlobalError(null)} className="ml-auto shrink-0 text-red-400 hover:text-red-600">✕</button>
          </div>
        )}
        {globalSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-medium">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {globalSuccess}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-slate-200 shadow-sm w-fit">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === t.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading || (activeTab === 'modele' && doorsLoading) ? (
          <div className="flex items-center justify-center h-48 bg-white rounded-xl border border-slate-200">
            <svg className="h-6 w-6 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          </div>
        ) : (
          <>
            {activeTab === 'feronerie' && (
              <FerenerieTab
                items={feronerie}
                balModels={balModels}
                balCulori={balCulori}
                onSave={(items) => withFeedback(() => persistFeronerie(items))}
              />
            )}
            {activeTab === 'manere' && (
              <ManereTab
                items={manere}
                models={manereModels}
                onSave={(items) => withFeedback(() => persistManere(items))}
              />
            )}
            {activeTab === 'costuri' && (
              <CosturiTab
                items={costuri}
                onSave={(items) => withFeedback(() => persistCosturi(items))}
              />
            )}
            {activeTab === 'culori' && (
              <CuloriTab
                data={culori}
                onSave={(data) => withFeedback(() => persistCulori(data))}
              />
            )}
            {activeTab === 'modele' && (
              <ModelePretTab
                doorsData={doorsData}
                overrides={doorPriceOverrides}
                onSetOverride={updateDoorPriceOverride}
                onDeleteOverride={deleteDoorPriceOverride}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

/* ─────────────────────────────── FERONERIE TAB ─────────────────────────────── */
function FerenerieTab({
  items, balModels, balCulori,
  onSave,
}: {
  items: FerenerieItem[];
  balModels: string[];
  balCulori: string[];
  onSave: (items: FerenerieItem[]) => Promise<void>;
}) {
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState<Partial<FerenerieItem>>({ nrBal: 2 });
  const [showAdd, setShowAdd] = useState(false);

  async function saveEdit(idx: number) {
    const price = parseFloat(editPrice);
    if (isNaN(price)) return;
    const updated = items.map((it, i) => i === idx ? { ...it, price } : it);
    setSaving(true);
    await onSave(updated).catch(console.error);
    setSaving(false);
    setEditIdx(null);
  }

  async function deleteItem(idx: number) {
    if (!confirm('Ștergi această intrare?')) return;
    const updated = items.filter((_, i) => i !== idx);
    await onSave(updated).catch(console.error);
  }

  async function addItem() {
    if (!newItem.model || !newItem.culoare || !newItem.price) return;
    const item: FerenerieItem = {
      nrBal: newItem.nrBal as 2 | 3,
      model: newItem.model,
      culoare: newItem.culoare,
      price: newItem.price,
    };
    const updated = [...items, item];
    setSaving(true);
    await onSave(updated).catch(console.error);
    setSaving(false);
    setNewItem({ nrBal: 2 });
    setShowAdd(false);
  }

  return (
    <Card title="Balamale (Feronerie)" action={
      <button onClick={() => setShowAdd(s => !s)} className={btnClass('indigo')}>
        {showAdd ? 'Anulează' : '+ Adaugă'}
      </button>
    }>
      {showAdd && (
        <div className="mb-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200 grid grid-cols-4 gap-3 items-end">
          <div>
            <label className={labelClass}>Nr. Balamale</label>
            <select value={newItem.nrBal} onChange={e => setNewItem(p => ({ ...p, nrBal: parseInt(e.target.value) as 2 | 3 }))} className={inputClass}>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Model</label>
            <input list="bal-models" value={newItem.model ?? ''} onChange={e => setNewItem(p => ({ ...p, model: e.target.value }))} className={inputClass} placeholder="Model balama" />
            <datalist id="bal-models">{balModels.map(m => <option key={m} value={m} />)}</datalist>
          </div>
          <div>
            <label className={labelClass}>Culoare</label>
            <input list="bal-culori" value={newItem.culoare ?? ''} onChange={e => setNewItem(p => ({ ...p, culoare: e.target.value }))} className={inputClass} placeholder="Culoare" />
            <datalist id="bal-culori">{balCulori.map(c => <option key={c} value={c} />)}</datalist>
          </div>
          <div>
            <label className={labelClass}>Preț EUR</label>
            <div className="flex gap-2">
              <input type="number" min="0" value={newItem.price ?? ''} onChange={e => setNewItem(p => ({ ...p, price: parseFloat(e.target.value) }))} className={inputClass} placeholder="0" />
              <button onClick={addItem} disabled={saving} className={btnClass('indigo')}>Salvează</button>
            </div>
          </div>
        </div>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left">
            <th className={thClass}>Nr. Bal.</th>
            <th className={thClass}>Model</th>
            <th className={thClass}>Culoare</th>
            <th className={thClass}>Preț EUR</th>
            <th className={thClass}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
              <td className={tdClass}>{it.nrBal}</td>
              <td className={tdClass}>{it.model}</td>
              <td className={tdClass}>{it.culoare}</td>
              <td className={tdClass}>
                {editIdx === i ? (
                  <div className="flex gap-1.5 items-center">
                    <input autoFocus type="number" min="0" value={editPrice} onChange={e => setEditPrice(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(i); if (e.key === 'Escape') setEditIdx(null); }}
                      className="w-20 rounded-lg border border-indigo-300 bg-white px-2 py-1 text-center text-sm outline-none" />
                    <button onClick={() => saveEdit(i)} disabled={saving} className={btnClass('indigo')}>✓</button>
                    <button onClick={() => setEditIdx(null)} className={btnClass('slate')}>✕</button>
                  </div>
                ) : (
                  <span className="font-semibold text-emerald-700">{it.price} EUR</span>
                )}
              </td>
              <td className={tdClass}>
                <div className="flex gap-1.5 justify-end">
                  <button onClick={() => { setEditIdx(i); setEditPrice(String(it.price)); }} className={btnClass('slate')}>Edit</button>
                  <button onClick={() => deleteItem(i)} className={btnClass('red')}>Șterge</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/* ─────────────────────────────── MANERE TAB ────────────────────────────────── */
function ManereTab({ items, models, onSave }: {
  items: ManereItem[];
  models: string[];
  onSave: (items: ManereItem[]) => Promise<void>;
}) {
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState<Partial<ManereItem>>({});

  async function saveEdit(idx: number) {
    const price = parseFloat(editPrice);
    if (isNaN(price)) return;
    const updated = items.map((it, i) => i === idx ? { ...it, price } : it);
    setSaving(true);
    await onSave(updated).catch(console.error);
    setSaving(false);
    setEditIdx(null);
  }

  async function deleteItem(idx: number) {
    if (!confirm('Ștergi această intrare?')) return;
    const updated = items.filter((_, i) => i !== idx);
    await onSave(updated).catch(console.error);
  }

  async function addItem() {
    if (!newItem.model || !newItem.tip || !newItem.culoare || !newItem.price) return;
    const updated = [...items, newItem as ManereItem];
    setSaving(true);
    await onSave(updated).catch(console.error);
    setSaving(false);
    setNewItem({});
    setShowAdd(false);
  }

  return (
    <Card title="Mânere" action={
      <button onClick={() => setShowAdd(s => !s)} className={btnClass('indigo')}>
        {showAdd ? 'Anulează' : '+ Adaugă'}
      </button>
    }>
      {showAdd && (
        <div className="mb-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200 grid grid-cols-4 gap-3 items-end">
          <div>
            <label className={labelClass}>Model</label>
            <input list="man-models" value={newItem.model ?? ''} onChange={e => setNewItem(p => ({ ...p, model: e.target.value }))} className={inputClass} placeholder="Model" />
            <datalist id="man-models">{models.map(m => <option key={m} value={m} />)}</datalist>
          </div>
          <div>
            <label className={labelClass}>Tip</label>
            <input value={newItem.tip ?? ''} onChange={e => setNewItem(p => ({ ...p, tip: e.target.value }))} className={inputClass} placeholder="Maner / Bocheta..." />
          </div>
          <div>
            <label className={labelClass}>Culoare</label>
            <input value={newItem.culoare ?? ''} onChange={e => setNewItem(p => ({ ...p, culoare: e.target.value }))} className={inputClass} placeholder="Culoare / variante" />
          </div>
          <div>
            <label className={labelClass}>Preț EUR</label>
            <div className="flex gap-2">
              <input type="number" min="0" value={newItem.price ?? ''} onChange={e => setNewItem(p => ({ ...p, price: parseFloat(e.target.value) }))} className={inputClass} placeholder="0" />
              <button onClick={addItem} disabled={saving} className={btnClass('indigo')}>Salvează</button>
            </div>
          </div>
        </div>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left">
            <th className={thClass}>Model</th>
            <th className={thClass}>Tip</th>
            <th className={thClass}>Culoare / Variantă</th>
            <th className={thClass}>Preț EUR</th>
            <th className={thClass}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
              <td className={tdClass + ' font-semibold'}>{it.model}</td>
              <td className={tdClass}>{it.tip}</td>
              <td className={`${tdClass} max-w-xs truncate text-slate-500`}>{it.culoare}</td>
              <td className={tdClass}>
                {editIdx === i ? (
                  <div className="flex gap-1.5 items-center">
                    <input autoFocus type="number" min="0" value={editPrice} onChange={e => setEditPrice(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(i); if (e.key === 'Escape') setEditIdx(null); }}
                      className="w-20 rounded-lg border border-indigo-300 bg-white px-2 py-1 text-center text-sm outline-none" />
                    <button onClick={() => saveEdit(i)} disabled={saving} className={btnClass('indigo')}>✓</button>
                    <button onClick={() => setEditIdx(null)} className={btnClass('slate')}>✕</button>
                  </div>
                ) : (
                  <span className="font-semibold text-emerald-700">{it.price} EUR</span>
                )}
              </td>
              <td className={tdClass}>
                <div className="flex gap-1.5 justify-end">
                  <button onClick={() => { setEditIdx(i); setEditPrice(String(it.price)); }} className={btnClass('slate')}>Edit</button>
                  <button onClick={() => deleteItem(i)} className={btnClass('red')}>Șterge</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/* ─────────────────────────────── COSTURI TAB ───────────────────────────────── */
function CosturiTab({ items, onSave }: {
  items: CosturiItem[];
  onSave: (items: CosturiItem[]) => Promise<void>;
}) {
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newPrice, setNewPrice] = useState('');

  async function saveEdit(idx: number) {
    if (!editLabel.trim()) return;
    const price = editPrice.trim() === '' ? null : parseFloat(editPrice);
    const updated = items.map((it, i) => i === idx ? { label: editLabel.trim(), price: price !== null && !isNaN(price) ? price : null } : it);
    setSaving(true);
    await onSave(updated).catch(console.error);
    setSaving(false);
    setEditIdx(null);
  }

  async function deleteItem(idx: number) {
    if (!confirm('Ștergi acest cost?')) return;
    const updated = items.filter((_, i) => i !== idx);
    await onSave(updated).catch(console.error);
  }

  async function addItem() {
    if (!newLabel.trim()) return;
    const price = newPrice.trim() === '' ? null : parseFloat(newPrice);
    const updated = [...items, { label: newLabel.trim(), price: price !== null && !isNaN(price) ? price : null }];
    setSaving(true);
    await onSave(updated).catch(console.error);
    setSaving(false);
    setNewLabel('');
    setNewPrice('');
    setShowAdd(false);
  }

  return (
    <Card title="Costuri Adiționale" action={
      <button onClick={() => setShowAdd(s => !s)} className={btnClass('indigo')}>
        {showAdd ? 'Anulează' : '+ Adaugă'}
      </button>
    }>
      {showAdd && (
        <div className="mb-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200 flex gap-3 items-end">
          <div className="flex-1">
            <label className={labelClass}>Denumire</label>
            <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              className={inputClass} placeholder="Ex: Cost suplimentar..." />
          </div>
          <div className="w-36">
            <label className={labelClass}>Preț EUR (gol = variabil)</label>
            <input type="number" min="0" value={newPrice} onChange={e => setNewPrice(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              className={inputClass} placeholder="Variabil" />
          </div>
          <button onClick={addItem} disabled={saving} className={btnClass('indigo')}>Adaugă</button>
        </div>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left">
            <th className={thClass}>Denumire</th>
            <th className={thClass}>Preț</th>
            <th className={thClass}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
              <td className={tdClass}>
                {editIdx === i ? (
                  <input autoFocus value={editLabel} onChange={e => setEditLabel(e.target.value)}
                    className="w-full rounded-lg border border-indigo-300 bg-white px-2 py-1 text-sm outline-none" />
                ) : it.label}
              </td>
              <td className={tdClass}>
                {editIdx === i ? (
                  <input type="number" min="0" value={editPrice} onChange={e => setEditPrice(e.target.value)}
                    placeholder="Variabil"
                    className="w-24 rounded-lg border border-indigo-300 bg-white px-2 py-1 text-sm text-center outline-none" />
                ) : (
                  it.price !== null
                    ? <span className="font-semibold text-emerald-700">{it.price} EUR</span>
                    : <span className="text-amber-500 italic text-xs font-medium">Variabil</span>
                )}
              </td>
              <td className={tdClass}>
                <div className="flex gap-1.5 justify-end">
                  {editIdx === i ? (
                    <>
                      <button onClick={() => saveEdit(i)} disabled={saving} className={btnClass('indigo')}>✓ Salvează</button>
                      <button onClick={() => setEditIdx(null)} className={btnClass('slate')}>✕</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditIdx(i); setEditLabel(it.label); setEditPrice(it.price !== null ? String(it.price) : ''); }} className={btnClass('slate')}>Edit</button>
                      <button onClick={() => deleteItem(i)} className={btnClass('red')}>Șterge</button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/* ─────────────────────────────── CULORI TAB ────────────────────────────────── */
function CuloriTab({ data, onSave }: { data: CuloriData; onSave: (d: CuloriData) => Promise<void> }) {
  const [selectedFinisaj, setSelectedFinisaj] = useState<string>('');
  const [selectedColectie, setSelectedColectie] = useState<string>('');
  const [editingColors, setEditingColors] = useState<string | null>(null);
  const [colorInput, setColorInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [newColectie, setNewColectie] = useState('');
  const [showAddColectie, setShowAddColectie] = useState(false);
  const [newFinisaj, setNewFinisaj] = useState('');
  const [showAddFinisaj, setShowAddFinisaj] = useState(false);

  const finisajList = Object.keys(data).sort();
  const colectieList = selectedFinisaj ? Object.keys(data[selectedFinisaj] ?? {}).sort() : [];

  async function saveColors(finisaj: string, colectie: string, colorsStr: string) {
    const colors = colorsStr.split(',').map(c => c.trim()).filter(Boolean);
    const updated: CuloriData = {
      ...data,
      [finisaj]: { ...(data[finisaj] ?? {}), [colectie]: colors },
    };
    setSaving(true);
    await onSave(updated).catch(console.error);
    setSaving(false);
    setEditingColors(null);
  }

  async function deleteColectie(finisaj: string, colectie: string) {
    if (!confirm(`Ștergi colecția "${colectie}" din "${finisaj}"?`)) return;
    const newFin = { ...data[finisaj] };
    delete newFin[colectie];
    const updated: CuloriData = { ...data, [finisaj]: newFin };
    await onSave(updated).catch(console.error);
    if (selectedColectie === colectie) setSelectedColectie('');
  }

  async function addColectie() {
    if (!newColectie.trim() || !selectedFinisaj) return;
    const updated: CuloriData = {
      ...data,
      [selectedFinisaj]: { ...(data[selectedFinisaj] ?? {}), [newColectie.trim()]: [] },
    };
    setSaving(true);
    await onSave(updated).catch(console.error);
    setSaving(false);
    setNewColectie('');
    setShowAddColectie(false);
  }

  async function addFinisaj() {
    if (!newFinisaj.trim()) return;
    const updated: CuloriData = { ...data, [newFinisaj.trim()]: {} };
    setSaving(true);
    await onSave(updated).catch(console.error);
    setSaving(false);
    setSelectedFinisaj(newFinisaj.trim());
    setNewFinisaj('');
    setShowAddFinisaj(false);
  }

  async function deleteFinisaj(finisaj: string) {
    if (!confirm(`Ștergi tot finisajul "${finisaj}" și toate colecțiile sale?`)) return;
    const updated = { ...data };
    delete updated[finisaj];
    await onSave(updated).catch(console.error);
    if (selectedFinisaj === finisaj) { setSelectedFinisaj(''); setSelectedColectie(''); }
  }

  const currentColors = selectedFinisaj && selectedColectie ? (data[selectedFinisaj]?.[selectedColectie] ?? []) : [];

  return (
    <div className="grid grid-cols-[200px_220px_1fr] gap-4">
      {/* Column 1: Finisaj list */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Finisaj</span>
          <button onClick={() => setShowAddFinisaj(s => !s)} className="text-xs text-indigo-600 font-semibold hover:underline">+ Nou</button>
        </div>
        {showAddFinisaj && (
          <div className="px-3 py-2 bg-indigo-50 border-b border-indigo-100 flex gap-1.5">
            <input autoFocus value={newFinisaj} onChange={e => setNewFinisaj(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addFinisaj()}
              placeholder="Finisaj nou..." className="flex-1 text-xs rounded border border-indigo-200 px-2 py-1 outline-none" />
            <button onClick={addFinisaj} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded font-bold">✓</button>
          </div>
        )}
        <div className="overflow-auto max-h-[500px]">
          {finisajList.map(f => (
            <div key={f}
              onClick={() => { setSelectedFinisaj(f); setSelectedColectie(''); setEditingColors(null); }}
              className={`group flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm transition ${selectedFinisaj === f ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'}`}
            >
              <span className="truncate">{f}</span>
              <button onClick={e => { e.stopPropagation(); deleteFinisaj(f); }}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs ml-1">✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Column 2: Colectie list */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Colecție</span>
          {selectedFinisaj && (
            <button onClick={() => setShowAddColectie(s => !s)} className="text-xs text-indigo-600 font-semibold hover:underline">+ Nouă</button>
          )}
        </div>
        {showAddColectie && selectedFinisaj && (
          <div className="px-3 py-2 bg-indigo-50 border-b border-indigo-100 flex gap-1.5">
            <input autoFocus value={newColectie} onChange={e => setNewColectie(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addColectie()}
              placeholder="Colecție nouă..." className="flex-1 text-xs rounded border border-indigo-200 px-2 py-1 outline-none" />
            <button onClick={addColectie} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded font-bold">✓</button>
          </div>
        )}
        <div className="overflow-auto max-h-[500px]">
          {!selectedFinisaj ? (
            <p className="text-xs text-slate-400 text-center py-6">Selectați un finisaj</p>
          ) : colectieList.map(c => (
            <div key={c}
              onClick={() => { setSelectedColectie(c); setEditingColors(null); }}
              className={`group flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm transition ${selectedColectie === c ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'}`}
            >
              <span className="truncate">{c}</span>
              <button onClick={e => { e.stopPropagation(); deleteColectie(selectedFinisaj, c); }}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs ml-1">✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Column 3: Colors editor */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Culori {selectedColectie ? `— ${selectedColectie}` : ''}
          </span>
        </div>
        {!selectedColectie ? (
          <p className="text-xs text-slate-400 text-center py-10">Selectați o colecție</p>
        ) : editingColors ? (
          <div className="p-5">
            <p className="text-xs text-slate-500 mb-2">Culori separate prin virgulă:</p>
            <textarea
              autoFocus
              value={colorInput}
              onChange={e => setColorInput(e.target.value)}
              rows={8}
              className="w-full rounded-lg border border-indigo-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 font-mono"
            />
            <div className="flex gap-2 mt-3">
              <button onClick={() => saveColors(selectedFinisaj, selectedColectie, colorInput)} disabled={saving} className={btnClass('indigo')}>
                {saving ? 'Salvează...' : 'Salvează'}
              </button>
              <button onClick={() => setEditingColors(null)} className={btnClass('slate')}>Anulează</button>
            </div>
          </div>
        ) : (
          <div className="p-5">
            <div className="flex flex-wrap gap-1.5 mb-4">
              {currentColors.length === 0
                ? <p className="text-xs text-slate-400 italic">Nicio culoare definită</p>
                : currentColors.map(c => (
                  <span key={c} className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-700">{c}</span>
                ))
              }
            </div>
            <button
              onClick={() => { setEditingColors(selectedColectie); setColorInput(currentColors.join(', ')); }}
              className={btnClass('indigo')}
            >
              Editează culori
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────── PREȚURI MODELE TAB ────────────────────────── */
function ModelePretTab({
  doorsData, overrides, onSetOverride, onDeleteOverride,
}: {
  doorsData: DoorsData;
  overrides: Record<string, number>;
  onSetOverride: (key: string, price: number) => void;
  onDeleteOverride: (key: string) => void;
}) {
  const [selectedFinisaj, setSelectedFinisaj] = useState('');
  const [selectedColectie, setSelectedColectie] = useState('');
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');

  const finisajList = Object.keys(doorsData).filter(k => k !== 'TOC_V2').sort();
  const colectieList = selectedFinisaj ? Object.keys(doorsData[selectedFinisaj] ?? {}).sort() : [];
  const modelList = (selectedFinisaj && selectedColectie)
    ? Object.keys(doorsData[selectedFinisaj]?.[selectedColectie] ?? {}).sort()
    : [];

  function startEdit(key: string, current: number | null) {
    setEditKey(key);
    setEditPrice(current !== null ? String(current) : '');
  }

  function commitEdit(key: string) {
    const p = parseFloat(editPrice);
    if (!isNaN(p) && p >= 0) onSetOverride(key, p);
    setEditKey(null);
  }

  return (
    <div className="grid grid-cols-[180px_200px_1fr] gap-4">
      {/* Column 1: Finisaj */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Finisaj</span>
        </div>
        <div className="overflow-auto max-h-[600px]">
          {finisajList.map(f => (
            <div key={f}
              onClick={() => { setSelectedFinisaj(f); setSelectedColectie(''); setEditKey(null); }}
              className={`px-4 py-2.5 cursor-pointer text-sm transition truncate ${selectedFinisaj === f ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'}`}
            >{f}</div>
          ))}
        </div>
      </div>

      {/* Column 2: Colectie */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Colecție</span>
        </div>
        <div className="overflow-auto max-h-[600px]">
          {!selectedFinisaj
            ? <p className="text-xs text-slate-400 text-center py-6">Selectați un finisaj</p>
            : colectieList.map(c => (
              <div key={c}
                onClick={() => { setSelectedColectie(c); setEditKey(null); }}
                className={`px-4 py-2.5 cursor-pointer text-sm transition truncate ${selectedColectie === c ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'}`}
              >{c}</div>
            ))
          }
        </div>
      </div>

      {/* Column 3: Models with prices */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Modele {selectedColectie ? `— ${selectedColectie}` : ''}
          </span>
          {selectedColectie && (
            <span className="text-xs text-slate-400">{modelList.length} modele</span>
          )}
        </div>
        {!selectedColectie ? (
          <p className="text-xs text-slate-400 text-center py-10">Selectați o colecție</p>
        ) : (
          <div className="overflow-auto max-h-[560px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-slate-200 text-left">
                  <th className={thClass}>Model</th>
                  <th className={thClass}>Preț Excel (EUR)</th>
                  <th className={thClass}>Override Firestore</th>
                  <th className={thClass}></th>
                </tr>
              </thead>
              <tbody>
                {modelList.map(m => {
                  const key = `${selectedFinisaj}|${selectedColectie}|${m}`;
                  const basePrice = doorsData[selectedFinisaj]?.[selectedColectie]?.[m] ?? null;
                  const override = overrides[key] ?? null;
                  const isEditing = editKey === key;
                  return (
                    <tr key={m} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className={tdClass + ' font-medium'}>{m}</td>
                      <td className={tdClass}>
                        {basePrice !== null
                          ? <span className={override !== null ? 'line-through text-slate-400 text-xs' : 'text-emerald-700 font-semibold'}>{basePrice} EUR</span>
                          : <span className="text-slate-300 text-xs italic">—</span>
                        }
                      </td>
                      <td className={tdClass}>
                        {isEditing ? (
                          <div className="flex gap-1.5 items-center">
                            <input
                              autoFocus
                              type="number" min="0"
                              value={editPrice}
                              onChange={e => setEditPrice(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') commitEdit(key); if (e.key === 'Escape') setEditKey(null); }}
                              className="w-24 rounded-lg border border-indigo-300 bg-white px-2 py-1 text-center text-sm outline-none"
                            />
                            <button onClick={() => commitEdit(key)} className={btnClass('indigo')}>✓</button>
                            <button onClick={() => setEditKey(null)} className={btnClass('slate')}>✕</button>
                          </div>
                        ) : override !== null ? (
                          <span className="font-semibold text-indigo-600">{override} EUR</span>
                        ) : (
                          <span className="text-slate-300 text-xs italic">—</span>
                        )}
                      </td>
                      <td className={tdClass}>
                        <div className="flex gap-1.5 justify-end">
                          <button onClick={() => startEdit(key, override ?? basePrice)} className={btnClass('slate')}>
                            {override !== null ? 'Edit' : 'Set'}
                          </button>
                          {override !== null && (
                            <button onClick={() => onDeleteOverride(key)} className={btnClass('red')}>Reset</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────── SHARED UI ─────────────────────────────────── */
function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-800">{title}</h2>
        {action}
      </div>
      <div className="p-5 overflow-x-auto">{children}</div>
    </div>
  );
}

const labelClass = 'block text-xs font-medium text-slate-500 mb-1';
const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';
const thClass = 'px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400';
const tdClass = 'px-3 py-2.5 text-slate-700';

function btnClass(color: 'indigo' | 'slate' | 'red') {
  const map = {
    indigo: 'px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition disabled:opacity-50',
    slate:  'px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition',
    red:    'px-3 py-1.5 rounded-lg text-red-500 text-xs font-semibold hover:bg-red-50 hover:text-red-700 transition border border-red-200',
  };
  return map[color];
}
