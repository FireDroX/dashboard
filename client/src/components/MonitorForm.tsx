import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router';
import type { MonitorPayload } from '../types/monitor';

interface MonitorFormProps {
  initialValues?: MonitorPayload;
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onSubmit: (payload: MonitorPayload) => void;
}

function MonitorForm({
  initialValues,
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
}: MonitorFormProps) {
  const [values, setValues] = useState<MonitorPayload>(
    initialValues ?? { name: '', url: '' },
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      name: values.name.trim(),
      url: values.url.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="cyber-panel [--panel-accent:#fcee0a] p-5 sm:p-7"
    >
      <div className="mb-6 flex items-center justify-between border-b border-slate-700/60 pb-3">
        <span className="cyber-kicker">Node configuration</span>
        <span className="font-mono text-[9px] tracking-[0.16em] text-slate-600 uppercase">
          WRITE_ACCESS://GRANTED
        </span>
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor="monitor-name" className="cyber-label block">
            01 // Nom du service
          </label>
          <input
            id="monitor-name"
            name="name"
            type="text"
            required
            maxLength={100}
            autoComplete="off"
            value={values.name}
            onChange={(event) =>
              setValues((currentValues) => ({
                ...currentValues,
                name: event.target.value,
              }))
            }
            placeholder="Portfolio"
            className="cyber-input mt-2"
          />
        </div>

        <div>
          <label htmlFor="monitor-url" className="cyber-label block">
            02 // Point d’accès URL
          </label>
          <input
            id="monitor-url"
            name="url"
            type="url"
            required
            maxLength={2048}
            value={values.url}
            onChange={(event) =>
              setValues((currentValues) => ({
                ...currentValues,
                url: event.target.value,
              }))
            }
            placeholder="https://addrien.fr"
            className="cyber-input mt-2"
          />
          <p className="mt-2 font-mono text-[10px] text-slate-500">
            PROTOCOL_REQUIRED:// http:// ou https://
          </p>
        </div>
      </div>

      {errorMessage && (
        <p role="alert" className="cyber-alert mt-5 px-4 py-3 text-xs">
          <span className="mr-2 font-bold">WRITE_ERROR://</span>
          {errorMessage}
        </p>
      )}

      <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link to="/" className="cyber-button cyber-button--ghost">
          Annuler
        </Link>
        <button type="submit" disabled={isSubmitting} className="cyber-button">
          {isSubmitting ? 'Enregistrement…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default MonitorForm;
