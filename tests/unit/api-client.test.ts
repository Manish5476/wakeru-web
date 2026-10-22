import test from 'node:test';
import assert from 'node:assert/strict';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

class ApiError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code = 'API_ERROR', statusCode = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

function parseApiResponse<T>(payload: ApiResponse<T>, httpStatus = 200): T {
  if (!payload.success || payload.error) {
    const code = payload.error?.code || 'UNKNOWN_ERROR';
    const message = payload.error?.message || 'A server error occurred';
    throw new ApiError(message, code, httpStatus);
  }
  return payload.data as T;
}

function buildHeaders(token: string | null, method: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Auto-attach Idempotency-Key on mutations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
    headers['Idempotency-Key'] = 'test-uuid-1234-5678';
  }

  return headers;
}

test('API Client - Correctly unpacks success envelope data', () => {
  const mockPayload: ApiResponse<{ id: string; name: string }> = {
    success: true,
    data: { id: 'trip_1', name: 'Goa Coastal Retreat' },
  };

  const data = parseApiResponse(mockPayload, 200);
  assert.strictEqual(data.id, 'trip_1');
  assert.strictEqual(data.name, 'Goa Coastal Retreat');
});

test('API Client - Throws ApiError when envelope has success: false', () => {
  const errorPayload: ApiResponse<never> = {
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired authentication token',
    },
  };

  assert.throws(
    () => parseApiResponse(errorPayload, 401),
    (err: ApiError) => {
      assert.strictEqual(err.name, 'ApiError');
      assert.strictEqual(err.code, 'UNAUTHORIZED');
      assert.strictEqual(err.statusCode, 401);
      assert.strictEqual(err.message, 'Invalid or expired authentication token');
      return true;
    }
  );
});

test('API Client - Correctly injects Bearer token and Idempotency key on POST', () => {
  const headers = buildHeaders('sample-jwt-token-xyz', 'POST');
  assert.strictEqual(headers['Authorization'], 'Bearer sample-jwt-token-xyz');
  assert.strictEqual(headers['Idempotency-Key'], 'test-uuid-1234-5678');
  assert.strictEqual(headers['Content-Type'], 'application/json');
});

test('API Client - Omits Idempotency key on safe GET request', () => {
  const headers = buildHeaders('sample-jwt-token-xyz', 'GET');
  assert.strictEqual(headers['Authorization'], 'Bearer sample-jwt-token-xyz');
  assert.strictEqual(headers['Idempotency-Key'], undefined);
});
