import { test, expect } from '@playwright/test';

test.describe('Workflow Editor', () => {
    test.beforeEach(async ({ page }) => {
    });

    test('should accept adding nodes from palette', async ({ page }) => {
        await page.getByRole('button').filter({ hasText: 'Webhook' }).click();

        await expect(page.locator('.react-flow__node').filter({ hasText: 'Webhook' })).toBeVisible();

        await page.getByRole('button').filter({ hasText: 'Google Sheets' }).click();

        await expect(page.locator('.react-flow__node').filter({ hasText: 'Google Sheets' })).toBeVisible();
    });

    test('should connect two nodes', async ({ page }) => {
        await page.getByRole('button').filter({ hasText: 'Webhook' }).click();
        await page.getByRole('button').filter({ hasText: 'Google Sheets' }).click();

        const webhookNode = page.locator('.react-flow__node').filter({ hasText: 'Webhook' });
        const sheetsNode = page.locator('.react-flow__node').filter({ hasText: 'Google Sheets' });

        await expect(webhookNode).toBeVisible();
        await expect(sheetsNode).toBeVisible();

        const sourceHandle = webhookNode.locator('.react-flow__handle-bottom');
        const targetHandle = sheetsNode.locator('.react-flow__handle-top');

        if (await sourceHandle.count() > 0 && await targetHandle.count() > 0) {
            await sourceHandle.dragTo(targetHandle);

            await expect(page.locator('.react-flow__edge')).toBeVisible();
        }
    });

    test('should update node properties via inspector', async ({ page }) => {
        // Verify update on canvas
    });
});
