import { test, expect } from '@playwright/test';
import { WorkflowEditorPage } from '../pages';

test.describe('Workflow Editor', () => {
    let workflowEditor: WorkflowEditorPage;

    test.beforeEach(async ({ page }) => {
        workflowEditor = new WorkflowEditorPage(page);
        await workflowEditor.setupAllMocks();
        await workflowEditor.goto();
    });

    test('should display workflow editor with palette', async ({ page }) => {
        await workflowEditor.expectPaletteVisible();
        await workflowEditor.expectCanvasVisible();
    });

    test('should add a Webhook trigger node', async ({ page }) => {
        await workflowEditor.expectPaletteVisible();
        await workflowEditor.addWebhookNode();
        await workflowEditor.expectWebhookNodeVisible();
    });

    test('should add an SMTP action node after trigger', async ({ page }) => {
        await workflowEditor.addWebhookNode();
        await workflowEditor.expectFirstNodeVisible();
        await workflowEditor.addSmtpNode();
        await workflowEditor.expectNodeCount(2);
    });

    test('should add a Discord action node after trigger', async ({ page }) => {
        await workflowEditor.addWebhookNode();
        await workflowEditor.expectFirstNodeVisible();
        await workflowEditor.addDiscordNode();
        await workflowEditor.expectNodeCount(2);
    });

    test('should open node inspector when clicking a node', async ({ page }) => {
        await workflowEditor.addWebhookNode();
        await workflowEditor.expectFirstNodeVisible();
        await workflowEditor.clickFirstNode();
        await workflowEditor.expectNodeConfigPanelVisible();
    });
});
