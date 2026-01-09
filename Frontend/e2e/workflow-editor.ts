import { Page, Locator, expect } from '@playwright/test';

export class WorkflowEditorPage {
  readonly page: Page;

  // Locators
  readonly nodePalette: Locator;
  readonly reactFlow: Locator;
  readonly nodes: Locator;

  constructor(page: Page) {
    this.page = page;

    this.nodePalette = page.getByText('Node Palette');
    this.reactFlow = page.locator('.react-flow');
    this.nodes = page.locator('.react-flow__node');
  }

  async goto(workflowId: number) {
    await this.page.goto(`/workflow/${workflowId}`);
  }

  async expectEditorLoaded() {
    await expect(this.nodePalette).toBeVisible();
    await expect(this.reactFlow).toBeVisible();
  }

  async addNode(nodeName: 'Webhook' | 'SMTP' | 'Discord') {
    const button = this.page
      .getByRole('button')
      .filter({ hasText: nodeName });

    await button.click();
  }

  async clickFirstNode() {
    await expect(this.nodes.first()).toBeVisible();
    await this.nodes.first().click();
  }

  async expectNodeCount(count: number) {
    await expect(this.nodes).toHaveCount(count);
  }

  async expectInspectorOpen() {
    await expect(this.page.getByText('Node Configuration')).toBeVisible();
  }
}
