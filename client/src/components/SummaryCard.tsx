interface SummaryCardProps {
  label: string;
  value: number | string;
  tone?: 'neutral' | 'success' | 'danger' | 'warning' | 'info';
}

const toneStyles = {
  neutral: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-50 text-emerald-700',
  danger: 'bg-rose-50 text-rose-700',
  warning: 'bg-amber-50 text-amber-700',
  info: 'bg-blue-50 text-blue-700',
};

function SummaryCard({ label, value, tone = 'neutral' }: SummaryCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <span
          aria-hidden="true"
          className={`grid size-9 shrink-0 place-items-center rounded-lg ${toneStyles[tone]}`}
        >
          <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 19V9m5 10V5m5 14v-7m5 7V8"
            />
          </svg>
        </span>
      </div>
    </article>
  );
}

export default SummaryCard;
