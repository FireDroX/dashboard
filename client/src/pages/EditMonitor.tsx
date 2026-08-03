import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router';
import MonitorForm from '../components/MonitorForm';
import {
  getApiErrorMessage,
  getMonitor,
  updateMonitor,
} from '../services/monitorApi';

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
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-950 sm:px-8 lg:py-14">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/"
          className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          ← Retour au dashboard
        </Link>

        <div className="mb-8 mt-6">
          <p className="mb-2 text-sm font-semibold text-blue-600">
            Service existant
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            Modifier {monitorQuery.data.name}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
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
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 text-slate-950">
      <div className="text-center">
        <p className="font-semibold text-slate-800">{message}</p>
        <Link
          to="/"
          className="mt-4 inline-block text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          Retour au dashboard
        </Link>
      </div>
    </main>
  );
}

export default EditMonitor;
