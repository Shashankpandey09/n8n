import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages';

test.describe('Dashboard and Workflow Lifecycle', () => {
    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page }) => {
        dashboardPage = new DashboardPage(page);
        await dashboardPage.setupAllMocks();
        await dashboardPage.goto();
    });

    test('should display empty state or list of workflows', async ({ page }) => {
        await dashboardPage.expectWorkflowsHeadingVisible();
        await dashboardPage.expectNewButtonVisible();
    });

    test('should allow creating a new workflow', async ({ page }) => {
        await dashboardPage.createNewWorkflow();
        await dashboardPage.expectNavigatedToWorkflowEditor();
    });

    test('should show empty state when no workflows exist', async ({ page }) => {
        await dashboardPage.expectEmptyStateVisible();
    });
});
