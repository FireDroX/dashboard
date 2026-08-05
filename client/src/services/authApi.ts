import type { AuthSession, LoginPayload } from '../types/auth';
import { apiClient } from './apiClient';

export const authSessionQueryKey = ['auth', 'session'] as const;

export async function getAuthSession(): Promise<AuthSession> {
  const response = await apiClient.get<AuthSession>('/auth/session');
  return response.data;
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
  const response = await apiClient.post<AuthSession>('/auth/login', payload);
  return response.data;
}

export async function logout(): Promise<AuthSession> {
  const response = await apiClient.post<AuthSession>('/auth/logout');
  return response.data;
}
