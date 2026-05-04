'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Task, TaskStatus, TaskPriority,
  createTask, getAllTasks, getMyTasks, updateTask, deleteTask,
} from '@/lib/tasks';
import { getUserData } from '@/lib/userRoles';
import { format } from 'date-fns';

interface UserRecord {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface TaskForm {
  title: string;
  description: string;
  assignedTo: string;
  priority: TaskPriority;
  dueDate: string;
  estimatedHours: string;
  status: TaskStatus;
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; pill: string; dot: string }> = {
  scazuta: { label: 'Scăzută', pill: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  medie:   { label: 'Medie',   pill: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  ridicata:{ label: 'Ridicată',pill: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  urgenta: { label: 'Urgentă', pill: 'bg-red-100 text-red-700',     dot: 'bg-red-500' },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; pill: string }> = {
  de_facut:  { label: 'De făcut',  pill: 'bg-slate-100 text-slate-600' },
  in_lucru:  { label: 'În lucru',  pill: 'bg-indigo-100 text-indigo-700' },
  finalizata:{ label: 'Finalizată',pill: 'bg-green-100 text-green-700' },
  expirata:  { label: 'Expirată',  pill: 'bg-red-100 text-red-700' },
};

function getTimeRemaining(dueDate: Timestamp, now: Date) {
  const due = dueDate.toDate();
  const diff = due.getTime() - now.getTime();

  if (diff <= 0) {
    const abs = Math.abs(diff);
    const h = Math.floor(abs / 3_600_000);
    const d = Math.floor(h / 24);
    return { text: d > 0 ? `Expirat cu ${d}z ${h % 24}h` : `Expirat cu ${h}h`, overdue: true, urgent: false };
  }

  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const d = Math.floor(h / 24);

  if (d >= 1) return { text: `${d}z ${h % 24}h rămase`, overdue: false, urgent: d < 2 };
  if (h > 0)  return { text: `${h}h ${m}m rămase`,      overdue: false, urgent: true };
  return       { text: `${m}m rămase`,                   overdue: false, urgent: true };
}

const FullSpinner = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50">
    <svg className="h-8 w-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  </div>
);

const emptyForm = (): TaskForm => ({
  title: '', description: '', assignedTo: '', priority: 'medie',
  dueDate: '', estimatedHours: '', status: 'de_facut',
});

export default function TasksPage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();

  const isManager = userRole === 'admin' || userRole === 'superior';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<'all' | 'mine'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [currentUserName, setCurrentUserName] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (user) getUserData(user.uid).then(d => setCurrentUserName(d?.name || user.email || ''));
  }, [user]);

