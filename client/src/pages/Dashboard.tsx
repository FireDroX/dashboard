import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import ConfirmModal from '../components/ConfirmModal';
import MonitorCard from '../components/MonitorCard';
import SummaryCard from '../components/SummaryCard';
import {
  checkMonitor,
  deleteMonitor,
  getApiErrorMessage,
  getMonitors,
} from '../services/monitorApi';
import type { Monitor } from '../types/monitor';

function Dashboard() {
  const queryClient = useQueryClient();
  const [monitorToDelete, setMonitorToDelete] = useState<Monitor | null>(null);

  const monitorsQuery = useQuery({
    queryKey: ['monitors'],
    queryFn: getMonitors,
    refetchInterval: 30_000,
  });

  const checkMutation = useMutation({
    mutationFn: checkMonitor,
    onSuccess: async (checkedMonitor) => {
      queryClient.setQueryData<Monitor[]>(['monitors'], (currentMonitors) =>
        currentMonitors?.map((monitor) =>
          monitor.id === checkedMonitor.id ? checkedMonitor : monitor,
        ),
      );

      await queryClient.invalidateQueries({ queryKey: ['monitors'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMonitor,
    onSuccess: async (_, deletedMonitorId) => {
      queryClient.setQueryData<Monitor[]>(['monitors'], (currentMonitors) =>
        currentMonitors?.filter((monitor) => monitor.id !== deletedMonitorId),
      );
      setMonitorToDelete(null);

      await queryClient.invalidateQueries({ queryKey: ['monitors'] });
    },
  });

  const monitors = monitorsQuery.data ?? [];
  const isLoading = monitorsQuery.isPending;
  const error = monitorsQuery.isError
    ? getApiErrorMessage(
        monitorsQuery.error,
        'Impossible de récupérer les services depuis l’API.',
      )
    : null;

  const onlineCount = monitors.filter(
    (monitor) => monitor.status === 'ONLINE',
  ).length;
  const offlineCount = monitors.filter(
    (monitor) => monitor.status === 'OFFLINE',
  ).length;
  const notCheckedCount = monitors.filter(
    (monitor) => monitor.status === 'UNKNOWN',
  ).length;

  const measuredMonitors = monitors.filter(
    (monitor) => monitor.responseTime !== null,
  );

  const averageResponseTime =
    measuredMonitors.length === 0
      ? null
      : Math.round(
          measuredMonitors.reduce(
            (total, monitor) => total + (monitor.responseTime ?? 0),
            0,
          ) / measuredMonitors.length,
        );

  const checkError = checkMutation.isError
    ? getApiErrorMessage(
        checkMutation.error,
        'Impossible de vérifier ce service.',
      )
    : null;

  function openDeleteModal(monitor: Monitor) {
    deleteMutation.reset();
    setMonitorToDelete(monitor);
  }

  function closeDeleteModal() {
    if (!deleteMutation.isPending) {
      setMonitorToDelete(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-slate-950 text-white shadow-sm">
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
                  d="M3 12h4l2.2-6 4.2 12 2.2-6H21"
                />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight">
                Service Monitor
              </p>
              <p className="text-[11px] text-slate-500">Tableau de bord</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
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

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-blue-600">
              Vue d'ensemble
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              État des services
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-5 text-slate-600">
              Consultez rapidement la disponibilité et les performances de vos
              services.
            </p>
          </div>
          <Link
            to="/monitors/new"
            className="rounded-lg bg-slate-950 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Ajouter un service
          </Link>
        </div>

        <section
          aria-label="Résumé des services"
          className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5"
        >
          <SummaryCard label="Services suivis" value={monitors.length} />
          <SummaryCard label="En ligne" value={onlineCount} tone="success" />
          <SummaryCard label="Hors ligne" value={offlineCount} tone="danger" />
          <SummaryCard
            label="Non vérifiés"
            value={notCheckedCount}
            tone="warning"
          />
          <SummaryCard
            label="Temps moyen"
            value={
              averageResponseTime === null ? '—' : `${averageResponseTime} ms`
            }
            tone="info"
          />
        </section>

        <section aria-labelledby="services-title">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2
                id="services-title"
                className="text-lg font-semibold tracking-tight text-slate-950"
              >
                Vos services
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {isLoading
                  ? 'Chargement des données…'
                  : 'Données récupérées depuis l’API'}
              </p>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-sm">
              {monitors.length} services
            </span>
          </div>

          {checkError && (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700"
            >
              {checkError}
            </p>
          )}

          {isLoading && (
            <div
              aria-live="polite"
              className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
            >
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm"
                />
              ))}
              <span className="sr-only">Chargement des services</span>
            </div>
          )}

          {!isLoading && error && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-8 text-center"
            >
              <p className="font-semibold text-rose-800">{error}</p>
              <p className="mt-2 text-sm text-rose-700">
                Vérifiez que le serveur NestJS est démarré sur le port 3000.
              </p>
            </div>
          )}

          {!isLoading && !error && monitors.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center">
              <p className="font-semibold text-slate-800">
                Aucun service à afficher
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Les services ajoutés apparaîtront ici.
              </p>
            </div>
          )}

          {!isLoading && !error && monitors.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {monitors.map((monitor) => (
                <MonitorCard
                  key={monitor.id}
                  monitor={monitor}
                  isChecking={
                    checkMutation.isPending &&
                    checkMutation.variables === monitor.id
                  }
                  onCheck={() => checkMutation.mutate(monitor.id)}
                  onDelete={() => openDeleteModal(monitor)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {monitorToDelete && (
        <ConfirmModal
          monitorName={monitorToDelete.name}
          isDeleting={deleteMutation.isPending}
          errorMessage={
            deleteMutation.isError
              ? getApiErrorMessage(
                  deleteMutation.error,
                  'Impossible de supprimer ce service.',
                )
              : null
          }
          onCancel={closeDeleteModal}
          onConfirm={() => deleteMutation.mutate(monitorToDelete.id)}
        />
      )}
    </div>
  );
}

export default Dashboard;
