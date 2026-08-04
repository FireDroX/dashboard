import { Link } from 'react-router';
import type { Monitor } from '../types/monitor';
import StatusBadge from './StatusBadge';

interface MonitorCardProps {
  monitor: Monitor;
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
  isChecking,
  onCheck,
  onDelete,
}: MonitorCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-slate-950">
              {monitor.name}
            </h3>
            <a
              href={monitor.url}
              target="_blank"
              rel="noreferrer"
              className="mt-0.5 block truncate text-xs text-slate-500 transition hover:text-blue-600"
            >
              {monitor.url}
            </a>
          </div>
          <StatusBadge status={monitor.status} />
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs font-medium text-slate-500">
              Temps de réponse
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-slate-900">
              {monitor.responseTime === null
                ? '—'
                : `${monitor.responseTime} ms`}
            </dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs font-medium text-slate-500">Code HTTP</dt>
            <dd className="mt-0.5 text-sm font-semibold text-slate-900">
              {monitor.statusCode ?? '—'}
            </dd>
          </div>
          <div className="col-span-2 rounded-lg bg-slate-50 p-3">
            <dt className="text-xs font-medium text-slate-500">
              Dernière vérification
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-slate-900">
              {formatLastCheck(monitor.lastCheckedAt)}
            </dd>
          </div>
        </dl>

        {monitor.lastError && (
          <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
            {monitor.lastError}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-2.5">
        <button
          type="button"
          disabled={isChecking}
          onClick={onCheck}
          className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isChecking ? 'Vérification…' : 'Vérifier'}
        </button>
        <Link
          to={`/monitors/${monitor.id}/edit`}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
        >
          Modifier
        </Link>
        <button
          type="button"
          aria-label={`Supprimer ${monitor.name}`}
          onClick={onDelete}
          className="ml-auto grid size-7 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
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
    </article>
  );
}

export default MonitorCard;
