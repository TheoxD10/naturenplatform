import { adminDb } from '@/lib/firebase-admin';
import { Reclamatie, STATUS_LABELS } from '@/lib/reclamatii';

const STATUS_STEPS: { key: string; label: string }[] = [
  { key: 'noua', label: 'Înregistrată' },
  { key: 'in_lucru', label: 'În lucru' },
  { key: 'rezolvata', label: 'Rezolvată' },
  { key: 'inchisa', label: 'Închisă' },
];

async function getByToken(token: string): Promise<Reclamatie | null> {
  const snap = await adminDb
    .collection('reclamatii')
    .where('tokenAcces', '==', token)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as unknown as Reclamatie;
}

export default async function StatusPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const rec = await getByToken(token);

  if (!rec) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <svg className="mx-auto h-14 w-14 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Reclamație negăsită</h1>
          <p className="text-sm text-slate-500">Linkul poate fi invalid sau reclamația a fost ștearsă.</p>
        </div>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.findIndex(s => s.key === rec.status);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full overflow-hidden">
        <div className="bg-gradient-to-r from-rose-600 to-rose-500 px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <svg className="h-6 w-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-white/80 text-sm font-medium">Naturen — Status reclamație</span>
          </div>
          <p className="text-white text-xs font-mono opacity-70">{rec.numar}</p>
          <h1 className="text-xl font-bold text-white mt-1">{rec.numeClient}</h1>
        </div>

        <div className="p-8">
          {/* Progress */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Progres</p>
            <div className="relative">
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200" />
              <div
                className="absolute top-4 left-4 h-0.5 bg-rose-500 transition-all"
                style={{ width: currentStep <= 0 ? '0%' : `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
              />
              <div className="relative flex justify-between">
                {STATUS_STEPS.map((step, i) => (
                  <div key={step.key} className="flex flex-col items-center">
                    <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center z-10 ${
                      i <= currentStep ? 'bg-rose-600 border-rose-600' : 'bg-white border-slate-300'
                    }`}>
                      {i < currentStep ? (
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className={`text-xs font-bold ${i === currentStep ? 'text-white' : 'text-slate-400'}`}>{i + 1}</span>
                      )}
                    </div>
                    <span className={`mt-2 text-xs font-medium text-center ${i <= currentStep ? 'text-rose-600' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Client message */}
          {rec.informatiiClient && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Mesaj de la echipa noastră</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{rec.informatiiClient}</p>
            </div>
          )}

          <div className="space-y-0 text-sm divide-y divide-slate-100">
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-500">Client</span>
              <span className="text-slate-900 font-medium">{rec.numeClient}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-500">Status curent</span>
              <span className="text-rose-600 font-semibold">
                {STATUS_STEPS.find(s => s.key === rec.status)?.label}
              </span>
            </div>
            {(rec.createdAt as any)?.toDate && (
              <div className="flex justify-between items-center py-3">
                <span className="text-slate-500">Data înregistrării</span>
                <span className="text-slate-900 font-mono text-xs">
                  {new Date((rec.createdAt as any).toDate()).toLocaleDateString('ro-RO', { dateStyle: 'long' })}
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 text-center mt-8">
            Naturen · Această pagină este accesibilă publicului prin linkul securizat trimis pe email.
          </p>
        </div>
      </div>
    </div>
  );
}
