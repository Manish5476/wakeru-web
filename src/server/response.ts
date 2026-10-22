import { ApiResponse, UserRole } from './types';

export function jsonSuccess<T>(data: T, status = 200, meta?: { userRole?: UserRole; [key: string]: any }): Response {
  const body: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
      ...meta,
    },
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function jsonError(
  code: string,
  message: string,
  status = 400,
  details?: any
): Response {
  const body: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    },
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
