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
});
