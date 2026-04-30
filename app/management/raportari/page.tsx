'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserData } from '@/lib/userRoles';
import Navbar from '@/components/Navbar';
import {
  getShowroomReports, createShowroomReport, updateShowroomReport,
  ShowroomReport, TipActiune, MetodaPlata, ComandaNoua, SursaVizitator
} from '@/lib/showroomReports';
import { ShowroomLocation } from '@/lib/userRoles';
import { logActivity } from '@/lib/activity';

export default function RaportariPage() {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<ShowroomReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<ShowroomReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userLocation, setUserLocation] = useState<ShowroomLocation | ''>('');
  const [userName, setUserName] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [showColumnFilter, setShowColumnFilter] = useState(false);

  const [columnVisibility, setColumnVisibility] = useState({
    id: true, date: true, location: true, tipActiune: true, valoare: true,
    metodaPlata: true, comandaNoua: true, sursaVizitator: true, produseOfertate: true,
    numeClient: true, telefonClient: true, email: true, alteInformatii: true,
  });

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    tipActiune: 'Ofertare' as TipActiune, valoare: '',
    metodaPlata: 'Numerar' as MetodaPlata, comandaNoua: 'Nu' as ComandaNoua,
    sursaVizitator: 'Client existent' as SursaVizitator, sursaVizitatorAltele: '',
    produseOfertate: '', numeClient: '', telefonClient: '', email: '', alteInformatii: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingCell, setEditingCell] = useState<{ reportId: string; field: 'comandaNoua' | 'sursaVizitator' | 'alteInformatii' } | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [updating, setUpdating] = useState(false);

  const columnLabels = {
    id: 'ID', date: 'Data', location: 'Locație', tipActiune: 'Tip Acțiune', valoare: 'Valoare (RON)',
    metodaPlata: 'Metodă Plată', comandaNoua: 'Comandă Nouă?', sursaVizitator: 'Sursă Vizitator',
    produseOfertate: 'Produse Ofertate', numeClient: 'Nume Client', telefonClient: 'Telefon Client',
    email: 'Email', alteInformatii: 'Alte Informații',
  };

  const toggleColumn = (col: keyof typeof columnVisibility) =>
    setColumnVisibility(prev => ({ ...prev, [col]: !prev[col] }));

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading, router]);
  useEffect(() => { if (user && userRole) loadData(); }, [user, userRole]);
  useEffect(() => {
    setFilteredReports(locationFilter === 'all' ? reports : reports.filter(r => r.showroomLocation === locationFilter));
  }, [locationFilter, reports]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (showColumnFilter && !(e.target as HTMLElement).closest('.column-filter-container')) setShowColumnFilter(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showColumnFilter]);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoadingReports(true);
      const userData = await getUserData(user.uid);
      if (userData?.showroomLocation) setUserLocation(userData.showroomLocation);
      if (userData?.name) setUserName(userData.name);
      const fetched = await getShowroomReports(userRole || '', userData?.showroomLocation);
      setReports(fetched); setFilteredReports(fetched);
    } catch { setError('Eroare la încărcarea rapoartelor'); }
    finally { setLoadingReports(false); }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      if (!formData.numeClient || !formData.telefonClient) { setError('Nume și telefon sunt obligatorii'); setSubmitting(false); return; }
      if (formData.tipActiune !== 'Ofertare' && !formData.valoare) { setError('Valoarea este obligatorie'); setSubmitting(false); return; }

      const reportData: any = {
        date: new Date(formData.date), tipActiune: formData.tipActiune,
        valoare: formData.tipActiune === 'Ofertare' ? null : parseFloat(formData.valoare) || 0,
        metodaPlata: formData.metodaPlata, comandaNoua: formData.comandaNoua,
        sursaVizitator: formData.sursaVizitator, produseOfertate: formData.produseOfertate,
        numeClient: formData.numeClient, telefonClient: formData.telefonClient,
        email: formData.email, alteInformatii: formData.alteInformatii,
        showroomLocation: userLocation, createdBy: user.uid,
        createdByEmail: user.email || '', createdByName: userName,
      };
      if (formData.sursaVizitator === 'Altele' && formData.sursaVizitatorAltele) {
        reportData.sursaVizitatorAltele = formData.sursaVizitatorAltele;
      }

      await createShowroomReport(reportData);
      await logActivity('report_created', user.uid, userName, user.email || '',
        `Raport ${formData.tipActiune} creat pentru ${formData.numeClient}`,
        { showroomLocation: userLocation || undefined, amount: parseFloat(formData.valoare) || 0 });

      setSuccess('Raport creat cu succes!');
      setFormData({
        date: new Date().toISOString().split('T')[0], tipActiune: 'Ofertare', valoare: '',
        metodaPlata: 'Numerar', comandaNoua: 'Nu', sursaVizitator: 'Client existent',
        sursaVizitatorAltele: '', produseOfertate: '', numeClient: '', telefonClient: '', email: '', alteInformatii: '',
      });
      await loadData();
      setTimeout(() => { setShowCreateModal(false); setSuccess(''); }, 1500);
    } catch { setError('Eroare la crearea raportului'); }
    finally { setSubmitting(false); }
  };

  const handleCellEdit = (reportId: string, field: 'comandaNoua' | 'sursaVizitator' | 'alteInformatii', val: string) => {
    setEditingCell({ reportId, field }); setEditingValue(val);
  };
  const handleCancelEdit = () => { setEditingCell(null); setEditingValue(''); };
  const handleSaveEdit = async (reportId: string, field: 'comandaNoua' | 'sursaVizitator' | 'alteInformatii', valueToSave?: string) => {
    if (!user || updating) return;
    const finalValue = valueToSave !== undefined ? valueToSave : editingValue;
    try {
      setUpdating(true);
      const updates: any = {};
      if (field === 'comandaNoua') updates.comandaNoua = finalValue as ComandaNoua;
      else if (field === 'sursaVizitator') updates.sursaVizitator = finalValue as SursaVizitator;
      else updates.alteInformatii = finalValue;
      await updateShowroomReport(reportId, updates, user.uid, user.email || '');
      const report = reports.find(r => r.id === reportId);
      await logActivity('report_updated', user.uid, userName, user.email || '',
        `Actualizat ${field} pentru ${report?.numeClient || 'client necunoscut'}`,
        { reportId, showroomLocation: report?.showroomLocation as ShowroomLocation | undefined, field });
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, ...updates } : r));
      setEditingCell(null); setEditingValue('');
    } catch { alert('Eroare la actualizare'); }
    finally { setUpdating(false); }
  };

  const fmtDate = (d: Date) => new Date(d).toLocaleDateString('ro-RO');
  const fmtCurrency = (v: number | null) => v === null ? '' : new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2 }).format(v) + ' lei';
  const canFilter = userRole === 'admin' || userRole === 'superior' || userRole === 'management';
  const uniqueLocations = Array.from(new Set(reports.map(r => r.showroomLocation))).sort();

  const tipColor = (tip: TipActiune) => tip === 'Facturare finala' ? 'bg-blue-100 text-blue-800' : tip === 'Incasare avans' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  const comandaColor = (v: ComandaNoua) => v === 'Da' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  const sursaColor = (s: SursaVizitator) => {
    const map: Record<string, string> = { 'Client existent': 'bg-blue-100 text-blue-800', 'Trafic natural': 'bg-red-100 text-red-800', 'Online': 'bg-purple-100 text-purple-800', 'Vizita teren': 'bg-yellow-100 text-yellow-800', 'Reclama Radio': 'bg-pink-100 text-pink-800', 'Altele': 'bg-gray-100 text-gray-800' };
    return map[s] || 'bg-gray-100 text-gray-800';
  };

  if (loading || loadingReports) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Raportări</h1>
              <p className="mt-1 text-sm text-slate-500">
                {userRole === 'showroom' && userLocation ? <span>Locație: <span className="font-semibold text-indigo-600">{userLocation}</span></span> : <span>Toate showroom-urile</span>}
              </p>
            </div>
            <button onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition shadow-lg text-sm font-semibold">
              + Creare Raport
            </button>
          </div>

          <div className="mb-4 flex items-center gap-6 flex-wrap">
            {canFilter && uniqueLocations.length > 0 && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700">Filtrare locație:</label>
                <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm">
                  <option value="all">Toate locațiile ({reports.length})</option>
                  {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc} ({reports.filter(r => r.showroomLocation === loc).length})</option>)}
                </select>
              </div>
            )}
            <div className="relative column-filter-container">
              <button onClick={() => setShowColumnFilter(!showColumnFilter)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition text-sm font-medium text-slate-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Coloane
              </button>
              {showColumnFilter && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-10 w-56 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900">Vizibilitate coloane</h3>
                  </div>
                  <div className="p-2">
                    {Object.entries(columnLabels).map(([key, label]) => {
                      if (key === 'location' && !canFilter) return null;
                      return (
                        <label key={key} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded cursor-pointer">
                          <input type="checkbox" checked={columnVisibility[key as keyof typeof columnVisibility]} onChange={() => toggleColumn(key as keyof typeof columnVisibility)}
                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded" />
                          <span className="text-sm text-slate-700">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <p className="text-slate-500 text-lg">{reports.length === 0 ? 'Niciun raport. Creați primul raport.' : 'Niciun raport pentru filtrul selectat.'}</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-teal-600">
                    <tr>
                      {columnVisibility.id && <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase whitespace-nowrap">ID</th>}
                      {columnVisibility.date && <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase whitespace-nowrap">Data</th>}
                      {columnVisibility.location && canFilter && <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase whitespace-nowrap">Locație</th>}
                      {columnVisibility.tipActiune && <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase whitespace-nowrap">Tip Acțiune</th>}
                      {columnVisibility.valoare && <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase whitespace-nowrap">Valoare (RON)</th>}
                      {columnVisibility.metodaPlata && <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase whitespace-nowrap">Metodă Plată</th>}
                      {columnVisibility.comandaNoua && <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase whitespace-nowrap">Comandă Nouă?</th>}
                      {columnVisibility.sursaVizitator && <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase whitespace-nowrap">Sursă Vizitator</th>}
                      {columnVisibility.produseOfertate && <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase whitespace-nowrap">Produse Ofertate</th>}
                      {columnVisibility.numeClient && <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase whitespace-nowrap">Nume Client</th>}
                      {columnVisibility.telefonClient && <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase whitespace-nowrap">Telefon Client</th>}
                      {columnVisibility.email && <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase whitespace-nowrap">Email</th>}
                      {columnVisibility.alteInformatii && <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase whitespace-nowrap">Alte Informații</th>}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-50 transition">
                        {columnVisibility.id && <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-slate-700">{report.reportId || 'N/A'}</td>}
                        {columnVisibility.date && <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{fmtDate(report.date)}</td>}
                        {columnVisibility.location && canFilter && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">{report.showroomLocation}</span>
                          </td>
                        )}
                        {columnVisibility.tipActiune && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className={`inline-flex px-2.5 py-1 rounded text-xs font-semibold ${tipColor(report.tipActiune)}`}>{report.tipActiune}</span>
                          </td>
                        )}
                        {columnVisibility.valoare && <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{fmtCurrency(report.valoare)}</td>}
                        {columnVisibility.metodaPlata && <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{report.metodaPlata}</td>}
                        {columnVisibility.comandaNoua && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {editingCell !== null && editingCell.reportId === report.id && editingCell.field === 'comandaNoua' ? (
                              <div className="flex items-center gap-2">
                                <select value={editingValue} autoFocus disabled={updating}
                                  onChange={(e) => { setEditingValue(e.target.value); handleSaveEdit(report.id!, 'comandaNoua', e.target.value); }}
                                  className="px-2 py-1 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 disabled:opacity-50">
                                  <option value="Da">Da</option>
                                  <option value="Nu">Nu</option>
                                </select>
                                {updating && <svg className="animate-spin h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
                              </div>
                            ) : (
                              <span onClick={() => handleCellEdit(report.id!, 'comandaNoua', report.comandaNoua)}
                                className={`inline-flex px-2.5 py-1 rounded text-xs font-semibold cursor-pointer hover:opacity-80 ${comandaColor(report.comandaNoua)}`}>
                                {report.comandaNoua}
                              </span>
                            )}
                          </td>
                        )}
                        {columnVisibility.sursaVizitator && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {editingCell !== null && editingCell.reportId === report.id && editingCell.field === 'sursaVizitator' ? (
                              <div className="flex items-center gap-2">
                                <select value={editingValue} autoFocus disabled={updating}
                                  onChange={(e) => { setEditingValue(e.target.value); handleSaveEdit(report.id!, 'sursaVizitator', e.target.value); }}
                                  className="px-2 py-1 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 disabled:opacity-50">
                                  <option value="Client existent">Client existent</option>
                                  <option value="Online">Online</option>
                                  <option value="Trafic natural">Trafic natural</option>
                                  <option value="Vizita teren">Vizita teren</option>
                                  <option value="Reclama Radio">Reclama Radio</option>
                                  <option value="Altele">Altele</option>
                                </select>
                                {updating && <svg className="animate-spin h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
                              </div>
                            ) : (
                              <span onClick={() => handleCellEdit(report.id!, 'sursaVizitator', report.sursaVizitator)}
                                className={`inline-flex px-2.5 py-1 rounded text-xs font-semibold cursor-pointer hover:opacity-80 ${sursaColor(report.sursaVizitator)}`}>
                                {report.sursaVizitator}{report.sursaVizitator === 'Altele' && report.sursaVizitatorAltele && ` (${report.sursaVizitatorAltele})`}
                              </span>
                            )}
                          </td>
                        )}
                        {columnVisibility.produseOfertate && <td className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate">{report.produseOfertate || '-'}</td>}
                        {columnVisibility.numeClient && <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{report.numeClient}</td>}
                        {columnVisibility.telefonClient && <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{report.telefonClient}</td>}
                        {columnVisibility.email && <td className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate">{report.email || '-'}</td>}
                        {columnVisibility.alteInformatii && (
                          <td className="px-4 py-3 text-sm text-slate-700 max-w-xs">
                            {editingCell !== null && editingCell.reportId === report.id && editingCell.field === 'alteInformatii' ? (
                              <input type="text" value={editingValue} autoFocus onChange={(e) => setEditingValue(e.target.value)}
                                onBlur={() => handleSaveEdit(report.id!, 'alteInformatii')}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(report.id!, 'alteInformatii'); if (e.key === 'Escape') handleCancelEdit(); }}
                                className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500" />
                            ) : (
                              <div onClick={() => handleCellEdit(report.id!, 'alteInformatii', report.alteInformatii || '')}
                                className="cursor-pointer hover:bg-slate-100 px-2 py-1 rounded truncate">
                                {report.alteInformatii || '-'}
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Creare Raport</h2>
                    <button onClick={() => { setShowCreateModal(false); setError(''); setSuccess(''); }}
                      className="text-slate-400 hover:text-slate-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
                  {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {[
                      { label: 'Data', name: 'date', type: 'date' },
                    ].map(({ label, name, type }) => (
                      <div key={name}>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                        <input type={type} name={name} value={(formData as any)[name]} onChange={handleInput} required
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                      </div>
                    ))}

                    {[
                      { label: 'Tip Acțiune *', name: 'tipActiune', options: ['Incasare avans', 'Facturare finala', 'Ofertare'] },
                      { label: 'Metodă Plată *', name: 'metodaPlata', options: ['Numerar', 'CARD'] },
                      { label: 'Comandă Nouă? *', name: 'comandaNoua', options: ['Da', 'Nu'] },
                      { label: 'Sursă Vizitator *', name: 'sursaVizitator', options: ['Client existent', 'Online', 'Trafic natural', 'Vizita teren', 'Reclama Radio', 'Altele'] },
                    ].map(({ label, name, options }) => (
                      <div key={name}>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                        <select name={name} value={(formData as any)[name]} onChange={handleInput} required
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                          {options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Valoare (RON) {formData.tipActiune !== 'Ofertare' && '*'}
                      </label>
                      <input type="number" name="valoare" value={formData.valoare} onChange={handleInput}
                        disabled={formData.tipActiune === 'Ofertare'} required={formData.tipActiune !== 'Ofertare'}
                        step="0.01" min="0"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed" />
                      {formData.tipActiune === 'Ofertare' && <p className="mt-1 text-xs text-slate-400">Dezactivat pentru Ofertare</p>}
                    </div>

                    {formData.sursaVizitator === 'Altele' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Sursă vizitator - detalii</label>
                        <input type="text" name="sursaVizitatorAltele" value={formData.sursaVizitatorAltele} onChange={handleInput}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                      </div>
                    )}

                    {[
                      { label: 'Produse Ofertate', name: 'produseOfertate', type: 'textarea' },
                      { label: 'Nume Client *', name: 'numeClient', type: 'text' },
                      { label: 'Telefon Client *', name: 'telefonClient', type: 'tel' },
                      { label: 'Email', name: 'email', type: 'email' },
                      { label: 'Alte Informații', name: 'alteInformatii', type: 'textarea' },
                    ].map(({ label, name, type }) => (
                      <div key={name}>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                        {type === 'textarea' ? (
                          <textarea name={name} value={(formData as any)[name]} onChange={handleInput} rows={2}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        ) : (
                          <input type={type} name={name} value={(formData as any)[name]} onChange={handleInput}
                            required={name === 'numeClient' || name === 'telefonClient'}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        )}
                      </div>
                    ))}

                    <div className="flex justify-end gap-3 pt-2">
                      <button type="button" onClick={() => { setShowCreateModal(false); setError(''); setSuccess(''); }}
                        className="px-5 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm">
                        Anulează
                      </button>
                      <button type="submit" disabled={submitting}
                        className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 text-sm font-semibold">
                        {submitting ? 'Se creează...' : 'Creare raport'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
