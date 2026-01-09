import { test } from '@playwright/test';
import { WorkflowEditorPage } from '../pages/WorkflowEditor.page';

test.describe('Workflow Editor (POM)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/credential*', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ value: [] }),
      })
    );

    await page.addInitScript(() => {
      const mockWorkflow = {
        id: 123,
        title: 'Test Workflow',
        nodes: [],
        connections: [],
        enabled: false,
        createdAt: new Date().toISOString(),
        userId: 1,
      };

      localStorage.setItem('workflows', JSON.stringify([mockWorkflow]));
      localStorage.setItem('currentUser', JSON.stringify({ id: 1 }));
      localStorage.setItem('token', 'mock-token');
    });
  });

  test('loads workflow editor', async ({ page }) => {
    const editor = new WorkflowEditorPage(page);

    await editor.goto(123);
    await editor.expectEditorLoaded();
  });

  test('adds webhook trigger', async ({ page }) => {
    const editor = new WorkflowEditorPage(page);

    await editor.goto(123);
    await editor.addNode('Webhook');
    await editor.expectNodeCount(1);
  });

  test('adds smtp action after trigger', async ({ page }) => {
    const editor = new WorkflowEditorPage(page);

    await editor.goto(123);
    await editor.addNode('Webhook');
    await editor.addNode('SMTP');
    await editor.expectNodeCount(2);
  });

  test('adds discord action after trigger', async ({ page }) => {
    const editor = new WorkflowEditorPage(page);

    await editor.goto(123);
    await editor.addNode('Webhook');
    await editor.addNode('Discord');
    await editor.expectNodeCount(2);
  });

  test('opens inspector on node click', async ({ page }) => {
    const editor = new WorkflowEditorPage(page);

    await editor.goto(123);
    await editor.addNode('Webhook');
    await editor.clickFirstNode();
    await editor.expectInspectorOpen();
  });
});
