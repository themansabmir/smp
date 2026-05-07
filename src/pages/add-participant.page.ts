import type { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class AddParticipantPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async clickAddParticipant(): Promise<void> {
    // Wait for page to be ready
    await this.page.waitForTimeout(500);
    
    // Close any existing dialogs or overlays first
    try {
      const closeButton = this.page.locator('button[aria-label="Close"], button:has-text("×"), .MuiDialog-root button').first();
      if (await closeButton.isVisible({ timeout: 2000 })) {
        await closeButton.click();
        await this.page.waitForTimeout(500);
      }
    } catch (e) {
      // No close button found, continue
    }
    
    // Press Escape to close any modal overlays
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(500);
    
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
    verificationMethod: string;
  }): Promise<void> {
    // Select Country
    await this.page.getByRole('combobox', { name: data.countryCode }).click();
    await this.page.getByRole('option', { name: data.countryCode }).click();

    // Fill Participant Name
    await this.page.getByRole('textbox', { name: 'e.g. ABC Company Pte Ltd' }).click();
    await this.page.getByRole('textbox', { name: 'e.g. ABC Company Pte Ltd' }).fill(data.participantName);

    // Fill Participant Identifier
    await this.page.getByRole('textbox', { name: 'e.g. SGUEN123456789K' }).click();
    await this.page.getByRole('textbox', { name: 'e.g. SGUEN123456789K' }).fill(data.participantIdentifierSuffix);

    // Select Verification Method
    // await this.page.getByRole('combobox', { name: 'Select Verification Method' }).click();
    // await this.page.waitForTimeout(500); // Wait for dropdown to open

    // Fill Business Representative Name
    await this.page.getByRole('textbox', { name: 'e.g. John Lee' }).click();
    await this.page.getByRole('textbox', { name: 'e.g. John Lee' }).fill(data.businessRepName);

    // Fill Business Representative Email
    await this.page.getByRole('textbox', { name: 'e.g. abc@company.com' }).click();
    await this.page.getByRole('textbox', { name: 'e.g. abc@company.com' }).fill(data.businessRepEmail);
  }

  async fillPdfParticipant(data: {
    countryCode: string;
    participantName: string;
    participantIdentifierPrefix: string;
    participantIdentifierSuffix: string;
    verificationMethod: string;
    pdfFilePath: string;
  }): Promise<void> {
    // Select Country
    await this.page.getByRole('combobox', { name: data.countryCode }).click();
    // Close dropdown backdrop
    await this.page.locator('.MuiBackdrop-root.MuiBackdrop-invisible').click();

    // Fill Participant Name
    await this.page.getByRole('textbox', { name: 'e.g. ABC Company Pte Ltd' }).click();
    await this.page.getByRole('textbox', { name: 'e.g. ABC Company Pte Ltd' }).fill(data.participantName);

    // Fill Participant Identifier
    await this.page.getByRole('textbox', { name: 'e.g. SGUEN123456789K' }).click();
    await this.page.getByRole('textbox', { name: 'e.g. SGUEN123456789K' }).fill(data.participantIdentifierSuffix);

    // Verification method is auto-selected, no need to interact with dropdown

    // Upload PDF file - target the hidden input element
    const uploadInput = this.page.locator('input[type="file"]');
    await uploadInput.setInputFiles(data.pdfFilePath);
    
    // Wait for file to be uploaded and displayed
    const fileName = data.pdfFilePath.split('/').pop() || 'sample-document.pdf';
    await this.page.getByText(fileName).click();
  }

  async fillSolutionProviderParticipant(data: {
    registeredUnder: string;
    solutionProviderName: string;
    countryCode: string;
    participantName: string;
    participantIdentifierSuffix: string;
    businessRepName: string;
    businessRepEmail: string;
  }): Promise<void> {
    // Click Solution Provider radio button
    await this.page.getByRole('radio', { name: 'Solution Provider' }).check();
    
    // Select Solution Provider from dropdown
    await this.page.getByRole('combobox', { name: 'Select Solution Provider' }).click();
    await this.page.getByRole('option', { name: data.solutionProviderName || 'MT SP' }).click();
    
    // Fill Participant Name
    await this.page.getByRole('textbox', { name: 'e.g. ABC Company Pte Ltd' }).click();
    await this.page.getByRole('textbox', { name: 'e.g. ABC Company Pte Ltd' }).fill(data.participantName);
    
    // Fill Participant Identifier
    await this.page.getByRole('textbox', { name: 'e.g. SGUEN123456789K' }).click();
    await this.page.getByRole('textbox', { name: 'e.g. SGUEN123456789K' }).fill(data.participantIdentifierSuffix);
    
    // Fill Business Representative Name if field exists
    try {
      const nameField = this.page.getByRole('textbox', { name: 'e.g. John Lee' });
      if (await nameField.isVisible({ timeout: 2000 })) {
        await nameField.click();
        await nameField.fill(data.businessRepName || 'John Lee');
      }
    } catch (e) {
      console.log('Business Representative Name field not found');
    }

    // Fill Business Representative Email if field exists
    try {
      const emailField = this.page.getByRole('textbox', { name: 'e.g. abc@company.com' });
      if (await emailField.isVisible({ timeout: 2000 })) {
        await emailField.click();
        await emailField.fill(data.businessRepEmail || 'test@sp.com');
      }
    } catch (e) {
      console.log('Business Representative Email field not found');
    }

    // Handle optional Upload button if it appears (common for non-standard prefixes)
    try {
      const uploadButton = this.page.getByRole('button', { name: /upload Click to Upload/i });
      if (await uploadButton.isVisible({ timeout: 2000 })) {
        console.log('Upload button visible, uploading sample document');
        const uploadInput = this.page.locator('input[type="file"]');
        await uploadInput.setInputFiles('tests/data/pdfs/sample-document.pdf');
        await this.page.waitForTimeout(1000);
      }
    } catch (e) {
      // Upload button not present, continue
    }
    
    // Select Access Point (skipped as requested)
    // await this.selectAccessPoint('Default Access Point');
  }

  async selectAccessPoint(accessPoint: string): Promise<void> {
    try {
      const accessPointDropdown = this.page.locator('select, [role="combobox"]').filter({ hasText: 'Access Point' }).first();
      
      // Wait for it to be visible and enabled
      await accessPointDropdown.waitFor({ state: 'visible', timeout: 5000 });
      
      await accessPointDropdown.click();
      await this.page.waitForTimeout(500); // Wait for options to load

      // Try multiple ways to find the option
      const options = this.page.locator('[role="option"]');
      const count = await options.count();
      
      if (count > 0) {
        const targetOption = options.filter({ hasText: accessPoint }).first();
        if (await targetOption.isVisible()) {
          await targetOption.click();
        } else {
          // Fallback: click the first available option
          await options.first().click();
        }
      } else {
        console.log('No options found in Access Point dropdown');
        // Press Escape to close dropdown if no options
        await this.page.keyboard.press('Escape');
      }
    } catch (e) {
      console.log('Access Point selection skipped or failed');
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
