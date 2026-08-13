import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the Pure Admin demo end-to-end tests.
 *
 * Specs live in e2e/ and drive the real demo server (Express, port 3000),
 * because the behaviours under test — the mobile sidebar / profile-panel
 * drawers, their scrims, and the background scroll-lock — are wired in the
 * demo's layout shell (`demo/views/layout.mustache`) on top of the core CSS.
 * The demo is served by `npm run start` and reused if already running locally.
 *
 * Commands:
 *   npm run test:e2e:install   # one-time: download the chromium browser binary
 *   npm run test:e2e           # headless run
 *   npm run test:e2e:ui        # Playwright Test UI (debugging)
 *   npm run test:e2e:headed    # watch the browser do its thing
 *
 * Viewports are set per spec via `test.use({ viewport })` — the drawers are an
 * overlay only below the 768px mobile breakpoint, so the mobile suite runs at a
 * phone size and the desktop counter-checks run at a desktop size.
 */
export default defineConfig({
    testDir: './e2e',
    timeout: 30_000,
    expect: { timeout: 5_000 },

    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,

    reporter: process.env.CI ? 'github' : 'list',

    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        }
    ],

    webServer: {
        command: 'npm run start',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
        stdout: 'ignore',
        stderr: 'pipe'
    }
});
