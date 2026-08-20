import { test, expect } from '@playwright/test';

// Verify the three demo search placements + the settings-panel toggle.
// search-position is restored from localStorage on load (settings-panel.js).

async function withPosition(page, pos: string) {
  await page.addInitScript((p) => localStorage.setItem('search-position', p), pos);
  await page.goto('/');
}

test('A — navbar inline search: swaps the title, filters results as you type', async ({ page }) => {
  await withPosition(page, 'navbar-inline');
  await expect(page.locator('#navbarSearchInline')).toBeVisible();
  await expect(page.locator('#navbarTitle')).toBeHidden();

  await page.fill('#navbarSearchInput', 'mac');
  const results = page.locator('#navbarSearchResults');
  await expect(results).toBeVisible();
  await expect(results.locator('.pa-search-autocomplete__item')).toHaveCount(1); // "MacBook Pro"
});

test('B — compact navbar pill opens the palette', async ({ page }) => {
  await withPosition(page, 'navbar-compact');
  const trigger = page.locator('#navbarSearchTrigger');
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(page.locator('#commandPalette')).toHaveClass(/pa-command-palette--active/);
});

test('C — sidebar item opens the palette', async ({ page }) => {
  await withPosition(page, 'sidebar');
  const trigger = page.locator('#sidebarSearchTrigger');
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(page.locator('#commandPalette')).toHaveClass(/pa-command-palette--active/);
});

test('Off — no search trigger is shown', async ({ page }) => {
  await withPosition(page, '');
  await expect(page.locator('#navbarSearchInline')).toBeHidden();
  await expect(page.locator('#navbarSearchTrigger')).toBeHidden();
  await expect(page.locator('#sidebarSearchTrigger')).toBeHidden();
  await expect(page.locator('#navbarTitle')).toBeVisible();
});
