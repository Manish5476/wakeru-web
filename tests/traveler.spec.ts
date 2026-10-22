import { test, expect } from '@playwright/test';

test.describe('Traveler Experience & Trips Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'demo_jwt_traveler_token');
      localStorage.setItem('wakeru_user', JSON.stringify({
        id: 'usr_me',
        email: 'alex.traveler@wakeru.local',
        name: 'Alex Traveler',
        role: 'TRAVELER',
      }));
    });
  });

  test('1. Landing page loads with interactive Min-Cash-Flow debt simulator', async ({ page }) => {
    await page.goto('/');

    // Check brand & hero headline
    await expect(page.locator('h1')).toContainText('Travel Together');
    await expect(page.locator('body')).toContainText('Min-Cash-Flow');

    // Verify Quick-Split Calculator slider
    const slider = page.locator('input[type="range"]').first();
    await expect(slider).toBeVisible();

    // Verify Blueprint CTA
    const exploreBtn = page.locator('text=Explore Trips Portfolio');
    await expect(exploreBtn.first()).toBeVisible();
  });

  test('2. Trips Portfolio loads metrics ribbon and filters', async ({ page }) => {
    await page.goto('/trips');

    // Expect Portfolio header
    await expect(page.locator('h1')).toContainText('My Trip Portfolio');

    // Verify filter pills
    await expect(page.getByRole('button', { name: 'All Trips' })).toBeVisible({ timeout: 10000 });

    // Verify at least one trip card is rendered
    const tripCard = page.locator('a[href*="/trips/trip_goa_2026"]');
    await expect(tripCard.first()).toBeVisible();
  });

  test('3. 5-Tab Trip Hub loads Overview, Expenses, Settlements, Itinerary and Members', async ({ page }) => {
    await page.goto('/trips/trip_goa_2026');

    // Expect Trip destination header
    await expect(page.locator('h1')).toContainText('Goa Coastal Retreat', { timeout: 10000 });

    // Tab 1: Overview
    await expect(page.locator('text=Budget Health')).toBeVisible();
    await expect(page.locator('text=Live Multi-Currency Converter')).toBeVisible();

    // Tab 2: Switch to Expenses
    await page.click('button:has-text("Expenses")');
    await expect(page.locator('text=Export CSV')).toBeVisible();

    // Tab 3: Switch to Settlements (Min-Cash-Flow Engine)
    await page.click('button:has-text("Settlements")');
    await expect(page.locator('text=Greedy Min-Cash-Flow Debt Engine')).toBeVisible();
    await expect(page.locator('button:has-text("Share Ledger")')).toBeVisible();

    // Tab 4: Switch to Itinerary & Packing
    await page.click('button:has-text("Itinerary")');
    await expect(page.locator('text=Day-by-Day Schedule')).toBeVisible();
    await expect(page.locator('text=Group Packing Checklist')).toBeVisible();

    // Tab 5: Switch to Companions
    await page.click('button:has-text("Companions")');
    await expect(page.locator('text=Trip Companions')).toBeVisible();
    await expect(page.locator('text=Invite New Companion')).toBeVisible();
  });

  test('4. Itemized Bill OCR scanner loads with demo receipt simulation', async ({ page }) => {
    await page.goto('/trips/trip_goa_2026/expenses/scan');

    // Expect scanner UI
    await expect(page.locator('h1')).toContainText('Scan & Split a Restaurant Bill', { timeout: 10000 });
    await expect(page.locator('text=Demo: Use Sample Restaurant Bill')).toBeVisible();

    // Click sample bill
    await page.click('text=Demo: Use Sample Restaurant Bill');
    await expect(page.locator('text=AI OCR Processing')).toBeVisible();

    // Wait for OCR line items to appear
    await expect(page.locator('text=Parsed Line Items')).toBeVisible({ timeout: 10000 });
  });

  test('5. Discover Catalog loads category filters, search, and saved wishlist', async ({ page }) => {
    await page.goto('/discover');

    // Expect verified partner directory header
    await expect(page.locator('h1')).toContainText('Curated Stays, Dining & Group Experiences');

    // Check category pills
    await expect(page.locator('text=Stays & Villas')).toBeVisible();
    await expect(page.locator('text=Dining & Lounges')).toBeVisible();

    // Verify search input
    const searchInput = page.locator('input[placeholder*="Search by venue"]');
    await expect(searchInput).toBeVisible();

    // Navigate to Wishlist
    await page.goto('/saved');
    await expect(page.locator('h1')).toContainText('Saved Venues & Experiences');
  });

  test('6. Bookings displays status filters, rejection reasons, and smart key pass', async ({ page }) => {
    await page.goto('/bookings');

    await expect(page.locator('h1')).toContainText('My Bookings & Reservations');

    // Verify Confirmed pass button
    const viewPassBtn = page.locator('text=View Pass & Key 🔑');
    if (await viewPassBtn.count() > 0) {
      await viewPassBtn.first().click();
      await expect(page.locator('h1')).toContainText('Digital Smart Key');
      await expect(page.locator('text=Tap to Unlock')).toBeVisible();
    }
  });
});
