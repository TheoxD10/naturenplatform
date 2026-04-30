'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getEmailConfig, updateEmailConfig, getEmailRecipients, addEmailRecipient, removeEmailRecipient, EmailConfig, EmailRecipient } from '@/lib/emailConfig';

export default function EmailConfigPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [sendTime, setSendTime] = useState('20:00');
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/management');
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (user && isAdmin) loadData();
  }, [user, isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configData, recipientsData] = await Promise.all([getEmailConfig(), getEmailRecipients()]);
      if (configData) { setConfig(configData); setEnabled(configData.enabled); setSendTime(configData.sendTime); }
      setRecipients(recipientsData);
    } catch { setError('Eroare la încărcarea configurării email'); }
    finally { setLoading(false); }
  };

  const handleSaveConfig = async () => {
    if (!user) return;
    try {
      setSaving(true); setError(''); setSuccess('');
      await updateEmailConfig({ enabled, sendTime, timezone: 'Europe/Bucharest' }, user.uid);
      setSuccess('Configurare salvată cu succes!');
      await loadData();
    } catch { setError('Eroare la salvarea configurării'); }
    finally { setSaving(false); }
  };

  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) { setError('Email invalid'); return; }
    if (!newName.trim()) { setError('Introduceți un nume'); return; }
    try {
      setError(''); setSuccess('');
      await addEmailRecipient(newEmail, newName, user.uid);
      setNewEmail(''); setNewName('');
      setSuccess('Destinatar adăugat!');
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Eroare la adăugarea destinatarului');
    }
  };

  const handleRemoveRecipient = async (id: string) => {
    if (!confirm('Eliminați acest destinatar?')) return;
    try {
      setError(''); setSuccess('');
      await removeEmailRecipient(id);
      setSuccess('Destinatar eliminat!');
      await loadData();
    } catch { setError('Eroare la eliminarea destinatarului'); }
  };

  const handleSendTest = async () => {
    try {
      setTestEmailSending(true); setError(''); setSuccess('');
      const res = await fetch('/api/send-daily-report', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isTest: true })
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Eroare'); }
      setSuccess('Email de test trimis cu succes!');
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Eroare la trimitere');
    } finally { setTestEmailSending(false); }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => router.push('/management/admin')}
            className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition">
            <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Configurare raport email</h1>
            <p className="text-sm text-slate-500 mt-0.5">Rapoarte zilnice automate cu metricile showroom-ului</p>
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}

        {/* Schedule */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Configurare programare</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500" />
              <span className="text-sm text-slate-700">Activare raport zilnic automat</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Ora de trimitere (Europe/Bucharest)</label>
              <input type="time" value={sendTime} onChange={(e) => setSendTime(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-slate-900" />
            </div>
            {config?.lastSent && (
              <p className="text-sm text-slate-500">
                Ultima trimitere: {new Date(config.lastSent).toLocaleString('ro-RO', { dateStyle: 'full', timeStyle: 'short' })}
              </p>
            )}
            <button onClick={handleSaveConfig} disabled={saving}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-sm font-semibold transition">
              {saving ? 'Se salvează...' : 'Salvare configurare'}
            </button>
          </div>
        </div>

        {/* Recipients */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Destinatari ({recipients.length})</h2>
          <form onSubmit={handleAddRecipient} className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Adresă email</label>
                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="destinatar@exemplu.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-slate-900 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nume</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nume destinatar"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-slate-900 text-sm" />
              </div>
            </div>
            <button type="submit" className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold">
              Adăugare destinatar
            </button>
          </form>
          <div className="space-y-3">
            {recipients.length === 0 ? (
              <p className="text-slate-400 text-center py-4 text-sm">Niciun destinatar adăugat</p>
            ) : recipients.map(r => (
              <div key={r.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900 text-sm">{r.name}</div>
                  <div className="text-xs text-slate-500">{r.email}</div>
                </div>
                <button onClick={() => handleRemoveRecipient(r.id!)}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium transition">
                  Eliminare
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Test email */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-2">Email de test</h2>
          <p className="text-sm text-slate-500 mb-4">Trimiteți un email de test cu metricile de astăzi la toți destinatarii configurați</p>
          <button onClick={handleSendTest} disabled={testEmailSending || recipients.length === 0}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold transition">
            {testEmailSending ? 'Se trimite...' : 'Trimite email de test'}
          </button>
          {recipients.length === 0 && (
            <p className="text-xs text-orange-600 mt-2">Adăugați cel puțin un destinatar înainte de a trimite un email de test</p>
          )}
        </div>
      </div>
    </div>
  );
}
