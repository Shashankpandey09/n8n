import { Page, Locator, expect } from '@playwright/test';

export class AuthPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly signInButton: Locator;
    readonly createAccountButton: Locator;
    readonly toggleToSignUpLink: Locator;
    readonly validationError: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.locator('#email');
        this.passwordInput = page.locator('#password');
        this.signInButton = page.getByRole('button', { name: 'Sign In' });
        this.createAccountButton = page.getByRole('button', { name: 'Create Account' });
        this.toggleToSignUpLink = page.getByText("Don't have an account? Sign up");
        this.validationError = page.getByText('Please fill all fields');
    }

    async goto() {
        await this.page.goto('/Auth');
    }

    async clearLocalStorage() {
        await this.page.evaluate(() => localStorage.clear());
    }

    async fillEmail(email: string, humanLike = true) {
        await this.emailInput.click();
        if (humanLike) {
            await this.emailInput.type(email, { delay: 50 });
        } else {
            await this.emailInput.fill(email);
        }
    }

    async fillPassword(password: string, humanLike = true) {
        await this.passwordInput.click();
        if (humanLike) {
            await this.passwordInput.type(password, { delay: 50 });
        } else {
            await this.passwordInput.fill(password);
        }
    }

    async signIn(email: string, password: string) {
        await this.fillEmail(email);
        await this.fillPassword(password);
        await expect(this.signInButton).toBeEnabled();
        await this.signInButton.click();
    }

    async signUp(email: string, password: string) {
        await this.switchToSignUp();
        await this.fillEmail(email);
        await this.fillPassword(password);
        await expect(this.createAccountButton).toBeEnabled();
        await this.createAccountButton.click();
    }

    async switchToSignUp() {
        await this.toggleToSignUpLink.click();
    }

    async disableFormValidation() {
        await this.page.evaluate(() => {
            document.querySelector('form')?.setAttribute('novalidate', 'true');
        });
    }

    async submitEmptyForm() {
        await this.disableFormValidation();
        await this.signInButton.click();
    }

    async expectValidationErrorVisible() {
        await expect(this.validationError).toBeVisible({ timeout: 10000 });
    }

    async expectCreateAccountButtonVisible() {
        await expect(this.createAccountButton).toBeVisible();
    }
}
