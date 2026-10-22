import { test, expect } from '@playwright/test';

test.describe('Platform Operations & Admin Console', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'demo_jwt_admin_token');
      localStorage.setItem('wakeru_user', JSON.stringify({
        id: 'admin_usr_01',
        email: 'admin@wakeru.local',
        name: 'Platform Administrator',
        role: 'ADMIN',
      }));
    });
  });

  test('1. Admin dashboard loads operational KPIs and demand velocity', async ({ page }) => {
    await page.goto('/admin');

    // Expect sidebar & header
    await expect(page.locator('aside')).toContainText('Wakeru Admin');
    await expect(page.locator('h1')).toContainText('Admin Dashboard');

    // Check KPI cards
    await expect(page.locator('text=Registered Partners')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Pending Media')).toBeVisible();
    await expect(page.locator('text=Verified Vendors')).toBeVisible();

    // Check Demand velocity card
    await expect(page.locator('text=Regional Travel Demand Velocity')).toBeVisible();
  });

  test('2. Business verification queue allows filtering and reviews', async ({ page }) => {
    await page.goto('/admin/businesses');

    await expect(page.locator('h1')).toContainText('Businesses & Verification');
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

    // Check filter pills
    await expect(page.locator('text=All Businesses')).toBeVisible();
    await expect(page.locator('button:has-text("VERIFIED")')).toBeVisible();
  });

  test('3. Regional demand intelligence loads search momentum ranking', async ({ page }) => {
    await page.goto('/admin/demand');

    await expect(page.locator('h1')).toContainText('Regional Travel Demand Velocity');

    // Check metrics
    await expect(page.locator('text=Peak Booking Window')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Average Group Size')).toBeVisible();
    await expect(page.locator('text=Top Searched Destinations')).toBeVisible();
  });

  test('4. System audit logs load compliance traces and event filters', async ({ page }) => {
    await page.goto('/admin/audit-logs');

    await expect(page.locator('h1')).toContainText('System Audit Logs');
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

    // Check event filter pills
    await expect(page.locator('text=All Events')).toBeVisible();
    await expect(page.getByRole('button', { name: 'BOOKING_ACCEPT' })).toBeVisible();
  });

  test('5. Partner network page loads registered vendor directory', async ({ page }) => {
    await page.goto('/admin/vendors');

    await expect(page.locator('h1')).toContainText('Registered Vendor Partners');
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Vikram Joshi')).toBeVisible();
  });
});
