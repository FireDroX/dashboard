import type { MonitorStatus } from '../types/monitor';

interface StatusBadgeProps {
  status: MonitorStatus;
}

const statusStyles: Record<
  MonitorStatus,
  { label: string; badge: string; dot: string }
> = {
  ONLINE: {
    label: 'En ligne',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    dot: 'bg-emerald-500',
  },
  OFFLINE: {
    label: 'Hors ligne',
    badge: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    dot: 'bg-rose-500',
  },
  UNKNOWN: {
    label: 'En attente',
    badge: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    dot: 'bg-amber-500',
  },
};

function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${style.badge}`}
    >
      <span className={`size-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

export default StatusBadge;
