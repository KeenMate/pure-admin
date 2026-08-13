import { test, expect, Page } from './fixtures';

/**
 * Mobile drawer consistency — the mobile sidebar and profile-panel overlays
 * must behave identically: a ~90vw sheet, a real dimming scrim, and a locked
 * background. On desktop neither is a modal overlay. These tests pin the three
 * regressions we just fixed:
 *
 *   1. the sidebar drawer wouldn't close when the scrim (a body::before pseudo)
 *      was tapped, because the handler only matched `event.target === body`;
 *   2. the profile scrim rendered off-screen (0-width shrink-to-fit container),
 *      so the page scrolled behind an "overlay" that wasn't there;
 *   3. the profile scroll-lock used `overflow-y: scroll`, which never locked.
 *
 * The layout shell is identical on every demo page; a light page (no charts)
 * keeps the run fast and CDN-independent. NATO is a crisp light theme where the
 * shared backdrop resolves to a known rgba().
 */
const PAGE = '/components/buttons?theme=nato';

const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1440, height: 1024 };

async function gotoShell(page: Page): Promise<void> {
    await page.goto(PAGE);
    // The full-screen page loader intercepts clicks until fonts settle (≤1s);
    // wait for it to be removed so the drawer toggles are actually clickable.
    await page.locator('.page-loader').waitFor({ state: 'detached', timeout: 8_000 });
}

/** Inline `position` written by lockBodyScroll(); '' once released. */
function bodyPosition(page: Page): Promise<string> {
    return page.evaluate(() => document.body.style.position);
}

/** className of the top-most element at a viewport point ('' if none). */
function elementClassAt(page: Page, x: number, y: number): Promise<string> {
    return page.evaluate(({ x, y }) => {
        const el = document.elementFromPoint(x, y);
        return el ? String((el as HTMLElement).className ?? '') : '';
    }, { x, y });
}

test.describe('mobile drawers', () => {
    test.use({ viewport: MOBILE, hasTouch: true });

    test.beforeEach(async ({ page }) => {
        await gotoShell(page);
    });

    test('sidebar drawer opens to ~90vw, dims the page, and locks background scroll', async ({ page }) => {
        await page.locator('.burger-menu').click();
        await expect(page.locator('body')).toHaveClass(/sidebar-visible/);

        // ~90vw of 390 = 351px (allow border/sub-pixel slack).
        const box = (await page.locator('.pa-layout__sidebar').boundingBox())!;
        expect(box.width).toBeGreaterThan(340);
        expect(box.width).toBeLessThan(362);

        // The scrim (body::before) is painted with the shared mobile backdrop.
        const scrim = await page.evaluate(
            () => getComputedStyle(document.body, '::before').backgroundColor
        );
        expect(scrim).toBe('rgba(0, 0, 0, 0.5)');

        // Background is scroll-locked (body pinned position:fixed).
        expect(await bodyPosition(page)).toBe('fixed');
    });

    test('tapping the scrim closes the sidebar drawer and releases the scroll lock', async ({ page }) => {
        await page.locator('.burger-menu').click();
        await expect(page.locator('body')).toHaveClass(/sidebar-visible/);
        expect(await bodyPosition(page)).toBe('fixed');

        // Tap in the dim strip to the right of the ~351px drawer. This is the
        // exact spot that used to report `.pa-layout` (not body) as the target
        // and leave the drawer stuck open.
        await page.mouse.click(380, 420);

        await expect(page.locator('body')).not.toHaveClass(/sidebar-visible/);
        expect(await bodyPosition(page)).toBe('');
    });

    test('profile panel opens as a full ~90vw drawer with a scrim over the viewport and locks scroll', async ({ page }) => {
        await page.locator('.pa-header__profile-btn').click();
        await expect(page.locator('#profilePanel')).toHaveClass(/pa-profile-panel--open/);

        // Panel content matches the sidebar drawer width (~90vw), not the
        // desktop narrow sheet.
        const cbox = (await page.locator('.pa-profile-panel__content').boundingBox())!;
        expect(cbox.width).toBeGreaterThan(340);
        expect(cbox.width).toBeLessThan(362);

        // The overlay spans the whole viewport (this was off-screen before).
        const overlay = page.locator('.pa-profile-panel__overlay');
        const obox = (await overlay.boundingBox())!;
        expect(obox.x).toBeLessThanOrEqual(1);
        expect(obox.width).toBeGreaterThanOrEqual(389);

        // The scrim really covers the page at the left strip (left of the panel).
        expect(await elementClassAt(page, 6, 400)).toContain('pa-profile-panel__overlay');

        // Scrim tint matches the sidebar backdrop, and the page is locked.
        const bg = await overlay.evaluate((el) => getComputedStyle(el).backgroundColor);
        expect(bg).toBe('rgba(0, 0, 0, 0.5)');
        expect(await bodyPosition(page)).toBe('fixed');
    });

    test('the sidebar drawer and profile panel slide with the same transition timing (in sync)', async ({ page }) => {
        const readTiming = (sel: string) =>
            page.locator(sel).evaluate((el) => {
                const s = getComputedStyle(el);
                return {
                    transform: s.transform,
                    dur: s.transitionDuration.split(',')[0].trim(),
                    ease: s.transitionTimingFunction.split(',')[0].trim()
                };
            });

        const sidebar = await readTiming('.pa-layout__sidebar');
        const profile = await readTiming('.pa-profile-panel__content');

        // The drawer is parked off-canvas (a real transform), so opening slides
        // it in — not a width:0 → 90vw snap.
        expect(sidebar.transform).not.toBe('none');
        expect(parseFloat(sidebar.dur)).toBeGreaterThan(0);

        // Same duration + easing as the profile panel's sliding element.
        expect(sidebar.dur).toBe(profile.dur);
        expect(sidebar.ease).toBe(profile.ease);
    });

    test('tapping the profile scrim closes the panel and releases the scroll lock', async ({ page }) => {
        await page.locator('.pa-header__profile-btn').click();
        await expect(page.locator('#profilePanel')).toHaveClass(/pa-profile-panel--open/);
        expect(await bodyPosition(page)).toBe('fixed');

        // Click the visible scrim strip (left 10vw), not the panel over the right.
        await page.locator('.pa-profile-panel__overlay').click({ position: { x: 6, y: 400 } });

        await expect(page.locator('#profilePanel')).not.toHaveClass(/pa-profile-panel--open/);
        expect(await bodyPosition(page)).toBe('');
    });
});

test.describe('desktop: panels are not modal overlays', () => {
    test.use({ viewport: DESKTOP });

    test.beforeEach(async ({ page }) => {
        await gotoShell(page);
    });

    test('profile panel is a narrow side sheet with no page scrim and no scroll-lock', async ({ page }) => {
        await page.locator('.pa-header__profile-btn').click();
        await expect(page.locator('#profilePanel')).toHaveClass(/pa-profile-panel--open/);

        // 20vw with a 480px cap — nowhere near a full-width drawer.
        const cbox = (await page.locator('.pa-profile-panel__content').boundingBox())!;
        expect(cbox.width).toBeLessThanOrEqual(500);
        expect(cbox.width).toBeLessThan(DESKTOP.width * 0.5);

        // No scrim dims the page: the viewport centre is page content, not the
        // overlay (which stays off-screen on desktop).
        expect(await elementClassAt(page, 720, 512)).not.toContain('pa-profile-panel__overlay');

        // Background scroll stays unlocked (the panel is non-modal on desktop).
        expect(await bodyPosition(page)).not.toBe('fixed');
    });
});
