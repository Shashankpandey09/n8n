import { Page, Locator, expect } from '@playwright/test';

export class WorkflowEditorPage {
    readonly page: Page;
    readonly nodePalette: Locator;
    readonly reactFlowCanvas: Locator;
    readonly nodeConfigPanel: Locator;
    readonly webhookButton: Locator;
    readonly smtpButton: Locator;
    readonly discordButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.nodePalette = page.getByText('Node Palette');
        this.reactFlowCanvas = page.locator('.react-flow');
        this.nodeConfigPanel = page.getByText('Node Configuration');
        this.webhookButton = page.getByRole('button').filter({ hasText: 'Webhook' });
        this.smtpButton = page.getByRole('button').filter({ hasText: 'SMTP' });
        this.discordButton = page.getByRole('button').filter({ hasText: 'Discord' });
    }

    async goto(workflowId: number = 123) {
        await this.page.goto(`/workflow/${workflowId}`);
    }

    async setupMockAuth(workflowId: number = 123) {
        await this.page.addInitScript((id) => {
            const mockWorkflow = {
                id: id,
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
        }, workflowId);
    }

    async mockCredentialAPI() {
        await this.page.route('**/api/v1/credential*', route => route.fulfill({
            status: 200,
            body: JSON.stringify({ value: [] })
        }));
    }

    async setupAllMocks(workflowId: number = 123) {
        await this.mockCredentialAPI();
        await this.setupMockAuth(workflowId);
    }

    // Node palette actions
    async addWebhookNode() {
        await this.webhookButton.click();
    }

    async addSmtpNode() {
        await this.smtpButton.click();
    }

    async addDiscordNode() {
        await this.discordButton.click();
    }

    // Node interactions
    getNodes() {
        return this.page.locator('.react-flow__node');
    }

    getFirstNode() {
        return this.page.locator('.react-flow__node').first();
    }

    getWebhookNode() {
        return this.page.locator('.react-flow__node').filter({ hasText: 'webhook' });
    }

    async clickFirstNode() {
        await this.getFirstNode().click();
    }

    // Assertions
    async expectPaletteVisible() {
        await expect(this.nodePalette).toBeVisible();
    }

    async expectCanvasVisible() {
        await expect(this.reactFlowCanvas).toBeVisible();
    }

    async expectWebhookNodeVisible() {
        await expect(this.getWebhookNode()).toBeVisible({ timeout: 5000 });
    }

    async expectFirstNodeVisible() {
        await expect(this.getFirstNode()).toBeVisible();
    }

    async expectNodeCount(count: number) {
        await expect(this.getNodes()).toHaveCount(count, { timeout: 5000 });
    }

    async expectNodeConfigPanelVisible() {
        await expect(this.nodeConfigPanel).toBeVisible({ timeout: 5000 });
    }
}
