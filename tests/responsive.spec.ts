import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'Mobile (iPhone SE 375px)', width: 375, height: 667 },
  { name: 'Mobile (iPhone 14 390px)', width: 390, height: 844 },
  { name: 'Tablet (iPad 768px)', width: 768, height: 1024 },
  { name: 'Desktop (1280px)', width: 1280, height: 800 },
];

test.describe('Responsive Design & Screen Adaptability', () => {
  for (const vp of VIEWPORTS) {
    test(`Landing Page & Split Simulator renders with zero overflow on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');

      // Check hero headline is visible and legible
      const hero = page.locator('h1');
      await expect(hero).toBeVisible();

      // Check slider and quick-split card fit within viewport
      const slider = page.locator('input[type="range"]').first();
      await expect(slider).toBeVisible();

      // Verify no horizontal document overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });

    test(`Trip Hub (Goa Coastal Retreat) adapts cleanly on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.addInitScript(() => {
        localStorage.setItem('token', 'demo_jwt_traveler_token');
      });
      await page.goto('/trips/trip_goa_2026');

      // Check header and tabs are clickable
      await expect(page.locator('h1')).toContainText('Goa Coastal Retreat');
      await expect(page.locator('button:has-text("Overview")')).toBeVisible();

      // Check Expenses tab
      await page.click('button:has-text("Expenses")');
      await expect(page.locator('text=Export CSV')).toBeVisible();

      // Verify document does not overflow horizontally
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });

    test(`Vendor Dashboard & Property Console adapts cleanly on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.addInitScript(() => {
        localStorage.setItem('token', 'demo_jwt_vendor_token');
        localStorage.setItem('wakeru_user', JSON.stringify({ role: 'VENDOR' }));
      });
      await page.goto('/vendor');

      await expect(page.locator('h1')).toContainText('My Businesses');

      // Verify document does not overflow horizontally
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });
  }
});
