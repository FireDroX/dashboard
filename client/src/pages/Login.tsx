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
    <main className="cyber-shell cyber-grid grid min-h-screen place-items-center px-5 py-10 text-slate-100">
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="font-mono text-[11px] font-bold tracking-wider text-cyan-300 uppercase transition hover:text-cyan-100"
        >
          ← Abort // dashboard
        </Link>

        <section className="cyber-panel mt-5 [--panel-accent:#fcee0a] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.48)]">
          <div className="flex items-center justify-between border-b border-slate-700/70 pb-4">
            <div className="cyber-cut grid size-10 place-items-center bg-yellow-300 text-black">
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
            <span className="font-mono text-[9px] tracking-[0.16em] text-slate-600 uppercase">
              Secure gateway // 01
            </span>
          </div>

          <p className="cyber-kicker mt-5">Restricted access</p>
          <h1 className="cyber-title mt-1 text-2xl font-black text-slate-50">
            Administration
          </h1>
          <p className="mt-2 text-sm leading-5 text-slate-400">
            Authentifiez votre session pour modifier le réseau surveillé.
          </p>

          <form onSubmit={handleSubmit} className="mt-6">
            <label htmlFor="dashboard-password" className="cyber-label block">
              Access key
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
              className="cyber-input mt-2"
              autoFocus
            />

            {loginMutation.isError && (
              <p role="alert" className="cyber-alert mt-4 px-4 py-3 text-xs">
                <span className="mr-2 font-bold">ACCESS_DENIED://</span>
                {getApiErrorMessage(
                  loginMutation.error,
                  'Impossible de se connecter.',
                )}
              </p>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="cyber-button mt-6 w-full"
            >
              {loginMutation.isPending
                ? 'Authentification…'
                : 'Ouvrir la session'}
            </button>
          </form>

          <p className="mt-5 border-t border-slate-800 pt-3 font-mono text-[9px] leading-4 tracking-wider text-slate-600 uppercase">
            Session chiffrée · Cookie HttpOnly · MySQL storage
          </p>
        </section>
      </div>
    </main>
  );
}

export default Login;
