import type { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class AddParticipantPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async clickAddParticipant(): Promise<void> {
    const addButton = this.page.locator('button:has-text("Add Participant")').first();
    await addButton.waitFor({ state: 'visible', timeout: 10000 });
    await addButton.click();
    // Wait for modal heading
    await this.page.locator('text=Participant Details').first().waitFor({ state: 'visible', timeout: 10000 });
  }

  async closeModal(): Promise<void> {
    await this.page.locator('button[aria-label="Close"], button:has-text("×")').first().click();
  }

  async fillCorpassParticipant(data: {
    countryCode: string;
    participantName: string;
    participantIdentifierPrefix: string;
    participantIdentifierSuffix: string;
    businessRepName: string;
    businessRepEmail: string;
  }): Promise<void> {
    // Fill Participant Name
    const participantNameInput = this.page.locator('input[placeholder*="ABC Company"]');
    await participantNameInput.fill(data.participantName);

    // Find and fill the suffix input (right side of Participant Identifier)
    const suffixInput = this.page.locator('input[placeholder*="SGUEN"], input[placeholder*="e.g. SGUEN"]').first();
    await suffixInput.waitFor({ state: 'visible', timeout: 5000 });
    await suffixInput.fill(data.participantIdentifierSuffix);

    // Scroll down to see Business Rep section
    const repNameInput = this.page.locator('input[placeholder*="John Lee"]');
    await repNameInput.scrollIntoViewIfNeeded();

    // Fill Business Representative Name
    await repNameInput.fill(data.businessRepName);

    // Fill Business Representative Email
    const repEmailInput = this.page.locator('input[placeholder*="abc@company.com"]');
    await repEmailInput.fill(data.businessRepEmail);
  }

  async fillPdfParticipant(data: {
    countryCode: string;
    participantName: string;
    participantIdentifierPrefix: string;
    participantIdentifierSuffix: string;
  }): Promise<void> {
    // Fill Participant Name
    const participantNameInput = this.page.locator('input[placeholder*="ABC Company"]');
    await participantNameInput.fill(data.participantName);

    // Find and fill the suffix input (right side of Participant Identifier)
    const suffixInput = this.page.locator('input[placeholder*="SGUEN"], input[placeholder*="e.g. SGUEN"]').first();
    await suffixInput.waitFor({ state: 'visible', timeout: 5000 });
    await suffixInput.fill(data.participantIdentifierSuffix);
  }

  async fillSolutionProviderParticipant(data: {
    solutionProviderName: string;
    countryCode: string;
    participantName: string;
  }): Promise<void> {
    // Click Solution Provider radio button (click the label)
    const solutionProviderLabel = this.page.locator('text=/Solution Provider/i').last();
    await solutionProviderLabel.click();

    // Fill Participant Name
    const participantNameInput = this.page.locator('input[placeholder*="ABC Company"]');
    await participantNameInput.scrollIntoViewIfNeeded();
    await participantNameInput.fill(data.participantName);
  }

  async selectAccessPoint(accessPoint: string): Promise<void> {
    const accessPointDropdown = this.page.locator('select, [role="combobox"]').filter({ hasText: 'Access Point' }).first();
    if (await accessPointDropdown.isVisible()) {
      await accessPointDropdown.click();
      const option = this.page.locator(`text=${accessPoint}`).first();
      await option.click();
    }
  }

  async selectDocuments(document: string): Promise<void> {
    const documentsDropdown = this.page.locator('select, [role="combobox"]').filter({ hasText: 'Documents' }).first();
    if (await documentsDropdown.isVisible()) {
      await documentsDropdown.click();
      const option = this.page.locator(`text=${document}`).first();
      await option.click();
    }
  }

  async save(): Promise<void> {
    const saveButton = this.page.locator('button:has-text("Save")').last();
    await saveButton.click();
    await this.page.waitForURL(/.*invoicenow-participants.*/, { timeout: 15000 });
  }

  async isModalVisible(): Promise<boolean> {
    return this.page.locator('text=Participant Details').isVisible();
  }
}
