import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:8081', 
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                headless: false,
                launchOptions: {
                    slowMo: 500, 
                }
            },
        },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:8081',
        reuseExistingServer: true,
        timeout: 120 * 1000,
        ignoreStdout: true,
    },
});
