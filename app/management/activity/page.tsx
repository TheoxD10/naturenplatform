'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getRecentActivities, Activity, getActivityIcon, getActivityColor } from '@/lib/activity';
import { format } from 'date-fns';

export default function ActivityPage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const canView = userRole === 'admin' || userRole === 'superior';

  useEffect(() => {
    if (!authLoading && (!user || !canView)) router.push('/management');
  }, [authLoading, user, canView, router]);

  useEffect(() => {
    if (user && canView) {
      setLoading(true);
      getRecentActivities(100).then(data => { setActivities(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [user, canView]);

  const filtered = filter === 'all' ? activities : activities.filter(a => a.type === filter);

  const activityTypes = [
    { value: 'all', label: 'Toate activitățile' },
    { value: 'report_created', label: 'Rapoarte create' },
    { value: 'report_updated', label: 'Rapoarte actualizate' },
    { value: 'email_sent', label: 'Email-uri trimise' },
    { value: 'user_created', label: 'Utilizatori creați' },
    { value: 'target_set', label: 'Target-uri setate' },
  ];

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <svg className="h-8 w-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!canView) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Jurnal activitate</h1>
          <p className="text-slate-500 text-sm">Urmăriți toate activitățile și modificările sistemului</p>
        </div>

        <div className="mb-6 bg-white rounded-xl shadow-sm p-4 border border-slate-200">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700">Filtrare tip:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 text-sm">
              {activityTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <div className="ml-auto text-sm text-slate-500">
              {filtered.length} {filtered.length === 1 ? 'activitate' : 'activități'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="mt-4 text-slate-500">Nicio activitate găsită</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filtered.map(activity => (
                <div key={activity.id} className="p-4 hover:bg-slate-50 transition">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)}`}>
                      <span className="text-base">{getActivityIcon(activity.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{activity.description}</p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {activity.userName}
                            </span>
                            {activity.metadata?.showroomLocation && (
                              <span className="flex items-center gap-1">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {activity.metadata.showroomLocation}
                              </span>
                            )}
                          </div>
                          {activity.metadata?.oldValue && activity.metadata?.newValue && (
                            <div className="mt-2 flex items-center gap-2 text-xs">
                              <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-mono">{activity.metadata.oldValue}</span>
                              <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded font-mono">{activity.metadata.newValue}</span>
                            </div>
                          )}
                        </div>
                        <span className="flex-shrink-0 text-xs text-slate-500 font-mono">
                          {format(activity.timestamp.toDate(), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {activity.metadata.amount && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                              {activity.metadata.amount} RON
                            </span>
                          )}
                          {activity.metadata.emailTo && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              {activity.metadata.recipientCount || 1} destinatar(i)
                            </span>
                          )}
                          {activity.metadata.targetUserEmail && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {activity.metadata.targetUserEmail}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
