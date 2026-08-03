interface ConfirmModalProps {
  monitorName: string;
  isDeleting: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({
  monitorName,
  isDeleting,
  errorMessage,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) {
          onCancel();
        }
      }}
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-5 backdrop-blur-sm"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-monitor-title"
        aria-describedby="delete-monitor-description"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="grid size-11 place-items-center rounded-xl bg-rose-50 text-rose-600">
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
              d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374L10.052 3.38c.865-1.5 3.03-1.5 3.896 0l7.355 12.746ZM12 15.75h.008v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h2
          id="delete-monitor-title"
          className="mt-5 text-xl font-bold tracking-tight text-slate-950"
        >
          Supprimer ce service ?
        </h2>
        <p
          id="delete-monitor-description"
          className="mt-2 text-sm leading-6 text-slate-600"
        >
          Le service <strong>{monitorName}</strong> et son historique de
          vérification seront définitivement supprimés.
        </p>

        {errorMessage && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
          >
            {errorMessage}
          </p>
        )}

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? 'Suppression…' : 'Supprimer'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ConfirmModal;
