import type { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class AccessPointPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/access-point-configuration');
    await this.page.waitForSelector('text=Access Point Configuration');
  }

  async clickAddAccessPoint(): Promise<void> {
    await this.page.locator('button:has-text("Add Access Point Config")').click();
    await this.page.waitForSelector('text=Add Access Point Configuration');
  }

  async fillAccessPointDetails(data: {
    id?: string;
    name: string;
    validFrom?: string;
    expiryDate?: string;
    endpointUrl: string;
    helpdeskEmail: string;
    helpdeskUrl: string;
    certificate: string;
  }): Promise<void> {
    if (data.id) {
      await this.page.getByRole('textbox', { name: 'e.g. ABCAP2' }).fill(data.id);
    }
    
    await this.page.getByRole('textbox', { name: 'e.g. ABC Solution (Test)' }).fill(data.name);
    
    if (data.validFrom) {
      await this.page.getByPlaceholder('Select activation date').fill(data.validFrom);
    }
    
    if (data.expiryDate) {
      await this.page.getByPlaceholder('Select expiry date').fill(data.expiryDate);
    }
    
    // Endpoint URL (strip https:// if provided as it's prepended in UI)
    const endpoint = data.endpointUrl.replace(/^https?:\/\//, '');
    await this.page.getByPlaceholder('test.galaxygw.com/server/as4').fill(endpoint);
    
    await this.page.getByRole('textbox', { name: 'e.g. support@abcsolution.com' }).fill(data.helpdeskEmail);
    
    // Helpdesk URL (strip https:// if provided)
    const helpdesk = data.helpdeskUrl.replace(/^https?:\/\//, '');
    await this.page.getByPlaceholder('abcsolution.com/peppol').fill(helpdesk);
    
    // Certificate
    await this.page.getByRole('button', { name: 'Paste Text' }).click();
    await this.page.getByPlaceholder('Paste the certificate text here. The field supports .pem formatted content.').fill(data.certificate);
  }

  async save(): Promise<void> {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async editFirstEntry(): Promise<void> {
    await this.page.locator('button:has-text("Edit")').first().click();
  }

  async deleteAccessPoint(name: string): Promise<void> {
    const card = this.page.locator('.MuiPaper-root', { hasText: name }).first();
    if (await card.isVisible()) {
      await card.getByRole('button', { name: 'Edit' }).click();
      await this.page.getByRole('button', { name: 'Delete' }).click();
      await this.page.getByRole('button', { name: 'Yes' }).click();
      // Wait for success toast or card to disappear
      await this.page.waitForSelector('text=Deleted successfully', { timeout: 10000 }).catch(() => {});
      await card.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }
  }

  async deleteAllByName(name: string): Promise<void> {
    let card = this.page.locator('.MuiPaper-root', { hasText: name }).first();
    while (await card.isVisible()) {
      await this.deleteAccessPoint(name);
      // Wait a bit for list update
      await this.page.waitForTimeout(1000);
      card = this.page.locator('.MuiPaper-root', { hasText: name }).first();
    }
  }

  async getFirstConfigName(): Promise<string | null> {
    return await this.page.locator('div:has(> button:has-text("Edit"))').first().locator('div').first().textContent();
  }
}
