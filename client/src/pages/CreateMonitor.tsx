import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';
import MonitorForm from '../components/MonitorForm';
import { getApiErrorMessage } from '../services/apiClient';
import { checkMonitor, createMonitor } from '../services/monitorApi';

function CreateMonitor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; url: string }) => {
      const monitor = await createMonitor(payload);

      return checkMonitor(monitor.id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['monitors'] });
      navigate('/');
    },
  });

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
            Nouveau service
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Ajouter une URL</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Renseignez le service que vous souhaitez surveiller.
          </p>
        </div>

        <MonitorForm
          submitLabel="Ajouter le service"
          isSubmitting={createMutation.isPending}
          errorMessage={
            createMutation.isError
              ? getApiErrorMessage(
                  createMutation.error,
                  'Impossible d’ajouter ce service.',
                )
              : null
          }
          onSubmit={(payload) => createMutation.mutate(payload)}
        />
      </div>
    </main>
  );
}

export default CreateMonitor;
