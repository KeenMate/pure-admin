import { test, expect, Page } from './fixtures';

/**
 * Masked icon primitive (.pa-icon / .pa-icon--x) — the provider-agnostic icon
 * hook that replaces the old ✕/× text glyphs on close/remove affordances. This
 * verifies the mask actually resolves and paints (a wrong data-URI would leave
 * an invisible, zero-mask box that silently looks "fine" in the DOM).
 */
const PAGE = '/components/buttons?theme=nato';

async function gotoShell(page: Page): Promise<void> {
    await page.goto(PAGE);
    await page.locator('.page-loader').waitFor({ state: 'detached', timeout: 8_000 });
}

test.beforeEach(async ({ page }) => {
    await gotoShell(page);
});

test('the profile close X renders as a masked .pa-icon--x (not a text glyph)', async ({ page }) => {
    await page.locator('.pa-header__profile-btn').click();
    await expect(page.locator('#profilePanel')).toHaveClass(/pa-profile-panel--open/);

    const icon = page.locator('.pa-profile-panel__close .pa-icon--x');
    await expect(icon).toBeVisible();

    const s = await icon.evaluate((el) => {
        const cs = getComputedStyle(el);
        const box = el.getBoundingClientRect();
        return {
            mask: cs.maskImage || (cs as any).webkitMaskImage,
            bg: cs.backgroundColor,
            w: box.width,
            h: box.height,
            text: (el.textContent || '').trim()
        };
    });

    // A resolved SVG mask (not 'none'), painted in currentColor, at a real size,
    // with no glyph text left behind.
    expect(s.mask).toContain('svg');
    expect(s.mask).not.toBe('none');
    expect(s.bg).not.toBe('rgba(0, 0, 0, 0)'); // currentColor resolved to a real colour
    expect(s.w).toBeGreaterThan(6);
    expect(s.h).toBeGreaterThan(6);
    expect(s.text).toBe('');
});

test('component close/dismiss buttons render masked icons, not text glyphs', async ({ page }) => {
    // The X-glyph sweep converted every close/remove/clear affordance from a
    // literal ✕/× to the masked .pa-icon--x. Guard the two highest-traffic
    // demo surfaces so a stray text glyph can't creep back in.
    const routes: Array<[string, string]> = [
        ['/components/modals', '.pa-modal__header .pa-btn--icon-only'],
        ['/components/alerts', '.pa-alert__close']
    ];
    for (const [route, closeSelector] of routes) {
        await page.goto(route);
        await page.locator('.page-loader').waitFor({ state: 'detached', timeout: 8_000 });

        const closes = page.locator(closeSelector);
        const n = await closes.count();
        expect(n, `expected close buttons on ${route}`).toBeGreaterThan(0);

        for (let i = 0; i < n; i++) {
            const btn = closes.nth(i);
            // Every close button carries a masked icon child …
            await expect(btn.locator('.pa-icon--x')).toHaveCount(1);
            // … and no leftover ✕ / × text glyph.
            const text = (await btn.textContent() || '').trim();
            expect(text, `stray glyph in ${route} close #${i}: "${text}"`).not.toMatch(/[✕×]/);
        }
    }
});

test('a JS-generated toast gets a masked close icon (not a text glyph)', async ({ page }) => {
    await page.goto('/components/toasts');
    await page.locator('.page-loader').waitFor({ state: 'detached', timeout: 8_000 });

    // Toasts are created at runtime by toast-service — trigger one and inspect it.
    await page.locator('[onclick^="showToast("]').first().click();
    const close = page.locator('.pa-toast .pa-toast__close').first();
    await expect(close).toBeVisible();
    await expect(close.locator('.pa-icon--x')).toHaveCount(1);
    expect(((await close.textContent()) || '').trim()).not.toMatch(/[✕×]/);
});

test('the close icon uses a header-aware colour that contrasts the panel header', async ({ page }) => {
    await page.locator('.pa-header__profile-btn').click();
    await expect(page.locator('#profilePanel')).toHaveClass(/pa-profile-panel--open/);

    const colors = await page.evaluate(() => {
        const close = document.querySelector('.pa-profile-panel__close') as HTMLElement;
        const name = document.querySelector('.pa-profile-panel__name') as HTMLElement;
        const header = document.querySelector('.pa-profile-panel__header') as HTMLElement;
        return {
            close: getComputedStyle(close).color,
            name: getComputedStyle(name).color,
            headerBg: getComputedStyle(header).backgroundColor
        };
    });

    // The close button (and thus its masked icon, via currentColor) tracks the
    // header-aware name colour, not a content token — so it can't vanish on a
    // dark/coloured header (the NATO-navy regression).
    expect(colors.close).toBe(colors.name);
    expect(colors.close).not.toBe(colors.headerBg);
});
