import { test, expect } from '@playwright/test';

// The fit engine degrades header slots lowest-priority-first as the row narrows:
// version (10) → title (20) → search (25) → wordmark shrinks to "PA" (30).
// Rather than hard-code the exact px where each drops (that depends on theme
// metrics + the nav's own collapse), assert the PRIORITY-ORDER INVARIANT across
// a width sweep: a higher-priority slot is never degraded while a lower-priority
// one is still at full size.

async function state(page) {
  return page.evaluate(() => {
    const vis = (sel: string) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      const cs = getComputedStyle(el);
      return cs.display !== 'none' && cs.visibility !== 'hidden';
    };
    (window as any).pureAdmin?.components?.navFit?.relayoutAll();
    return {
      version: vis('.pa-header__version'),
      title: vis('.pa-header__title'),
      search: vis('#navbarSearchTrigger'),
      wordmarkFull: vis('[data-pa-fit-step="0"]'),
      monogram: vis('[data-pa-fit-step="1"]')
    };
  });
}

test('header degrades strictly by priority across widths, restores when wide', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('search-position', 'navbar-compact'));
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');

  // Wide: nothing degraded.
  await page.waitForTimeout(120);
  let s = await state(page);
  expect(s).toMatchObject({ version: true, title: true, search: true, wordmarkFull: true, monogram: false });

  // Sweep narrower and assert the invariant at every step.
  let sawVersionDrop = false;
  for (const w of [1100, 960, 820, 700, 560, 440, 360, 320]) {
    await page.setViewportSize({ width: w, height: 800 });
    await page.waitForTimeout(120);
    s = await state(page);

    // Priority order: lower drops first, so a degraded slot implies every
    // lower-priority slot is already degraded.
    if (!s.title) expect(s.version).toBe(false);         // title(20) ⇒ version(10) gone
    if (!s.search) expect(s.title).toBe(false);          // search(25) ⇒ title(20) gone
    if (s.monogram) {                                     // wordmark(30) shrank ⇒ all below gone
      expect(s.search).toBe(false);
      expect(s.wordmarkFull).toBe(false);
    }
    if (!s.version) sawVersionDrop = true;
  }
  expect(sawVersionDrop).toBe(true); // the sweep actually exercised degradation

  // Squeeze to an extreme width so even "Pure Admin" won't fit: the brand `steps`
  // slot must degrade past step 0 (to the "PA" monogram, then hidden).
  await page.setViewportSize({ width: 200, height: 800 });
  await page.waitForTimeout(120);
  s = await state(page);
  expect(s.wordmarkFull).toBe(false); // step 0 gave way — steps engaged

  // Widen back to full: deterministic reset-then-degrade restores everything.
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(120);
  s = await state(page);
  expect(s).toMatchObject({ version: true, title: true, search: true, wordmarkFull: true, monogram: false });
});
