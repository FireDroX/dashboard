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
      className="fixed inset-0 z-50 grid place-items-center bg-[#020408]/85 px-5 backdrop-blur-sm"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-monitor-title"
        aria-describedby="delete-monitor-description"
        className="cyber-panel w-full max-w-md [--panel-accent:#ff2a6d] p-6 shadow-[0_0_70px_rgba(255,42,109,0.12)]"
      >
        <div className="flex items-center gap-3 border-b border-rose-400/25 pb-4">
          <div className="cyber-cut grid size-10 place-items-center border border-rose-400/50 bg-rose-400/10 text-rose-300">
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
          <div>
            <p className="font-mono text-[9px] font-bold tracking-[0.2em] text-rose-400 uppercase">
              Warning // destructive command
            </p>
            <h2
              id="delete-monitor-title"
              className="mt-1 text-xl font-black tracking-tight text-slate-50 uppercase"
            >
              Supprimer ce nœud ?
            </h2>
          </div>
        </div>

        <p
          id="delete-monitor-description"
          className="mt-5 text-sm leading-6 text-slate-400"
        >
          Le service <strong className="text-rose-200">{monitorName}</strong> et
          son historique de vérification seront définitivement supprimés.
        </p>

        {errorMessage && (
          <p role="alert" className="cyber-alert mt-5 px-4 py-3 text-xs">
            {errorMessage}
          </p>
        )}

        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="cyber-button cyber-button--ghost"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="cyber-button cyber-button--danger"
          >
            {isDeleting ? 'Suppression…' : 'Confirmer la purge'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ConfirmModal;
