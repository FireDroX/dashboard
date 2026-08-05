import { Link } from 'react-router';
import type { Monitor } from '../types/monitor';
import StatusBadge from './StatusBadge';

interface MonitorCardProps {
  monitor: Monitor;
  canManage: boolean;
  isChecking: boolean;
  onCheck: () => void;
  onDelete: () => void;
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function formatLastCheck(lastCheckedAt: string | null) {
  if (!lastCheckedAt) {
    return 'Jamais vérifié';
  }

  return dateFormatter.format(new Date(lastCheckedAt));
}

function MonitorCard({
  monitor,
  canManage,
  isChecking,
  onCheck,
  onDelete,
}: MonitorCardProps) {
  return (
    <article className="cyber-panel group overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400/55 hover:shadow-[0_18px_45px_rgba(0,240,255,0.07)]">
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between border-b border-slate-700/55 pb-2 font-mono text-[9px] tracking-[0.16em] text-slate-500 uppercase">
          <span>Node_{String(monitor.id).padStart(4, '0')}</span>
          <span className="text-cyan-400/70">HTTP_MONITOR</span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold tracking-wide text-slate-50 uppercase">
              {monitor.name}
            </h3>
            <a
              href={monitor.url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block truncate font-mono text-[11px] text-cyan-300/65 transition hover:text-cyan-200"
            >
              {monitor.url}
            </a>
          </div>
          <StatusBadge status={monitor.status} />
        </div>

        <dl className="cyber-stat-grid mt-4 grid grid-cols-2 gap-px border border-slate-700/65 bg-slate-700/65">
          <div className="bg-[#081019] p-2.5">
            <dt className="cyber-label">Temps de réponse</dt>
            <dd className="mt-1 font-mono text-sm font-bold text-cyan-100">
              {monitor.responseTime === null
                ? '—'
                : `${monitor.responseTime} ms`}
            </dd>
          </div>
          <div className="bg-[#081019] p-2.5">
            <dt className="cyber-label">Code HTTP</dt>
            <dd className="mt-1 font-mono text-sm font-bold text-cyan-100">
              {monitor.statusCode ?? '—'}
            </dd>
          </div>
          <div className="col-span-2 bg-[#081019] p-2.5">
            <dt className="cyber-label">Dernière vérification</dt>
            <dd className="mt-1 font-mono text-xs font-semibold text-slate-200">
              {formatLastCheck(monitor.lastCheckedAt)}
            </dd>
          </div>
        </dl>

        {monitor.lastError && (
          <p className="cyber-alert mt-2 px-3 py-2 text-xs">
            <span className="mr-2 font-bold">ERR://</span>
            {monitor.lastError}
          </p>
        )}
      </div>

      {canManage && (
        <div className="flex items-center gap-2 border-t border-slate-700/70 bg-black/25 px-4 py-2.5">
          <button
            type="button"
            disabled={isChecking}
            onClick={onCheck}
            className="cyber-button min-h-8 px-3 py-1.5"
          >
            {isChecking ? 'Vérification…' : 'Vérifier'}
          </button>
          <Link
            to={`/monitors/${monitor.id}/edit`}
            className="cyber-button cyber-button--ghost min-h-8 px-3 py-1.5"
          >
            Modifier
          </Link>
          <button
            type="button"
            aria-label={`Supprimer ${monitor.name}`}
            onClick={onDelete}
            className="cyber-icon-button ml-auto"
          >
            <svg
              aria-hidden="true"
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.35 9m-4.78 0-.35-9m9.97-3.21c.35.05.7.1 1.04.16m-1.04-.16L18.16 19.67A2.25 2.25 0 0 1 15.92 21H8.08a2.25 2.25 0 0 1-2.24-1.33L4.77 5.79m14.46 0a48.1 48.1 0 0 0-3.48-.4m-10.98.4c-.35.05-.7.1-1.04.16m1.04-.16a48.1 48.1 0 0 1 3.48-.4m7.5 0V4.48c0-1.18-.91-2.16-2.09-2.2a52 52 0 0 0-3.32 0c-1.18.04-2.09 1.02-2.09 2.2v.91m7.5 0a48.7 48.7 0 0 0-7.5 0"
              />
            </svg>
          </button>
        </div>
      )}
    </article>
  );
}

export default MonitorCard;
