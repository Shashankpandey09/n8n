import { test, expect } from '@playwright/test';

test.describe('Workflow Editor', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('**/api/v1/credential*', route => route.fulfill({
            status: 200,
            body: JSON.stringify({ value: [] })
        }));

        await page.addInitScript(() => {
            const mockWorkflow = {
                id: 123,
                title: "Test Workflow",
                nodes: [],
                connections: [],
                enabled: false,
                createdAt: new Date().toISOString(),
                userId: 1
            };
            localStorage.setItem("workflows", JSON.stringify([mockWorkflow]));
            localStorage.setItem("currentUser", JSON.stringify({ id: 1 }));
            localStorage.setItem("token", "mock-token");
        });

        await page.goto('/workflow/123');
    });

    test('should display workflow editor with palette', async ({ page }) => {
        await expect(page.getByText('Node Palette')).toBeVisible();
        await expect(page.locator('.react-flow')).toBeVisible();
    });

    test('should add a Webhook trigger node', async ({ page }) => {
        await expect(page.getByText('Node Palette')).toBeVisible();

        const webhookBtn = page.getByRole('button').filter({ hasText: 'Webhook' });
        await webhookBtn.click();

        await expect(page.locator('.react-flow__node').filter({ hasText: 'webhook' })).toBeVisible({ timeout: 5000 });
    });

    test('should add an SMTP action node after trigger', async ({ page }) => {
        const webhookBtn = page.getByRole('button').filter({ hasText: 'Webhook' });
        await webhookBtn.click();

        await expect(page.locator('.react-flow__node').first()).toBeVisible();

        const smtpBtn = page.getByRole('button').filter({ hasText: 'SMTP' });
        await smtpBtn.click();

        await expect(page.locator('.react-flow__node')).toHaveCount(2, { timeout: 5000 });
    });

    test('should add a Discord action node after trigger', async ({ page }) => {
        const webhookBtn = page.getByRole('button').filter({ hasText: 'Webhook' });
        await webhookBtn.click();

        await expect(page.locator('.react-flow__node').first()).toBeVisible();

        const discordBtn = page.getByRole('button').filter({ hasText: 'Discord' });
        await discordBtn.click();

        await expect(page.locator('.react-flow__node')).toHaveCount(2, { timeout: 5000 });
    });

    test('should open node inspector when clicking a node', async ({ page }) => {
        const webhookBtn = page.getByRole('button').filter({ hasText: 'Webhook' });
        await webhookBtn.click();

        const node = page.locator('.react-flow__node').first();
        await expect(node).toBeVisible();

        await node.click();

        await expect(page.getByText('Node Configuration')).toBeVisible({ timeout: 5000 });
    });
});
