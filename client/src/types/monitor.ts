export type MonitorStatus = 'ONLINE' | 'OFFLINE' | 'UNKNOWN';

export interface Monitor {
  id: number;
  name: string;
  url: string;
  status: MonitorStatus;
  responseTime: number | null;
  statusCode: number | null;
  lastError: string | null;
  lastCheckedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MonitorPayload {
  name: string;
  url: string;
}
