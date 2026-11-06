import type { SystemStatus } from './contracts/api';

const API_BASE = '/api';

export async function fetchSystemStatus(): Promise<SystemStatus> {
  const response = await fetch(`${API_BASE}/status`);
  if (!response.ok) {
    throw new Error(`Failed to fetch system status: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
