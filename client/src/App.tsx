import { useEffect, useState } from 'react';
import MonitorCard from './components/MonitorCard';
import SummaryCard from './components/SummaryCard';
import { getMonitors } from './services/monitorApi';
import type { Monitor } from './types/monitor';

function App() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadMonitors() {
      try {
        const data = await getMonitors();

        if (!isCancelled) {
          setMonitors(data);
        }
      } catch {
        if (!isCancelled) {
          setError('Impossible de récupérer les services depuis l’API.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadMonitors();

    return () => {
      isCancelled = true;
    };
  }, []);

  const onlineCount = monitors.filter(
    (monitor) => monitor.status === 'ONLINE',
  ).length;
  const offlineCount = monitors.filter(
    (monitor) => monitor.status === 'OFFLINE',
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-slate-950 text-white shadow-sm">
              <svg
                aria-hidden="true"
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12h4l2.2-6 4.2 12 2.2-6H21"
                />
              </svg>
            </span>
            <div>
              <p className="font-semibold tracking-tight">Service Monitor</p>
              <p className="text-xs text-slate-500">Tableau de bord</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
            <span
              className={`size-2 rounded-full ${
                error
                  ? 'bg-rose-500'
                  : isLoading
                    ? 'animate-pulse bg-amber-500'
                    : 'bg-emerald-500'
              }`}
            />
            {error
              ? 'API indisponible'
              : isLoading
                ? 'Connexion à l’API'
                : 'Surveillance active'}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-blue-600">Vue d'ensemble</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            État des services
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Consultez rapidement la disponibilité et les performances de vos
            services.
          </p>
        </div>

        <section
          aria-label="Résumé des services"
          className="mb-10 grid gap-4 sm:grid-cols-3"
        >
          <SummaryCard label="Services suivis" value={monitors.length} />
          <SummaryCard label="En ligne" value={onlineCount} tone="success" />
          <SummaryCard label="Hors ligne" value={offlineCount} tone="danger" />
        </section>

        <section aria-labelledby="services-title">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2
                id="services-title"
                className="text-xl font-semibold tracking-tight text-slate-950"
              >
                Vos services
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {isLoading
                  ? 'Chargement des données…'
                  : 'Données récupérées depuis l’API'}
              </p>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
              {monitors.length} services
            </span>
          </div>

          {isLoading && (
            <div
              aria-live="polite"
              className="grid gap-5 lg:grid-cols-2"
            >
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm"
                />
              ))}
              <span className="sr-only">Chargement des services</span>
            </div>
          )}

          {!isLoading && error && (
            <div
              role="alert"
              className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center"
            >
              <p className="font-semibold text-rose-800">{error}</p>
              <p className="mt-2 text-sm text-rose-700">
                Vérifiez que le serveur NestJS est démarré sur le port 3000.
              </p>
            </div>
          )}

          {!isLoading && !error && monitors.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <p className="font-semibold text-slate-800">
                Aucun service à afficher
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Les services ajoutés apparaîtront ici.
              </p>
            </div>
          )}

          {!isLoading && !error && monitors.length > 0 && (
            <div className="grid gap-5 lg:grid-cols-2">
              {monitors.map((monitor) => (
                <MonitorCard key={monitor.id} monitor={monitor} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
