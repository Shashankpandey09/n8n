import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    // Reset storage state before each test if needed or ensure clean slate
    // For now we assume we start fresh or clear storage

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
    });

    test('should allow a user to sign in', async ({ page }) => {
        await page.goto('/auth');

        await page.fill('#email', 'test@example.com');
        await page.fill('#password', 'password123');

        await page.getByRole('button', { name: 'Sign In' }).click();

    });

    test('should show validation error for empty fields', async ({ page }) => {
        await page.goto('/auth');
        await page.getByRole('button', { name: 'Sign In' }).click();

        await expect(page.getByText('Please fill all fields')).toBeVisible();
    });

    test('should navigate between Sign In and Sign Up', async ({ page }) => {
        await page.goto('/auth');

        const toggleButton = page.getByText("Don't have an account? Sign up");
        await toggleButton.click();

        await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
    });
});
