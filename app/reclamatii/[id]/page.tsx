'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ReclamatiiNavbar from '../components/ReclamatiiNavbar';
import {
  Reclamatie, Comentariu, ReclamatieStatus, UrgentaNivel,
  STATUS_LABELS, STATUS_COLORS, URGENTA_LABELS, URGENTA_COLORS,
  getReclamatie, updateReclamatie, deleteReclamatie,
  subscribeComentarii, addComentariu, updateComentariu, deleteComentariu,
  parseMentions,
} from '@/lib/reclamatii';
import { Eticheta, subscribeEtichete } from '@/lib/etichete';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import TagBadge from '../components/TagBadge';
import ConfirmModal from '../components/ConfirmModal';

interface UserRecord { id: string; email: string; name?: string; }

function fmtDate(ts: any) {
  if (!ts?.toDate) return '—';
  return new Date(ts.toDate()).toLocaleString('ro-RO', { dateStyle: 'short', timeStyle: 'short' });
}

function renderComment(text: string): string {
  return parseMentions(text);
}

export default function ReclamatieDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [rec, setRec] = useState<Reclamatie | null>(null);
  const [etichete, setEtichete] = useState<Eticheta[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [comentarii, setComentarii] = useState<Comentariu[]>([]);
  const [loading, setLoading] = useState(true);

  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionDropdown, setMentionDropdown] = useState(false);
  const [mentionsCurrent, setMentionsCurrent] = useState<string[]>([]);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || !id) return;

    getReclamatie(id).then(data => { setRec(data); setLoading(false); });
    const unsub = subscribeComentarii(id, setComentarii);
    const unsub2 = subscribeEtichete(setEtichete);

    getDocs(collection(db, 'users')).then(snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    });

    return () => { unsub(); unsub2(); };
  }, [user, id]);

  const save = async (field: string, value: any) => {
    if (!rec?.id) return;
    setSaving(true);
    try {
      await updateReclamatie(rec.id, { [field]: value });
      setRec(prev => prev ? { ...prev, [field]: value } : prev);
    } finally { setSaving(false); setEditField(null); }
  };

  const handleStatusChange = (status: ReclamatieStatus) => save('status', status);
  const handleUrgentaChange = (urgenta: UrgentaNivel) => save('urgenta', urgenta);

  const handleAssign = async (userId: string) => {
    const u = users.find(u => u.id === userId);
    if (!u || !rec?.id) return;
    await updateReclamatie(rec.id, { assignedTo: userId, assignedToNume: u.name || u.email });
    setRec(prev => prev ? { ...prev, assignedTo: userId, assignedToNume: u.name || u.email } : prev);
    if (u.email) {
      fetch('/api/reclamatii-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'assignment',
          to: u.email,
          assigneeName: u.name || u.email,
          assignedBy: user?.displayName || user?.email || '',
          numarReclamatie: rec.numar,
          numeClient: rec.numeClient,
          ticketLink: `${window.location.origin}/reclamatii/${rec.id}`,
        }),
      }).catch(() => {});
    }
  };

  const handleTagToggle = async (eid: string) => {
    if (!rec?.id) return;
    const current = rec.etichete || [];
    const updated = current.includes(eid) ? current.filter(id => id !== eid) : [...current, eid];
    await updateReclamatie(rec.id, { etichete: updated });
    setRec(prev => prev ? { ...prev, etichete: updated } : prev);
  };

  const handleDelete = async () => {
    if (!rec?.id) return;
    setDeleting(true);
    try {
      await deleteReclamatie(rec.id);
      router.push('/reclamatii');
    } finally { setDeleting(false); }
  };

  const copyStatusLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/reclamatii/status/${rec?.tokenAcces}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Comments
  const handleCommentInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewComment(val);
    const atIdx = val.lastIndexOf('@');
    if (atIdx !== -1 && atIdx === val.length - 1 - (val.length - 1 - atIdx)) {
      const afterAt = val.slice(atIdx + 1);
      if (!afterAt.includes(' ') && !afterAt.includes('\n')) {
        setMentionQuery(afterAt);
        setMentionDropdown(true);
        return;
      }
    }
    setMentionDropdown(false);
  };

  const insertMention = (u: UserRecord) => {
    const atIdx = newComment.lastIndexOf('@');
    const before = newComment.slice(0, atIdx);
    const mention = `@[${u.name || u.email}](${u.id}) `;
    setNewComment(before + mention);
    setMentionsCurrent(prev => prev.includes(u.id) ? prev : [...prev, u.id]);
    setMentionDropdown(false);
    commentRef.current?.focus();
  };

  const handleSendComment = async () => {
    if (!user || !rec?.id || !newComment.trim()) return;
    setCommentSubmitting(true);
    try {
      const userName = user.displayName || user.email || '';
      await addComentariu({
        reclamatieId: rec.id,
        userId: user.uid,
        userNume: userName,
        userEmail: user.email || '',
        continut: newComment.trim(),
        mentions: mentionsCurrent,
      });

      for (const uid of mentionsCurrent) {
        const u = users.find(u => u.id === uid);
        if (u?.email) {
          fetch('/api/reclamatii-notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'mention',
              to: u.email,
              mentionedName: u.name || u.email,
              mentionedBy: userName,
              numarReclamatie: rec.numar,
              commentContent: newComment.trim().slice(0, 200),
              ticketLink: `${window.location.origin}/reclamatii/${rec.id}`,
            }),
          }).catch(() => {});
        }
      }

      setNewComment('');
      setMentionsCurrent([]);
    } finally { setCommentSubmitting(false); }
  };

  const handleEditComment = async (c: Comentariu) => {
    if (!editingCommentText.trim() || !c.id) return;
    setCommentSubmitting(true);
    try {
      await updateComentariu(c.id, editingCommentText.trim(), c.mentions);
      setEditingCommentId(null);
    } finally { setCommentSubmitting(false); }
  };

  const handleDeleteComment = async (id: string) => {
    await deleteComentariu(id);
  };

  const filteredMentionUsers = users.filter(u =>
    (u.name || u.email).toLowerCase().includes(mentionQuery.toLowerCase())
  ).slice(0, 6);

  const etichetaMap = Object.fromEntries(etichete.map(e => [e.id!, e]));

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600" />
      </div>
    );
  }

  if (!rec) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ReclamatiiNavbar />
        <div className="max-w-4xl mx-auto p-8 text-center">
          <p className="text-slate-500">Reclamația nu a fost găsită.</p>
          <button onClick={() => router.push('/reclamatii')} className="mt-4 text-rose-600 hover:underline text-sm">Înapoi la lista de reclamații</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ReclamatiiNavbar />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <button onClick={() => router.push('/reclamatii')}
            className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition flex-shrink-0 mt-0.5">
            <svg className="h-5 w-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-mono font-semibold text-slate-500">{rec.numar}</span>
              <span className={`inline-flex px-2.5 py-1 rounded text-xs font-semibold ${STATUS_COLORS[rec.status]}`}>{STATUS_LABELS[rec.status]}</span>
              <span className={`inline-flex px-2.5 py-1 rounded text-xs font-semibold ${URGENTA_COLORS[rec.urgenta]}`}>{URGENTA_LABELS[rec.urgenta]}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">{rec.numeClient}</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Creat {fmtDate(rec.createdAt)} de {rec.createdByEmail}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={copyStatusLink}
              className="px-3 py-2 text-xs font-medium border border-slate-300 bg-white rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied ? 'Copiat!' : 'Link client'}
            </button>
            <button onClick={() => setDeleteModal(true)}
              className="px-3 py-2 text-xs font-medium border border-red-200 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition">
              Ștergere
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Details card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-sm font-semibold text-slate-700">Detalii reclamație</h2>
              </div>
              <div className="p-6 space-y-5">
                {/* Client */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Nume client</label>
                    {editField === 'numeClient' ? (
                      <div className="flex gap-2">
                        <input value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus
                          className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500" />
                        <button onClick={() => save('numeClient', editValue)} disabled={saving}
                          className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 transition">OK</button>
                        <button onClick={() => setEditField(null)} className="px-3 py-1.5 text-xs text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition">X</button>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-900 cursor-pointer hover:text-rose-600 transition" onClick={() => { setEditField('numeClient'); setEditValue(rec.numeClient); }}>
                        {rec.numeClient}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Email client</label>
                    {editField === 'emailClient' ? (
                      <div className="flex gap-2">
                        <input type="email" value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus
                          className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500" />
                        <button onClick={() => save('emailClient', editValue)} disabled={saving}
                          className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 transition">OK</button>
                        <button onClick={() => setEditField(null)} className="px-3 py-1.5 text-xs text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition">X</button>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-900 cursor-pointer hover:text-rose-600 transition" onClick={() => { setEditField('emailClient'); setEditValue(rec.emailClient); }}>
                        {rec.emailClient}
                      </p>
                    )}
                  </div>
                </div>

                {/* Descriere */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Descriere problemă</label>
                  {editField === 'descriere' ? (
                    <div className="space-y-2">
                      <textarea rows={4} value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 resize-none" />
                      <div className="flex gap-2">
                        <button onClick={() => save('descriere', editValue)} disabled={saving}
                          className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 transition">Salvare</button>
                        <button onClick={() => setEditField(null)} className="px-3 py-1.5 text-xs text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition">Anulare</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-900 whitespace-pre-wrap cursor-pointer hover:text-rose-600 transition leading-relaxed"
                      onClick={() => { setEditField('descriere'); setEditValue(rec.descriere); }}>
                      {rec.descriere}
                    </p>
                  )}
                </div>

                {/* Info extra */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Informații suplimentare</label>
                  {editField === 'informatiiExtra' ? (
                    <div className="space-y-2">
                      <textarea rows={3} value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 resize-none" />
                      <div className="flex gap-2">
                        <button onClick={() => save('informatiiExtra', editValue)} disabled={saving}
                          className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 transition">Salvare</button>
                        <button onClick={() => setEditField(null)} className="px-3 py-1.5 text-xs text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition">Anulare</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 whitespace-pre-wrap cursor-pointer hover:text-rose-600 transition"
                      onClick={() => { setEditField('informatiiExtra'); setEditValue(rec.informatiiExtra || ''); }}>
                      {rec.informatiiExtra || <span className="italic text-slate-400">Necompletat — click pentru editare</span>}
                    </p>
                  )}
                </div>

                {/* Mesaj client */}
                <div className="border-t border-slate-100 pt-5">
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Mesaj pentru client <span className="text-slate-400">(vizibil pe pagina de status)</span>
                  </label>
                  {editField === 'informatiiClient' ? (
                    <div className="space-y-2">
                      <textarea rows={3} value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus
                        placeholder="Mesaj vizibil clientului pe pagina de status..."
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 resize-none" />
                      <div className="flex gap-2">
                        <button onClick={() => save('informatiiClient', editValue)} disabled={saving}
                          className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 transition">Salvare</button>
                        <button onClick={() => setEditField(null)} className="px-3 py-1.5 text-xs text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition">Anulare</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 whitespace-pre-wrap cursor-pointer hover:text-rose-600 transition"
                      onClick={() => { setEditField('informatiiClient'); setEditValue(rec.informatiiClient || ''); }}>
                      {rec.informatiiClient || <span className="italic text-slate-400">Niciun mesaj — click pentru editare</span>}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-sm font-semibold text-slate-700">Comentarii interne ({comentarii.length})</h2>
              </div>

              <div className="divide-y divide-slate-100">
                {comentarii.length === 0 && (
                  <div className="p-8 text-center text-sm text-slate-400">Niciun comentariu încă</div>
                )}
                {comentarii.map(c => (
                  <div key={c.id} className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 text-xs font-bold">
                        {(c.userNume || c.userEmail).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-900">{c.userNume || c.userEmail}</span>
                          <span className="text-xs text-slate-400">{fmtDate(c.createdAt)}</span>
                          {c.updatedAt && c.updatedAt !== c.createdAt && <span className="text-xs text-slate-300">(editat)</span>}
                        </div>
                        {editingCommentId === c.id ? (
                          <div className="space-y-2">
                            <textarea rows={3} value={editingCommentText} onChange={e => setEditingCommentText(e.target.value)} autoFocus
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 resize-none" />
                            <div className="flex gap-2">
                              <button onClick={() => handleEditComment(c)} disabled={commentSubmitting}
                                className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 transition">Salvare</button>
                              <button onClick={() => setEditingCommentId(null)} className="px-3 py-1.5 text-xs text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition">Anulare</button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{renderComment(c.continut)}</p>
                        )}
                      </div>
                      {c.userId === user?.uid && editingCommentId !== c.id && (
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => { setEditingCommentId(c.id!); setEditingCommentText(c.continut); }}
                            className="p-1.5 rounded hover:bg-slate-100 transition">
                            <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDeleteComment(c.id!)}
                            className="p-1.5 rounded hover:bg-red-50 transition">
                            <svg className="h-3.5 w-3.5 text-slate-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* New comment */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <div className="relative">
                  <textarea ref={commentRef} rows={3} value={newComment} onChange={handleCommentInput}
                    placeholder="Scrieți un comentariu intern... (folosiți @ pentru a menționa un utilizator)"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 resize-none bg-white" />
                  {mentionDropdown && filteredMentionUsers.length > 0 && (
                    <div className="absolute bottom-full mb-1 left-0 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                      {filteredMentionUsers.map(u => (
                        <button key={u.id} onClick={() => insertMention(u)}
                          className="w-full px-4 py-2 text-sm text-left hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg transition">
                          <span className="font-medium text-slate-900">{u.name || u.email}</span>
                          {u.name && <span className="text-slate-400 ml-1 text-xs">{u.email}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-2 flex justify-end">
                  <button onClick={handleSendComment} disabled={commentSubmitting || !newComment.trim()}
                    className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 disabled:opacity-50 transition">
                    {commentSubmitting ? 'Se trimite...' : 'Trimite comentariu'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-4">
            {/* Status */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Status</h3>
              <div className="space-y-2">
                {(Object.keys(STATUS_LABELS) as ReclamatieStatus[]).map(s => (
                  <button key={s} onClick={() => handleStatusChange(s)} disabled={saving}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${rec.status === s ? 'ring-2 ring-rose-500 bg-rose-50' : 'hover:bg-slate-50'}`}>
                    <span className={`inline-flex px-2.5 py-1 rounded text-xs font-semibold ${STATUS_COLORS[s]}`}>{STATUS_LABELS[s]}</span>
                    {rec.status === s && <svg className="h-4 w-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Urgență</h3>
              <div className="space-y-2">
                {(Object.keys(URGENTA_LABELS) as UrgentaNivel[]).map(u => (
                  <button key={u} onClick={() => handleUrgentaChange(u)} disabled={saving}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${rec.urgenta === u ? 'ring-2 ring-rose-500 bg-rose-50' : 'hover:bg-slate-50'}`}>
                    <span className={`inline-flex px-2.5 py-1 rounded text-xs font-semibold ${URGENTA_COLORS[u]}`}>{URGENTA_LABELS[u]}</span>
                    {rec.urgenta === u && <svg className="h-4 w-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignment */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Atribuit</h3>
              {rec.assignedToNume ? (
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                      {rec.assignedToNume.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-slate-700">{rec.assignedToNume}</span>
                  </div>
                  <button onClick={() => save('assignedTo', '')} className="text-xs text-slate-400 hover:text-red-500 transition">X</button>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic mb-3">Neatribuit</p>
              )}
              <select onChange={e => { if (e.target.value) handleAssign(e.target.value); e.target.value = ''; }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 bg-white text-slate-900">
                <option value="">Atribuie unui utilizator...</option>
                {users.filter(u => !rec.assignedTo || u.id !== rec.assignedTo).map(u => (
                  <option key={u.id} value={u.id}>{u.name || u.email}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Etichete</h3>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(rec.etichete || []).map(eid => etichetaMap[eid] && (
                  <TagBadge key={eid} eticheta={etichetaMap[eid]} size="sm" onRemove={() => handleTagToggle(eid)} />
                ))}
              </div>
              <select onChange={e => { if (e.target.value) handleTagToggle(e.target.value); e.target.value = ''; }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 bg-white text-slate-900">
                <option value="">+ Adaugă etichetă</option>
                {etichete.filter(e => !(rec.etichete || []).includes(e.id!)).map(e => (
                  <option key={e.id} value={e.id}>{e.nume}</option>
                ))}
              </select>
            </div>

            {/* Meta */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Informații</h3>
              <div className="text-xs text-slate-500 space-y-1.5">
                <div className="flex justify-between"><span>Creat</span><span className="font-mono">{fmtDate(rec.createdAt)}</span></div>
                <div className="flex justify-between"><span>Actualizat</span><span className="font-mono">{fmtDate(rec.updatedAt)}</span></div>
                <div className="flex justify-between"><span>De</span><span className="truncate ml-2 text-right">{rec.createdByEmail}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {deleteModal && (
        <ConfirmModal
          title="Ștergere reclamație"
          message={`Sigur doriți să ștergeți reclamația ${rec.numar}? Această acțiune este ireversibilă.`}
          confirmLabel="Ștergere"
          variant="danger"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal(false)}
        />
      )}
    </div>
  );
}
