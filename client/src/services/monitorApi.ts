import axios from 'axios';
import type { Monitor, MonitorPayload } from '../types/monitor';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10_000,
});

export async function getMonitors(): Promise<Monitor[]> {
  const response = await api.get<Monitor[]>('/monitors');
  return response.data;
}

export async function createMonitor(payload: MonitorPayload): Promise<Monitor> {
  const response = await api.post<Monitor>('/monitors', payload);

  return response.data;
}

export async function updateMonitor(
  id: number,
  payload: MonitorPayload,
): Promise<Monitor> {
  const response = await api.patch<Monitor>(`/monitors/${id}`, payload);

  return response.data;
}

export async function deleteMonitor(id: number): Promise<void> {
  await api.delete(`/monitors/${id}`);
}

export async function checkMonitor(id: number): Promise<Monitor> {
  const response = await api.post<Monitor>(`/monitors/${id}/check`);

  return response.data;
}
