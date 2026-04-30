import { Eticheta } from '@/lib/etichete';

interface Props {
  eticheta: Eticheta;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

export default function TagBadge({ eticheta, onRemove, size = 'md' }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'}`}
      style={{
        backgroundColor: `${eticheta.culoare}20`,
        color: eticheta.culoare,
        border: `1px solid ${eticheta.culoare}50`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: eticheta.culoare }} />
      <span className="truncate max-w-[120px]">{eticheta.nume}</span>
      {onRemove && (
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="hover:opacity-60 ml-0.5 flex-shrink-0">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
