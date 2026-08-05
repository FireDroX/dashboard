import type { Monitor, MonitorPayload } from '../types/monitor';
import { apiClient } from './apiClient';

export async function getMonitors(): Promise<Monitor[]> {
  const response = await apiClient.get<Monitor[]>('/monitors');
  return response.data;
}

export async function getMonitor(id: number): Promise<Monitor> {
  const response = await apiClient.get<Monitor>(`/monitors/${id}`);
  return response.data;
}

export async function createMonitor(payload: MonitorPayload): Promise<Monitor> {
  const response = await apiClient.post<Monitor>('/monitors', payload);

  return response.data;
}

export async function updateMonitor(
  id: number,
  payload: MonitorPayload,
): Promise<Monitor> {
  const response = await apiClient.patch<Monitor>(`/monitors/${id}`, payload);

  return response.data;
}

export async function deleteMonitor(id: number): Promise<void> {
  await apiClient.delete(`/monitors/${id}`);
}

export async function checkMonitor(id: number): Promise<Monitor> {
  const response = await apiClient.post<Monitor>(`/monitors/${id}/check`);

  return response.data;
}

export async function checkAllMonitors(): Promise<void> {
  await apiClient.post('/monitors/check-all');
}
