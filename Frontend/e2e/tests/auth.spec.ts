import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages';

test.describe('Authentication Flow', () => {
    let authPage: AuthPage;

    test.beforeEach(async ({ page }) => {
        authPage = new AuthPage(page);
        await page.goto('/');
        await authPage.clearLocalStorage();
    });

    test('should allow a user to sign in', async ({ page }) => {
        await authPage.goto();
        await authPage.signIn('test@example.com', 'SecurePass@123');
    });

    test('should show validation error for empty fields', async ({ page }) => {
        await authPage.goto();
        await authPage.submitEmptyForm();
        await authPage.expectValidationErrorVisible();
    });

    test('should navigate between Sign In and Sign Up', async ({ page }) => {
        await authPage.goto();
        await authPage.switchToSignUp();
        await authPage.expectCreateAccountButtonVisible();
    });

    test('should allow a user to sign up', async ({ page }) => {
        await authPage.goto();
        await authPage.signUp('newuser@example.com', 'MySecure@Pass2024');
    });
});
