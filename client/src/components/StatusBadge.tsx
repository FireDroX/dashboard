import type { MonitorStatus } from '../types/monitor';

interface StatusBadgeProps {
  status: MonitorStatus;
}

const statusStyles: Record<
  MonitorStatus,
  { label: string; badge: string; dot: string }
> = {
  ONLINE: {
    label: 'Online',
    badge: 'border-emerald-400/35 bg-emerald-400/10 text-emerald-300',
    dot: 'bg-emerald-300 text-emerald-300',
  },
  OFFLINE: {
    label: 'Offline',
    badge: 'border-rose-400/40 bg-rose-400/10 text-rose-300',
    dot: 'bg-rose-300 text-rose-300',
  },
  UNKNOWN: {
    label: 'Pending',
    badge: 'border-yellow-300/40 bg-yellow-300/10 text-yellow-200',
    dot: 'bg-yellow-200 text-yellow-200',
  },
};

function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status];

  return (
    <span
      className={`cyber-cut inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[10px] font-bold tracking-[0.12em] uppercase ${style.badge}`}
    >
      <span className={`cyber-pulse size-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

export default StatusBadge;
