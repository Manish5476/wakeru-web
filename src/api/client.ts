export class APIError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasMore?: boolean;
  };
}

export interface PaginatedResponse<T> {
  items?: T[];
  expenses?: T[];
  trips?: T[];
  transactions?: T[];
  notifications?: T[];
  friends?: T[];
  pagination: {
    total?: number;
    totalCount?: number;
    totalPages?: number;
    page: number;
    limit: number;
    pages?: number;
    hasMore?: boolean;
  };
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  idempotencyKey?: string;
  body?: any;
}

export const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, '');
  }
  return 'https://wakeru.onrender.com/api/v1';
};

function generateIdempotencyKey(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function fetchClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, idempotencyKey, ...customConfig } = options;

  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = new URL(`${baseUrl}${cleanEndpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const headers = new Headers(customConfig.headers);
  const isFormData = typeof FormData !== 'undefined' && customConfig.body instanceof FormData;

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  const method = (customConfig.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    headers.set('Idempotency-Key', idempotencyKey || generateIdempotencyKey());
  }

  // Retrieve token from storage
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token') || localStorage.getItem('tripsplit_access_token');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let body = customConfig.body;
  if (body && typeof body === 'object' && !isFormData && !(body instanceof Blob)) {
    body = JSON.stringify(body);
  }

  const config: RequestInit = {
    ...customConfig,
    headers,
    body,
  };

  const response = await fetch(url.toString(), config);

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText || 'An error occurred.' };
    }

    const code = errorData?.code || errorData?.error?.code || 'API_ERROR';
    const message =
      errorData?.message ||
      errorData?.error?.message ||
      (response.status === 401 ? 'Session expired or unauthorized.' : 'An error occurred during request.');

    throw new APIError(response.status, code, message, errorData?.details || errorData?.error?.details);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const json = await response.json();
  if (json && typeof json === 'object' && 'success' in json) {
    if (!json.success) {
      throw new APIError(
        response.status,
        json.error?.code || json.code || 'API_ERROR',
        json.error?.message || json.message || 'Request failed.',
        json.error?.details
      );
    }
    // Return the response object, with .data conveniently accessible
    return json as T;
  }

  return json;
}

export const apiClient = {
  get: <T = any>(endpoint: string, options?: RequestOptions): Promise<T> =>
    fetchClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> =>
    fetchClient<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> =>
    fetchClient<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> =>
    fetchClient<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T = any>(endpoint: string, options?: RequestOptions): Promise<T> =>
    fetchClient<T>(endpoint, { ...options, method: 'DELETE' }),

  upload: <T = any>(endpoint: string, formData: FormData, options?: RequestOptions): Promise<T> =>
    fetchClient<T>(endpoint, { ...options, method: 'POST', body: formData }),
};

export default apiClient;
