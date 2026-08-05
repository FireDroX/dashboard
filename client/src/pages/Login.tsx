import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, useNavigate } from 'react-router';
import { getApiErrorMessage } from '../services/apiClient';
import {
  authSessionQueryKey,
  getAuthSession,
  login,
} from '../services/authApi';

function Login() {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: authSessionQueryKey,
    queryFn: getAuthSession,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      queryClient.setQueryData(authSessionQueryKey, session);
      navigate('/');
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loginMutation.mutate({ password });
  }

  if (sessionQuery.data?.authenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-10 text-slate-950">
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          ← Retour au dashboard
        </Link>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid size-10 place-items-center rounded-xl bg-slate-950 text-white">
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
                d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-.75 10.5h10.5A2.25 2.25 0 0 0 19.5 18.75v-6A2.25 2.25 0 0 0 17.25 10.5H6.75A2.25 2.25 0 0 0 4.5 12.75v6A2.25 2.25 0 0 0 6.75 21Z"
              />
            </svg>
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight">
            Administration
          </h1>
          <p className="mt-2 text-sm leading-5 text-slate-600">
            Connectez-vous pour gérer et vérifier les services.
          </p>

          <form onSubmit={handleSubmit} className="mt-6">
            <label
              htmlFor="dashboard-password"
              className="block text-sm font-semibold text-slate-800"
            >
              Mot de passe
            </label>
            <input
              id="dashboard-password"
              name="password"
              type="password"
              required
              maxLength={255}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />

            {loginMutation.isError && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
              >
                {getApiErrorMessage(
                  loginMutation.error,
                  'Impossible de se connecter.',
                )}
              </p>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="mt-6 w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loginMutation.isPending ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default Login;
