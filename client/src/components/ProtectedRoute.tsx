import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { authSessionQueryKey, getAuthSession } from '../services/authApi';

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const sessionQuery = useQuery({
    queryKey: authSessionQueryKey,
    queryFn: getAuthSession,
    retry: false,
  });

  if (sessionQuery.isPending) {
    return (
      <main className="cyber-shell cyber-grid grid min-h-screen place-items-center px-5">
        <div className="text-center">
          <span className="cyber-pulse mx-auto block size-2 rounded-full bg-cyan-300 text-cyan-300" />
          <p className="mt-4 font-mono text-[11px] font-bold tracking-[0.16em] text-cyan-200 uppercase">
            Vérification de la session…
          </p>
        </div>
      </main>
    );
  }

  if (!sessionQuery.data?.authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
