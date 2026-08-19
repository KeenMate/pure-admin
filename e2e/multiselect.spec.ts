import { test, expect } from '@playwright/test';

// Verifies the web-multiselect (v2.0.0-rc03) component renders on the demo page,
// including the new tree-of-options and ISCO-08 real-data examples.
test.describe('Web Multiselect page', () => {
  test('renders web-multiselect components (shadow DOM upgraded)', async ({ page }) => {
    await page.goto('/components/multiselect');

    // Wait for the custom element to be defined + upgraded.
    await page.waitForFunction(() => !!customElements.get('web-multiselect'));

    const hosts = page.locator('web-multiselect');
    const count = await hosts.count();
    expect(count).toBeGreaterThan(10);

    // Each host should have an attached shadow root with rendered content.
    const upgradedCount = await page.evaluate(() =>
      Array.from(document.querySelectorAll('web-multiselect'))
        .filter((el) => (el as HTMLElement & { shadowRoot: ShadowRoot | null }).shadowRoot
          && (el as HTMLElement).shadowRoot!.childElementCount > 0).length,
    );
    expect(upgradedCount).toBe(count);
  });

  test('basic tree renders indented branch/leaf rows when opened', async ({ page }) => {
    await page.goto('/components/multiselect');
    await page.waitForFunction(() => !!customElements.get('web-multiselect'));

    const tree = page.locator('#tree-basic');
    await expect(tree).toBeVisible();

    // Open the dropdown by clicking the control inside the shadow root.
    await tree.click();

    // Tree rows carry the branch/leaf theming hooks — assert at least one exists.
    await expect
      .poll(async () =>
        tree.evaluate((el) => {
          const sr = (el as HTMLElement).shadowRoot;
          if (!sr) return 0;
          return sr.querySelectorAll('.ms__option--tree-branch, .ms__option--tree-leaf').length;
        }),
      )
      .toBeGreaterThan(0);
  });

  test('ISCO-08 real-data tree loads 619 options', async ({ page }) => {
    await page.goto('/components/multiselect');
    await page.waitForFunction(() => !!customElements.get('web-multiselect'));

    await expect
      .poll(async () =>
        page.locator('#tree-isco').evaluate((el) => {
          const opts = (el as HTMLElement & { options?: unknown[] }).options;
          return Array.isArray(opts) ? opts.length : 0;
        }),
      )
      .toBe(619);
  });
});