  const loadTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = isManager ? await getAllTasks() : await getMyTasks(user.uid);
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user, isManager]);

  useEffect(() => {
    if (user) loadTasks();
  }, [user, loadTasks]);

  useEffect(() => {
    if (user && isManager) {
      getDocs(collection(db, 'users')).then(snap => {
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })) as UserRecord[]);
      });
    }
  }, [user, isManager]);

  const effectiveTasks = isManager && viewMode === 'mine'
    ? tasks.filter(t => t.assignedTo === user?.uid)
    : tasks;

  const filteredTasks = effectiveTasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (isManager && viewMode === 'all' && assigneeFilter !== 'all' && t.assignedTo !== assigneeFilter) return false;
    return true;
  });

  const counts = {
    de_facut:   tasks.filter(t => t.status === 'de_facut').length,
    in_lucru:   tasks.filter(t => t.status === 'in_lucru').length,
    finalizata: tasks.filter(t => t.status === 'finalizata').length,
    expirata:   tasks.filter(t => t.status === 'expirata').length,
  };

  const openCreate = () => {
    setEditingTask(null);
    setForm(emptyForm());
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo,
      priority: task.priority,
      dueDate: format(task.dueDate.toDate(), "yyyy-MM-dd'T'HH:mm"),
      estimatedHours: task.estimatedHours?.toString() ?? '',
      status: task.status,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleStatusUpdate = async (task: Task, newStatus: TaskStatus) => {
    const updates: Partial<Task> = { status: newStatus };
    if (newStatus === 'finalizata') updates.completedAt = Timestamp.now();
    await updateTask(task.id!, updates);
    await loadTasks();
  };

  const handleDelete = async (task: Task) => {
    if (!confirm(`Ștergeți sarcina "${task.title}"?`)) return;
    await deleteTask(task.id!);
    await loadTasks();
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { setFormError('Titlul este obligatoriu.'); return; }
    if (!form.assignedTo)   { setFormError('Selectați un utilizator.'); return; }
    if (!form.dueDate)      { setFormError('Data limită este obligatorie.'); return; }

    setSaving(true);
    setFormError('');
    try {
      const assignedUser = users.find(u => u.id === form.assignedTo);
      const base = {
        title: form.title.trim(),
        description: form.description.trim(),
        assignedTo: form.assignedTo,
        assignedToName: assignedUser?.name || assignedUser?.email || '',
        assignedToEmail: assignedUser?.email || '',
        priority: form.priority,
        dueDate: Timestamp.fromDate(new Date(form.dueDate)),
        ...(form.estimatedHours !== '' ? { estimatedHours: parseFloat(form.estimatedHours) } : {}),
      };

      if (editingTask) {
        await updateTask(editingTask.id!, { ...base, status: form.status });
      } else {
        const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
          ...base,
          assignedBy: user!.uid,
          assignedByName: currentUserName,
          status: 'de_facut',
        };
        await createTask(taskData);
      }

      await loadTasks();
      setModalOpen(false);
    } catch (e) {
      setFormError('Eroare la salvare. Verificați conexiunea.');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) return <FullSpinner />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sarcini</h1>
            <p className="mt-1 text-sm text-slate-500">
              {isManager ? 'Gestionați și atribuiți sarcini echipei' : 'Sarcinile atribuite vouă'}
            </p>
          </div>
          {isManager && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Sarcină nouă
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'De făcut',   count: counts.de_facut,   color: 'text-slate-700',  bg: 'bg-white border-slate-200' },
            { label: 'În lucru',   count: counts.in_lucru,   color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
            { label: 'Finalizate', count: counts.finalizata, color: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
            { label: 'Expirate',   count: counts.expirata,   color: 'text-red-700',    bg: 'bg-red-50 border-red-200' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border p-4 shadow-sm ${s.bg}`}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {isManager && (
            <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              {(['all', 'mine'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 text-sm font-medium transition ${
                    viewMode === mode ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {mode === 'all' ? 'Toate sarcinile' : 'Sarcinile mele'}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {(['all', 'de_facut', 'in_lucru', 'finalizata', 'expirata'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 text-sm font-medium transition ${
                  statusFilter === s ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {s === 'all' ? 'Toate' : STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>

          {isManager && viewMode === 'all' && users.length > 0 && (
            <select
              value={assigneeFilter}
              onChange={e => setAssigneeFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Toți utilizatorii</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name || u.email}</option>
              ))}
            </select>
          )}

          <div className="ml-auto text-sm text-slate-500">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'sarcină' : 'sarcini'}
          </div>
        </div>

        {/* Task grid */}
        {filteredTasks.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mt-4 text-slate-500">Nicio sarcină găsită</p>
            {isManager && (
              <button onClick={openCreate} className="mt-3 text-sm font-medium text-indigo-600 hover:underline">
                Creați prima sarcină
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map(task => {
              const pCfg = PRIORITY_CONFIG[task.priority];
              const sCfg = STATUS_CONFIG[task.status];
              const timeInfo = getTimeRemaining(task.dueDate, now);
              const isDone = task.status === 'finalizata';
              const canEdit = isManager;
              const canChangeStatus = !isDone && (isManager || task.assignedTo === user?.uid);

              return (
                <div key={task.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                  {/* Badges + actions */}
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${pCfg.pill}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${pCfg.dot}`} />
                        {pCfg.label}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${sCfg.pill}`}>
                        {sCfg.label}
                      </span>
                      {!isDone && timeInfo.overdue && (
                        <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                          Expirat
                        </span>
                      )}
                    </div>
                    {canEdit && (
                      <div className="flex flex-shrink-0 items-center gap-1">
                        <button
                          onClick={() => openEdit(task)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                          title="Editare"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(task)}
                          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Ștergere"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Title & description */}
                  <h3 className={`text-base font-semibold leading-snug ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{task.description}</p>
                  )}

                  {/* Meta */}
                  <div className="mt-auto space-y-2 border-t border-slate-100 pt-3 mt-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                        {(task.assignedToName || task.assignedToEmail || '?').charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate text-xs font-medium text-slate-700">
                        {task.assignedToName || task.assignedToEmail}
                      </span>
                      <span className="flex-shrink-0 text-xs text-slate-400">· {task.assignedByName}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {format(task.dueDate.toDate(), 'dd/MM/yyyy HH:mm')}
                      </div>
                      {!isDone && (
                        <span className={`flex-shrink-0 text-xs font-medium ${
                          timeInfo.overdue ? 'text-red-600' : timeInfo.urgent ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                          {timeInfo.text}
                        </span>
                      )}
                    </div>

                    {task.estimatedHours && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {task.estimatedHours}h estimate
                      </div>
                    )}

                    {task.completedAt && (
                      <div className="flex items-center gap-1.5 text-xs text-green-600">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Finalizat la {format(task.completedAt.toDate(), 'dd/MM/yyyy HH:mm')}
                      </div>
                    )}
                  </div>

                  {/* Status actions */}
                  {canChangeStatus && (
                    <div className="mt-3 flex gap-2">
                      {task.status === 'de_facut' && (
                        <button
                          onClick={() => handleStatusUpdate(task, 'in_lucru')}
                          className="flex-1 rounded-lg border border-indigo-200 bg-indigo-50 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                        >
                          Pornire
                        </button>
                      )}
                      {task.status === 'in_lucru' && (
                        <button
                          onClick={() => handleStatusUpdate(task, 'finalizata')}
                          className="flex-1 rounded-lg border border-green-200 bg-green-50 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100 transition"
                        >
                          Finalizare
                        </button>
                      )}
                      {isManager && (task.status === 'de_facut' || task.status === 'in_lucru') && (
                        <button
                          onClick={() => handleStatusUpdate(task, 'expirata')}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                        >
                          Expirat
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingTask ? 'Editare sarcină' : 'Sarcină nouă'}
              </h2>
            </div>

            <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
              {/* Title */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Titlu *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Actualizare ofertă client X"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Descriere</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Detalii suplimentare despre sarcină..."
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Assign to */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Atribuit la *</label>
                <select
                  value={form.assignedTo}
                  onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Selectați un utilizator...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name ? `${u.name} (${u.email})` : u.email} — {u.role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority + Estimated hours */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Prioritate</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value as TaskPriority }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="scazuta">Scăzută</option>
                    <option value="medie">Medie</option>
                    <option value="ridicata">Ridicată</option>
                    <option value="urgenta">Urgentă</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Ore estimate</label>
                  <input
                    type="number"
                    value={form.estimatedHours}
                    onChange={e => setForm(f => ({ ...f, estimatedHours: e.target.value }))}
                    min="0.5"
                    step="0.5"
                    placeholder="Ex: 2.5"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Due date */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Dată limită *</label>
                <input
                  type="datetime-local"
                  value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Status (edit only) */}
              {editingTask && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as TaskStatus }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="de_facut">De făcut</option>
                    <option value="in_lucru">În lucru</option>
                    <option value="finalizata">Finalizată</option>
                    <option value="expirata">Expirată</option>
                  </select>
                </div>
              )}

              {formError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Anulare
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {saving ? 'Se salvează...' : editingTask ? 'Salvare modificări' : 'Creare sarcină'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
