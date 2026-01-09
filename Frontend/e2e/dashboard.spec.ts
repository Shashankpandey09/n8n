import { test, expect } from '@playwright/test';

test.describe('Dashboard and Workflow Lifecycle', () => {
    test.beforeEach(async ({ page }) => {


        await page.route('**/api/v1/workflow', route => route.fulfill({
            status: 200,
            body: JSON.stringify({ ok: true, workflow: { id: 999, title: "New Workflow", nodes: [], connections: [], enabled: false, createdAt: new Date().toISOString() } })
        }));

        await page.addInitScript(() => {
            localStorage.setItem('currentUser', JSON.stringify({ id: 1, email: 'test@user.com' }));
            localStorage.setItem('token', 'mock-token');
            localStorage.setItem('workflows', JSON.stringify([]));
        });

        await page.goto('/dashboard');
    });

    test('should display empty state or list of workflows', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Workflows' })).toBeVisible();

        await expect(page.getByRole('button', { name: 'New Workflow' })).toBeVisible();
    });

    test('should allow creating a new workflow', async ({ page }) => {
        await page.getByRole('button', { name: /New Workflow/i }).click();

        await expect(page).toHaveURL(/\/workflow\/\d+/);
    });

    test('should delete a workflow', async ({ page }) => {
        // Expect at least one workflow to exist for this test
        // Click delete button on a workflow card
        // Confirm deletion
        // Verify card is removed
    });
});
