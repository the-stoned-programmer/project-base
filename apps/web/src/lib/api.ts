import type { ApiError, SystemStatus } from '@modern/contracts';

const API_BASE = '/api';

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, unknown>;
  readonly raw?: ApiError;

  constructor(message: string, error?: Partial<ApiError>) {
    super(message);
    this.name = 'ApiClientError';
    this.status = error?.status ?? 500;
    this.code = error?.code ?? 'UNKNOWN_ERROR';
    this.details = error?.details;
    this.raw = error as ApiError | undefined;
  }
}

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith('/') ? `${API_BASE}${endpoint}` : `${API_BASE}/${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorPayload: ApiError | undefined;
    try {
      errorPayload = (await response.json()) as ApiError;
    } catch {
      // Response was not JSON
    }

    if (errorPayload && errorPayload.message) {
      throw new ApiClientError(errorPayload.message, errorPayload);
    }

    throw new ApiClientError(
      `Request failed with status ${response.status}: ${response.statusText}`,
      { status: response.status, code: `HTTP_${response.status}` }
    );
  }

  return response.json() as Promise<T>;
}

export async function fetchSystemStatus(): Promise<SystemStatus> {
  return apiFetch<SystemStatus>('/status');
}
