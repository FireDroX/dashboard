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
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="space-y-6">
        <div>
          <label
            htmlFor="monitor-name"
            className="block text-sm font-semibold text-slate-800"
          >
            Nom du service
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
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        <div>
          <label
            htmlFor="monitor-url"
            className="block text-sm font-semibold text-slate-800"
          >
            URL du service
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
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
          <p className="mt-2 text-xs text-slate-500">
            L’URL doit commencer par http:// ou https://.
          </p>
        </div>
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {errorMessage}
        </p>
      )}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          to="/"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Annuler
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Enregistrement…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default MonitorForm;
