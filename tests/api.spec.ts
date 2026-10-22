import { test, expect } from '@playwright/test';

test.describe.serial('Token-Based Authentication & RBAC API Verification', () => {
  let travelerToken = '';
  let vendorToken = '';
  let adminToken = '';

  test.beforeAll(async ({ request }) => {
    // 1. Obtain Traveler Token
    const travelerRes = await request.post('/api/v1/auth/login', {
      data: { email: 'alex.traveler@wakeru.local' },
    });
    const travelerJson = await travelerRes.json();
    travelerToken = travelerJson.data.token;

    // 2. Obtain Vendor Token
    const vendorRes = await request.post('/api/v1/auth/login', {
      data: { email: 'vikram.goa.villas@wakeru.local' },
    });
    const vendorJson = await vendorRes.json();
    vendorToken = vendorJson.data.token;

    // 3. Obtain Admin Token
    const adminRes = await request.post('/api/v1/auth/login', {
      data: { email: 'admin@wakeru.local' },
    });
    const adminJson = await adminRes.json();
    adminToken = adminJson.data.token;
  });

  test('1. Auth endpoint issues valid signed tokens with roles & permissions', async ({ request }) => {
    expect(travelerToken).toBeTruthy();
    expect(vendorToken).toBeTruthy();
    expect(adminToken).toBeTruthy();

    const res = await request.post('/api/v1/auth/login', {
      data: { email: 'alex.traveler@wakeru.local' },
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.user.role).toBe('TRAVELER');
    expect(json.data.user.permissions).toContain('trips:read');
  });

  test('2. /auth/me verifies Bearer token identity', async ({ request }) => {
    const res = await request.get('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${travelerToken}` },
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.user.role).toBe('TRAVELER');
    expect(json.data.user.email).toBe('alex.traveler@wakeru.local');
  });

  test('3. RBAC Enforcement: Traveler blocked from Admin APIs with 403 Forbidden', async ({ request }) => {
    const res = await request.get('/api/v1/admin/overview', {
      headers: { Authorization: `Bearer ${travelerToken}` },
    });
    expect(res.status()).toBe(403);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('FORBIDDEN');
    expect(json.error.message).toContain('Access denied');
  });

  test('4. RBAC Enforcement: Vendor blocked from Admin Audit Logs with 403 Forbidden', async ({ request }) => {
    const res = await request.get('/api/v1/admin/audit-logs', {
      headers: { Authorization: `Bearer ${vendorToken}` },
    });
    expect(res.status()).toBe(403);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('FORBIDDEN');
  });

  test('5. RBAC Success: Admin granted access to Platform Overview and Audit Logs', async ({ request }) => {
    const res = await request.get('/api/v1/admin/overview', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.kpis).toBeDefined();
  });

  test('6. Settlement calculation runs Greedy Min-Cash-Flow on backend', async ({ request }) => {
    const res = await request.get('/api/v1/trips/trip_goa_2026/settlements', {
      headers: { Authorization: `Bearer ${travelerToken}` },
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data.settlement.transactions)).toBe(true);
    expect(Array.isArray(json.data.balances)).toBe(true);
  });
});
