interface SummaryCardProps {
  label: string;
  value: number | string;
  tone?: 'neutral' | 'success' | 'danger' | 'warning' | 'info';
}

const toneStyles = {
  neutral: {
    panel: '[--panel-accent:#78909c]',
    icon: 'border-slate-500/40 bg-slate-500/10 text-slate-300',
    value: 'text-slate-100',
  },
  success: {
    panel: '[--panel-accent:#65ff9a]',
    icon: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
    value: 'text-emerald-300',
  },
  danger: {
    panel: '[--panel-accent:#ff2a6d]',
    icon: 'border-rose-400/40 bg-rose-400/10 text-rose-300',
    value: 'text-rose-300',
  },
  warning: {
    panel: '[--panel-accent:#fcee0a]',
    icon: 'border-yellow-300/40 bg-yellow-300/10 text-yellow-200',
    value: 'text-yellow-200',
  },
  info: {
    panel: '[--panel-accent:#00f0ff]',
    icon: 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200',
    value: 'text-cyan-200',
  },
};

function SummaryCard({ label, value, tone = 'neutral' }: SummaryCardProps) {
  const style = toneStyles[tone];

  return (
    <article className={`cyber-panel p-3.5 ${style.panel}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="cyber-label">{label}</p>
          <p
            className={`mt-1 font-mono text-2xl font-black tracking-tight ${style.value}`}
          >
            {value}
          </p>
        </div>
        <span
          aria-hidden="true"
          className={`cyber-cut grid size-8 shrink-0 place-items-center border ${style.icon}`}
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
