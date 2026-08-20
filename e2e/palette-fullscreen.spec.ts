import { test, expect, devices } from '@playwright/test';

/**
 * Command palette mobile fullscreen sheet. On a touch phone (classified via
 * pureAdmin.device — capability-first, mirroring web-components-core's
 * classifyDevice) the palette opens as a full-viewport sheet instead of the
 * floating dialog, matching @keenmate/web-multiselect's mobile overlay.
 */
test.use({ ...devices['Pixel 7'] });

test('command palette opens as a fullscreen sheet on a phone', async ({ page }) => {
  await page.goto('/');

  // pureAdmin.device should classify the emulated phone as 'mobile'.
  const deviceClass = await page.evaluate(() => (window as any).pureAdmin?.device?.class);
  expect(deviceClass).toBe('mobile');

  // Open the palette (Ctrl+K).
  await page.keyboard.press('Control+k');

  const palette = page.locator('#commandPalette');
  await expect(palette).toHaveClass(/pa-command-palette--fullscreen/);

  // The container should fill the viewport.
  const container = page.locator('.pa-command-palette__container');
  const box = await container.boundingBox();
  const vp = page.viewportSize()!;
  expect(box!.width).toBeCloseTo(vp.width, 0);
  expect(box!.height).toBeGreaterThan(vp.height * 0.9);

  // The injected close button exists and closes the sheet.
  const close = page.locator('.pa-command-palette__close');
  await expect(close).toBeVisible();

  await close.click();
  await expect(palette).not.toHaveClass(/pa-command-palette--fullscreen/);
});

// Counter-check: a NARROW desktop window (fine pointer, hover) must stay a
// floating dialog — the whole point of classifying by capability, not width.
test.describe('narrow desktop', () => {
  test.use({ viewport: { width: 420, height: 780 }, hasTouch: false, isMobile: false });

  test('narrow desktop window keeps the floating dialog', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => (window as any).pureAdmin?.device?.class)).toBe('desktop');
    await page.keyboard.press('Control+k');
    const palette = page.locator('#commandPalette');
    await expect(palette).toHaveClass(/pa-command-palette--active/);
    await expect(palette).not.toHaveClass(/pa-command-palette--fullscreen/);
  });
});
