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
      version: vis('.pa-app-header__version'),
      title: vis('.pa-page-header'),
      search: vis('#navbarSearchTrigger'),
      wordmarkFull: vis('[data-pc-fit-step="0"]'),
      monogram: vis('[data-pc-fit-step="1"]')
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

// data-pc-fit-auto arms a container so untagged children fold too; a declared
// data-pc-fit still keeps its own priority; data-pc-fit-ignore pins an element
// out of the fit set entirely. Driven through a controlled row injected into the
// live demo (real CSS + the real fit.js engine), sized directly.
test('fit-auto folds untagged children by priority; fit-ignore stays pinned', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(80);

  await page.evaluate(() => {
    const host = document.createElement('div');
    host.id = 'fitHost';
    host.style.cssText = 'position:fixed;top:120px;left:0;width:600px;z-index:99999;background:#fff';
    // Three equal 150px items in an armed row: IMPL has no data-pc-fit (implicit,
    // default priority 0 → folds first), RANK is a declared slot at priority 50,
    // PIN carries data-pc-fit-ignore (never folds).
    host.innerHTML =
      '<div class="pa-navbar__inner" data-pc-fit-auto style="width:100%">' +
        '<div id="ft-impl" style="flex:0 0 auto;width:150px">IMPL</div>' +
        '<div id="ft-rank" data-pc-fit="hide" data-pc-fit-priority="50" style="flex:0 0 auto;width:150px">RANK</div>' +
        '<button id="ft-pin" data-pc-fit-ignore style="flex:0 0 auto;width:150px">PIN</button>' +
      '</div>';
    document.body.appendChild(host);
    (window as any).pureAdmin.components.fit.init(host.firstElementChild);
  });

  const vis = (id: string) => page.evaluate((i) => {
    const el = document.getElementById(i);
    return !!el && getComputedStyle(el).display !== 'none';
  }, id);
  const setWidth = async (w: number) => {
    await page.evaluate((px) => {
      document.getElementById('fitHost')!.style.width = px + 'px';
      (window as any).pureAdmin.components.fit.relayoutAll();
    }, w);
    await page.waitForTimeout(120);
  };

  // Wide — everything fits, nothing folded.
  await setWidth(600);
  expect(await vis('ft-impl')).toBe(true);
  expect(await vis('ft-rank')).toBe(true);
  expect(await vis('ft-pin')).toBe(true);

  // Tight — one item must go: the implicit slot (priority 0) folds before the
  // declared priority-50 slot; the ignored button never participates.
  await setWidth(360);
  expect(await vis('ft-impl')).toBe(false);
  expect(await vis('ft-rank')).toBe(true);
  expect(await vis('ft-pin')).toBe(true);

  // Tighter — the declared slot folds too; the ignored button still stays.
  await setWidth(200);
  expect(await vis('ft-rank')).toBe(false);
  expect(await vis('ft-pin')).toBe(true);

  // Widen back — reset-then-degrade restores the folded slots.
  await setWidth(600);
  expect(await vis('ft-impl')).toBe(true);
  expect(await vis('ft-rank')).toBe(true);

  await page.evaluate(() => document.getElementById('fitHost')?.remove());
});
