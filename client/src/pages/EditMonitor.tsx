import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router';
import MonitorForm from '../components/MonitorForm';
import { getApiErrorMessage } from '../services/apiClient';
import { getMonitor, updateMonitor } from '../services/monitorApi';

function EditMonitor() {
  const { id } = useParams<{ id: string }>();
  const monitorId = Number(id);
  const hasValidId = Number.isInteger(monitorId) && monitorId > 0;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const monitorQuery = useQuery({
    queryKey: ['monitors', monitorId],
    queryFn: () => getMonitor(monitorId),
    enabled: hasValidId,
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { name: string; url: string }) =>
      updateMonitor(monitorId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['monitors'] });
      navigate('/');
    },
  });

  if (!hasValidId) {
    return <PageMessage message="L’identifiant du service est invalide." />;
  }

  if (monitorQuery.isPending) {
    return <PageMessage message="Chargement du service…" />;
  }

  if (monitorQuery.isError) {
    return (
      <PageMessage
        message={getApiErrorMessage(
          monitorQuery.error,
          'Impossible de récupérer ce service.',
        )}
      />
    );
  }

  return (
    <main className="cyber-shell cyber-grid min-h-screen px-5 py-8 text-slate-100 sm:px-8 lg:py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/"
          className="font-mono text-[11px] font-bold tracking-wider text-cyan-300 uppercase transition hover:text-cyan-100"
        >
          ← Retour au dashboard
        </Link>

        <div className="mb-6 mt-7 border-l-2 border-yellow-300 pl-4">
          <p className="cyber-kicker mb-1.5">Reconfigure // existing_node</p>
          <h1 className="cyber-title text-3xl font-black text-slate-50">
            Modifier {monitorQuery.data.name}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Modifiez le nom ou l’URL utilisée pour la surveillance.
          </p>
        </div>

        <MonitorForm
          key={monitorQuery.data.id}
          initialValues={{
            name: monitorQuery.data.name,
            url: monitorQuery.data.url,
          }}
          submitLabel="Enregistrer les modifications"
          isSubmitting={updateMutation.isPending}
          errorMessage={
            updateMutation.isError
              ? getApiErrorMessage(
                  updateMutation.error,
                  'Impossible de modifier ce service.',
                )
              : null
          }
          onSubmit={(payload) => updateMutation.mutate(payload)}
        />
      </div>
    </main>
  );
}

interface PageMessageProps {
  message: string;
}

function PageMessage({ message }: PageMessageProps) {
  return (
    <main className="cyber-shell cyber-grid grid min-h-screen place-items-center px-5 text-slate-100">
      <div className="cyber-panel max-w-md [--panel-accent:#fcee0a] p-7 text-center">
        <p className="font-mono text-sm font-semibold text-slate-200">
          {message}
        </p>
        <Link to="/" className="cyber-button cyber-button--ghost mt-5">
          Retour au dashboard
        </Link>
      </div>
    </main>
  );
}

export default EditMonitor;
