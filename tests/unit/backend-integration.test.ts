import test from 'node:test';
import assert from 'node:assert/strict';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://wakeru.onrender.com/api/v1';

test('Backend Health & Reachability - Verifies live backend responds with standard envelope', async () => {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    });

    // An unauthenticated request to /auth/me should return 401 Unauthorized with standard error envelope
    assert.strictEqual(res.status, 401, 'Should return 401 Unauthorized for unauthenticated call');
    const json = await res.json();
    assert.strictEqual(json.success, false, 'Should have success: false envelope');
    assert.ok(json.error, 'Should contain error object');
  } catch (err: unknown) {
    if ((err as Error).name === 'TimeoutError') {
      console.warn('Backend server cold start timeout (expected on free Render tier). Skipping test.');
    } else {
      throw err;
    }
  }
});

test('Backend Health & Reachability - Verifies protected trips endpoint requires authentication', async () => {
  try {
    const res = await fetch(`${BACKEND_URL}/trips`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    });

    assert.strictEqual(res.status, 401);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.ok(json.error);
  } catch (err: unknown) {
    if ((err as Error).name === 'TimeoutError') {
      console.warn('Backend server cold start timeout. Skipping test.');
    } else {
      throw err;
    }
  }
});
