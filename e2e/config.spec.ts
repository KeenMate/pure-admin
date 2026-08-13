import { test, expect, Page } from './fixtures';

/**
 * pureAdmin.config — the shared UI-behavior baseline. First key: mobileBreakpoint,
 * single-sourced from SCSS `$mobile-breakpoint` via the `--pa-mobile-breakpoint`
 * CSS variable (so JS and CSS can't drift). See docs/config-shared-ui-baseline.md.
 */
const PAGE = '/components/buttons?theme=nato';

async function gotoShell(page: Page): Promise<void> {
    await page.goto(PAGE);
    await page.locator('.page-loader').waitFor({ state: 'detached', timeout: 8_000 });
}

test.describe('pureAdmin.config', () => {
    test.beforeEach(async ({ page }) => {
        await gotoShell(page);
    });

    test('mobileBreakpoint is derived from the --pa-mobile-breakpoint CSS variable', async ({ page }) => {
        const { configValue, cssValue } = await page.evaluate(() => ({
            configValue: (window as any).pureAdmin?.config?.mobileBreakpoint,
            cssValue: getComputedStyle(document.documentElement)
                .getPropertyValue('--pa-mobile-breakpoint')
                .trim()
        }));

        expect(configValue).toBe(768);           // the SCSS $mobile-breakpoint default
        expect(cssValue).toBe('768px');           // one source, emitted to CSS
        expect(parseFloat(cssValue)).toBe(configValue); // JS derives from CSS, no drift
    });

    test('a consumer override set before init is honoured (not clobbered by the default)', async ({ page }) => {
        // Set the override BEFORE the framework bootstrap runs, then load.
        await page.addInitScript(() => {
            (window as any).pureAdmin = (window as any).pureAdmin || {};
            (window as any).pureAdmin.config = { mobileBreakpoint: 900 };
        });
        await gotoShell(page);

        const value = await page.evaluate(() => (window as any).pureAdmin?.config?.mobileBreakpoint);
        expect(value).toBe(900);
    });

    test('ships toast + severity + debounce defaults', async ({ page }) => {
        const cfg = await page.evaluate(() => {
            const c = (window as any).pureAdmin.config;
            return {
                debounce: c.typingDebounceDelay,
                position: c.toast.position,
                duration: c.toast.duration,
                successIcon: c.severity.success.icon,
                dangerTitle: c.severity.danger.title
            };
        });
        expect(cfg).toEqual({
            debounce: 300,
            position: 'top-end', // logical, RTL-aware
            duration: 5000,
            successIcon: '✓',
            dangerTitle: 'Error'
        });
    });

    test('exposes the motion scale (transition.* in ms + easing), mirrored from the CSS vars', async ({ page }) => {
        const t = await page.evaluate(() => (window as any).pureAdmin.config.transition);
        // Mirrors SCSS $transition-* (speed 1): 0.1/0.15/0.25/0.3s → ms.
        expect(t).toEqual({ fast: 100, normal: 150, medium: 250, slow: 300, easing: 'ease-out' });
    });
});

test.describe('toast-service reads config.severity / config.toast', () => {
    test.beforeEach(async ({ page }) => {
        await gotoShell(page);
    });

    test('a toast renders the icon + title from config.severity', async ({ page }) => {
        await page.evaluate(() => (window as any).pureAdmin.toast.success('Saved'));

        const toast = page.locator('.pa-toast--success').first();
        await expect(toast).toBeVisible();
        await expect(toast.locator('.pa-toast__icon')).toHaveText('✓');
        await expect(toast.locator('.pa-toast__title')).toHaveText('Success');
    });

    test('an override of config.toast.position + config.severity routes and renders accordingly', async ({ page }) => {
        // Override BEFORE bootstrap: whole-object severity override + a position.
        await page.addInitScript(() => {
            (window as any).pureAdmin = (window as any).pureAdmin || {};
            (window as any).pureAdmin.config = {
                toast: { position: 'bottom-center' },
                severity: { info: { icon: '🔔', title: 'Heads up' } }
            };
        });
        await gotoShell(page);

        await page.evaluate(() => (window as any).pureAdmin.toast.info('Ping'));

        // Lands in the bottom-center container (position override honoured)…
        const toast = page.locator('#toast-container-bottom-center .pa-toast--info').first();
        await expect(toast).toBeVisible();
        // …with the overridden icon + title (severity override honoured).
        await expect(toast.locator('.pa-toast__icon')).toHaveText('🔔');
        await expect(toast.locator('.pa-toast__title')).toHaveText('Heads up');
    });
});
