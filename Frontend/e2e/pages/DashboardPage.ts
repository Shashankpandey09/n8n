import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
    readonly page: Page;
    readonly workflowsHeading: Locator;
    readonly newWorkflowButton: Locator;
    readonly emptyStateTitle: Locator;
    readonly emptyStateDescription: Locator;

    constructor(page: Page) {
        this.page = page;
        this.workflowsHeading = page.getByRole('heading', { name: 'Workflows', level: 2 });
        this.newWorkflowButton = page.getByRole('button', { name: /New/i });
        this.emptyStateTitle = page.getByText('No workflows yet');
        this.emptyStateDescription = page.getByText('Create your first automation workflow');
    }

    async goto() {
        await this.page.goto('/dashboard');
    }

    async setupMockAuth() {
        await this.page.addInitScript(() => {
            localStorage.setItem('currentUser', JSON.stringify({ id: 1, email: 'test@user.com' }));
            localStorage.setItem('token', 'mock-token');
            localStorage.setItem('workflows', JSON.stringify([]));
        });
    }

    async mockWorkflowAPI() {
        await this.page.route('**/api/v1/workflow*', route => route.fulfill({
            status: 200,
            body: JSON.stringify({
                ok: true,
                workflow: {
                    id: 999,
                    title: "New Workflow",
                    nodes: [],
                    connections: [],
                    enabled: false,
                    createdAt: new Date().toISOString()
                }
            })
        }));
    }

    async mockCredentialAPI() {
        await this.page.route('**/api/v1/credential*', route => route.fulfill({
            status: 200,
            body: JSON.stringify({ value: [] })
        }));
    }

    async setupAllMocks() {
        await this.mockWorkflowAPI();
        await this.mockCredentialAPI();
        await this.setupMockAuth();
    }

    async createNewWorkflow() {
        await this.newWorkflowButton.click();
    }

    async expectWorkflowsHeadingVisible() {
        await expect(this.workflowsHeading).toBeVisible();
    }

    async expectNewButtonVisible() {
        await expect(this.newWorkflowButton).toBeVisible();
    }

    async expectEmptyStateVisible() {
        await expect(this.emptyStateTitle).toBeVisible();
        await expect(this.emptyStateDescription).toBeVisible();
    }

    async expectNavigatedToWorkflowEditor() {
        await expect(this.page).toHaveURL(/\/workflow\/\d+/);
    }
}
