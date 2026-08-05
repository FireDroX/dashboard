import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import ConfirmModal from '../components/ConfirmModal';
import MonitorCard from '../components/MonitorCard';
import SummaryCard from '../components/SummaryCard';
import { getApiErrorMessage } from '../services/apiClient';
import {
  authSessionQueryKey,
  getAuthSession,
  logout,
} from '../services/authApi';
import {
  checkAllMonitors,
  checkMonitor,
  deleteMonitor,
  getMonitors,
} from '../services/monitorApi';
import type { Monitor } from '../types/monitor';

function Dashboard() {
  const queryClient = useQueryClient();
  const [monitorToDelete, setMonitorToDelete] = useState<Monitor | null>(null);

  const sessionQuery = useQuery({
    queryKey: authSessionQueryKey,
    queryFn: getAuthSession,
    retry: false,
  });

  const monitorsQuery = useQuery({
    queryKey: ['monitors'],
    queryFn: getMonitors,
    refetchInterval: 30_000,
  });

  const checkAllMutation = useMutation({
    mutationFn: checkAllMonitors,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['monitors'] });
    },
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

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: (session) => {
      queryClient.setQueryData(authSessionQueryKey, session);
      setMonitorToDelete(null);
    },
  });

  const monitors = monitorsQuery.data ?? [];
  const canManage = sessionQuery.data?.authenticated === true;
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

  const checkError =
    checkMutation.isError || checkAllMutation.isError
      ? getApiErrorMessage(
          checkMutation.error ?? checkAllMutation.error,
          'Impossible de lancer la vérification.',
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
    <div className="cyber-shell cyber-grid min-h-screen text-slate-100">
      <header className="border-b border-cyan-400/20 bg-[#05080d]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="cyber-cut grid size-9 place-items-center bg-yellow-300 text-black shadow-[0_0_22px_rgba(252,238,10,0.18)]">
              <svg
                aria-hidden="true"
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  d="M3 12h4l2.2-6 4.2 12 2.2-6H21"
                />
              </svg>
            </span>
            <div>
              <p className="text-sm font-black tracking-[0.14em] text-slate-100 uppercase">
                Netwatch
              </p>
              <p className="font-mono text-[9px] tracking-[0.18em] text-cyan-300/65 uppercase">
                SYS://URL_MONITOR
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 border-r border-slate-700 pr-4 font-mono text-[10px] tracking-wider text-slate-400 uppercase sm:flex">
              <span
                className={`cyber-pulse size-1.5 rounded-full ${
                  error
                    ? 'bg-rose-400 text-rose-400'
                    : isLoading
                      ? 'bg-yellow-300 text-yellow-300'
                      : 'bg-emerald-300 text-emerald-300'
                }`}
              />
              {error ? 'API_DOWN' : isLoading ? 'CONNECTING' : 'LINK_ACTIVE'}
            </div>

            {!sessionQuery.isPending &&
              (canManage ? (
                <button
                  type="button"
                  disabled={logoutMutation.isPending}
                  onClick={() => logoutMutation.mutate()}
                  className="cyber-button cyber-button--ghost min-h-8"
                >
                  {logoutMutation.isPending ? 'Déconnexion…' : 'Déconnexion'}
                </button>
              ) : (
                <Link to="/login" className="cyber-button min-h-8">
                  Connexion
                </Link>
              ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-5 border-l-2 border-yellow-300 pl-4 sm:flex-row sm:items-end">
          <div>
            <p className="cyber-kicker mb-1.5">Console // surveillance_07</p>
            <h1 className="cyber-title text-3xl font-black text-slate-50 sm:text-4xl">
              Surveillance réseau
            </h1>
            <p className="mt-2 max-w-2xl font-mono text-xs leading-5 text-slate-400">
              Analyse en temps réel des nœuds, latences et codes de réponse.
              Synchronisation automatique toutes les 30 secondes.
            </p>
          </div>
          {canManage && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={checkAllMutation.isPending}
                onClick={() => checkAllMutation.mutate()}
                className="cyber-button cyber-button--ghost"
              >
                {checkAllMutation.isPending
                  ? 'Vérification…'
                  : 'Scanner le réseau'}
              </button>
              <Link to="/monitors/new" className="cyber-button">
                + Nouveau nœud
              </Link>
            </div>
          )}
        </div>

        <section
          aria-label="Résumé des services"
          className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5"
        >
          <SummaryCard label="Nœuds suivis" value={monitors.length} />
          <SummaryCard label="En ligne" value={onlineCount} tone="success" />
          <SummaryCard label="Hors ligne" value={offlineCount} tone="danger" />
          <SummaryCard
            label="Non vérifiés"
            value={notCheckedCount}
            tone="warning"
          />
          <SummaryCard
            label="Latence moyenne"
            value={
              averageResponseTime === null ? '—' : `${averageResponseTime} ms`
            }
            tone="info"
          />
        </section>

        <section aria-labelledby="services-title">
          <div className="mb-4 flex items-end justify-between gap-4 border-b border-slate-700/70 pb-3">
            <div>
              <p className="cyber-kicker mb-1">Network map</p>
              <h2
                id="services-title"
                className="text-lg font-black tracking-[0.08em] text-slate-100 uppercase"
              >
                Nœuds actifs
              </h2>
              <p className="mt-1 font-mono text-[10px] text-slate-500">
                {isLoading
                  ? 'READING_REMOTE_DATA…'
                  : 'SOURCE://NEST_API · REFRESH_RATE://30S'}
              </p>
            </div>
            <span className="cyber-cut border border-cyan-400/30 bg-cyan-400/5 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider text-cyan-200 uppercase">
              {monitors.length} nodes
            </span>
          </div>

          {checkError && (
            <p role="alert" className="cyber-alert mb-4 px-3 py-2.5 text-xs">
              <span className="mr-2 font-bold">SCAN_ERROR://</span>
              {checkError}
            </p>
          )}

          {isLoading && (
            <div
              aria-live="polite"
              className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
            >
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="cyber-panel h-60 animate-pulse border-slate-700 bg-slate-900/80"
                />
              ))}
              <span className="sr-only">Chargement des services</span>
            </div>
          )}

          {!isLoading && error && (
            <div
              role="alert"
              className="cyber-panel [--panel-accent:#ff2a6d] px-5 py-8 text-center"
            >
              <p className="font-mono text-sm font-bold text-rose-300">
                FATAL_LINK_ERROR:// {error}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Vérifiez que le serveur NestJS est démarré sur le port 3000.
              </p>
            </div>
          )}

          {!isLoading && !error && monitors.length === 0 && (
            <div className="cyber-panel border-dashed px-5 py-8 text-center">
              <p className="font-mono font-bold tracking-wide text-slate-200 uppercase">
                Aucun nœud détecté
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Les services ajoutés apparaîtront sur cette interface.
              </p>
            </div>
          )}

          {!isLoading && !error && monitors.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {monitors.map((monitor) => (
                <MonitorCard
                  key={monitor.id}
                  monitor={monitor}
                  canManage={canManage}
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

      <footer className="mx-auto mt-4 flex max-w-6xl items-center justify-between border-t border-slate-800 px-4 py-5 font-mono text-[9px] tracking-[0.12em] text-slate-600 uppercase sm:px-6 lg:px-8">
        <span>NETWATCH_OS // BUILD 07</span>
        <span>Encrypted session · MySQL uplink</span>
      </footer>

      {canManage && monitorToDelete && (
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
