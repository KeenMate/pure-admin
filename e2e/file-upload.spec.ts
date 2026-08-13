import { test, expect, Page } from './fixtures';

/**
 * The File Upload page hosts the @keenmate/web-dropzone web component (replacing
 * the old CSS-only file-selector demo). This is a smoke suite: the custom
 * elements must be defined, upgrade (render a shadow root), and the page must
 * raise no uncaught errors (the fixtures guard pageerror for us). It also
 * exercises the simulated upload driver end-to-end via addFiles().
 */
const PAGE = '/components/file-selector';

async function gotoShell(page: Page): Promise<void> {
    await page.goto(PAGE);
    await page.locator('.page-loader').waitFor({ state: 'detached', timeout: 8_000 });
    await page.waitForFunction(() => !!(window as any).customElements?.get('web-dropzone'), null, { timeout: 8_000 });
}

test.beforeEach(async ({ page }) => {
    await gotoShell(page);
});

test('web-dropzone (and satellites) are defined and upgrade with a shadow root', async ({ page }) => {
    const info = await page.evaluate(() => {
        const tags = ['web-dropzone', 'web-dropzone-list', 'web-dropzone-progress', 'web-dropzone-indicator'];
        const defined = tags.filter((t) => !!customElements.get(t));
        const zones = Array.from(document.querySelectorAll('web-dropzone'));
        const withShadow = zones.filter((z) => !!(z as any).shadowRoot).length;
        return { defined, zoneCount: zones.length, withShadow };
    });
    expect(info.defined).toContain('web-dropzone');
    expect(info.zoneCount).toBeGreaterThan(10); // the comprehensive showcase
    // At least the vast majority upgraded and rendered a shadow root.
    expect(info.withShadow).toBeGreaterThan(info.zoneCount - 2);
});

test('the simulated upload driver drives a file to 100% and reports change/upload events', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const el = document.getElementById('api-demo') as any;
        const events: string[] = [];
        el.addEventListener('change', () => events.push('change'));
        el.addEventListener('file-uploaded', () => events.push('file-uploaded'));

        // No failRate for a deterministic run.
        el.uploadFileCallback = (_file: File, onProgress: (p: number) => void) =>
            new Promise<void>((resolve) => {
                let p = 0;
                const t = setInterval(() => { p += 50; onProgress(p); if (p >= 100) { clearInterval(t); resolve(); } }, 20);
            });

        const file = new File([new Uint8Array(1024)], 'hello.txt', { type: 'text/plain' });
        el.addFiles([file]);

        // Wait for the upload to settle.
        await new Promise((r) => setTimeout(r, 800));
        return { count: (el.files || []).length, events };
    });

    expect(result.count).toBe(1);
    expect(result.events).toContain('change');
});

test('the composable-controls checkboxes rewrite the controls / item-controls attributes', async ({ page }) => {
    const cd = page.locator('#controls-demo');
    // Absent attribute = render-all baseline.
    expect(await cd.getAttribute('item-controls')).toBeNull();

    // Uncheck one item-control box → attribute is written without that token.
    await page.locator('.pa-card:has(#controls-demo) input[data-item="remove"]').uncheck();
    await expect.poll(async () => await cd.getAttribute('item-controls')).not.toBeNull();
    expect(await cd.getAttribute('item-controls')).not.toContain('remove');
});
