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
    <main className="cyber-shell cyber-grid min-h-screen px-5 py-8 text-slate-100 sm:px-8 lg:py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/"
          className="font-mono text-[11px] font-bold tracking-wider text-cyan-300 uppercase transition hover:text-cyan-100"
        >
          ← Retour au dashboard
        </Link>

        <div className="mb-6 mt-7 border-l-2 border-yellow-300 pl-4">
          <p className="cyber-kicker mb-1.5">Deploy // new_node</p>
          <h1 className="cyber-title text-3xl font-black text-slate-50">
            Ajouter une URL
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
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
