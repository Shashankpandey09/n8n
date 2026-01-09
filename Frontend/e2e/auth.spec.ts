import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
    });

    test('should allow a user to sign in', async ({ page }) => {
        await page.goto('/Auth');

        // Type like a human - character by character
        await page.locator('#email').click();
        await page.locator('#email').type('test@example.com', { delay: 50 });

        await page.locator('#password').click();
        await page.locator('#password').type('SecurePass@123', { delay: 50 });

        const submitBtn = page.getByRole('button', { name: 'Sign In' });
        await expect(submitBtn).toBeEnabled();
        await submitBtn.click();
    });

    test('should show validation error for empty fields', async ({ page }) => {
        await page.goto('/Auth');

        await page.evaluate(() => {
            document.querySelector('form')?.setAttribute('novalidate', 'true');
        });

        await page.getByRole('button', { name: 'Sign In' }).click();

        await expect(page.getByText('Please fill all fields')).toBeVisible({ timeout: 10000 });
    });

    test('should navigate between Sign In and Sign Up', async ({ page }) => {
        await page.goto('/Auth');

        const toggleButton = page.getByText("Don't have an account? Sign up");
        await toggleButton.click();

        await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
    });

    test('should allow a user to sign up', async ({ page }) => {
        await page.goto('/Auth');

        // Switch to Sign Up mode
        await page.getByText("Don't have an account? Sign up").click();

        // Type email like a human
        await page.locator('#email').click();
        await page.locator('#email').type('newuser@example.com', { delay: 50 });

        // Type password like a human
        await page.locator('#password').click();
        await page.locator('#password').type('MySecure@Pass2024', { delay: 50 });

        const submitBtn = page.getByRole('button', { name: 'Create Account' });
        await expect(submitBtn).toBeEnabled();
        await submitBtn.click();
    });
});
