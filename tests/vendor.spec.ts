import { test, expect } from '@playwright/test';

test.describe('Host & Vendor Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'demo_jwt_vendor_token');
      localStorage.setItem('wakeru_user', JSON.stringify({
        id: 'ven_anjuna_host',
        email: 'vikram.goa.villas@wakeru.local',
        name: 'Vikram Joshi',
        role: 'VENDOR',
      }));
    });
  });

  test('1. Vendor dashboard loads property portfolio', async ({ page }) => {
    await page.goto('/vendor');

    // Expect dashboard title and property table
    await expect(page.locator('h1')).toContainText('My Businesses');
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

    // Verify Anjuna Villa exists in table
    await expect(page.locator('text=Anjuna Beachfront Sunset Villa')).toBeVisible();
  });

  test('2. Business detail loads geolocation capture and navigation tabs', async ({ page }) => {
    await page.goto('/vendor/businesses/biz_anjuna_villa');

    // Expect property title
    await expect(page.locator('body')).toContainText('Anjuna Beachfront Sunset Villa', { timeout: 10000 });

    // Check GPS capture button
    await expect(page.locator('text=Capture Current Device GPS')).toBeVisible({ timeout: 10000 });

    // Verify sub-tabs navigation
    await expect(page.getByRole('link', { name: '📈 Analytics' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('link', { name: '📅 Booking Requests' })).toBeVisible();
    await expect(page.getByRole('link', { name: '📞 Leads' })).toBeVisible();
  });

  test('3. Booking inquiries page supports status filters and decline modal with presets', async ({ page }) => {
    await page.goto('/vendor/businesses/biz_anjuna_villa/bookings');

    await expect(page.locator('h1')).toContainText('Booking Requests');

    // Check filter pills
    await expect(page.locator('text=All Requests (')).toBeVisible({ timeout: 10000 });

    // If there is a decline button, verify modal opens
    const declineBtn = page.getByRole('button', { name: 'Decline...' });
    if (await declineBtn.count() > 0) {
      await declineBtn.first().click();
      await expect(page.locator('text=Decline Booking Request')).toBeVisible();
      await expect(page.locator('text=Fully booked for this date/time')).toBeVisible();
      // Close modal
      await page.click('button:has-text("Cancel")');
    }
  });

  test('4. CRM leads page displays traveler inquiries and WhatsApp action', async ({ page }) => {
    await page.goto('/vendor/businesses/biz_anjuna_villa/leads');

    await expect(page.locator('h1')).toContainText('Traveler Leads & Direct Inquiries');
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

    // Check presence of WhatsApp or Email contact button
    const whatsappLink = page.locator('a:has-text("WhatsApp")');
    await expect(whatsappLink.first()).toBeVisible();
  });

  test('5. Vendor analytics dashboard renders metrics and timeframe switcher', async ({ page }) => {
    await page.goto('/vendor/businesses/biz_anjuna_villa/analytics');

    await expect(page.locator('h1')).toContainText('Performance & Analytics');

    // Check timeframe pills
    await expect(page.locator('text=30 Days')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=3 Months')).toBeVisible();

    // Verify metric cards
    await expect(page.locator('text=Total Views')).toBeVisible();
    await expect(page.locator('text=Confirmed Bookings')).toBeVisible();
    await expect(page.locator('text=TripSplit Discovery Funnel')).toBeVisible();
  });
});
