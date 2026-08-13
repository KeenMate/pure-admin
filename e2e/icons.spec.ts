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
