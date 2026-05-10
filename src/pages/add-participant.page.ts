import { expect, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class AddParticipantPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async clickAddParticipant(): Promise<void> {
    await this.page.waitForTimeout(500);
    
    // Press Escape to close any modal overlays or drawers
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(500);

    // Handle "Leave Without Saving?" dialog if it exists from a previous failed/stuck attempt
    const leaveDialog = this.page.locator('text=Leave Without Saving?');
    const leaveButton = this.page.getByRole('button', { name: 'Leave Without Saving' });
    if (await leaveDialog.isVisible({ timeout: 2000 })) {
      await leaveButton.click();
      await this.page.waitForTimeout(1000);
    }
    
    const addButton = this.page.locator('button:has-text("Add Participant")').first();
    await addButton.waitFor({ state: 'visible', timeout: 10000 });
    await addButton.click();
    
    // Wait for modal heading
    await this.page.locator('text=Participant Details').first().waitFor({ state: 'visible', timeout: 10000 });
  }

  async closeModal(): Promise<void> {
    const closeButton = this.page.locator('button[aria-label*="close"], button:has-text("×")').first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
      
      // Handle "Leave Without Saving?" dialog if it appears
      const leaveButton = this.page.getByRole('button', { name: 'Leave Without Saving' });
      if (await leaveButton.isVisible({ timeout: 2000 })) {
        await leaveButton.click();
        await this.page.waitForTimeout(500);
      }
    }
  }

  private async selectCountry(country: string): Promise<void> {
    const countryCombobox = this.page.locator('#mui-component-select-countryCode');
    await countryCombobox.click();
    await this.page.getByRole('option', { name: country, exact: true }).first().click();
  }

  async fillCorpassParticipant(data: {
    countryCode: string;
    participantName: string;
    participantIdentifierPrefix: string;
    participantIdentifierSuffix: string;
    businessRepName: string;
    businessRepEmail: string;
    verificationMethod?: string;
  }): Promise<void> {
    await this.selectCountry(data.countryCode);
    await this.page.getByRole('textbox', { name: 'e.g. ABC Company Pte Ltd' }).fill(data.participantName);
    await this.page.getByRole('textbox', { name: 'e.g. SGUEN123456789K' }).fill(data.participantIdentifierSuffix);
    await this.page.keyboard.press('Tab'); // Trigger any blur events
    
    // The "Verification Method" and Representative fields might be triggered by the Identifier
    // or they might be delayed by the XSS payload. 
    const corppassRadio = this.page.getByRole('radio', { name: /Corppass Authorisation/i });
    await corppassRadio.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {
      console.log('Verification method section not appearing, might be blocked by XSS payload');
    });

    if (await corppassRadio.isVisible()) {
      await corppassRadio.check().catch(() => {});
    }
    
    const nameField = this.page.getByRole('textbox', { name: 'e.g. John Lee' });
    // Use a shorter timeout for the scroll check to avoid hanging if the field is truly missing
    const isNameVisible = await nameField.isVisible({ timeout: 5000 });
    if (isNameVisible) {
      await nameField.scrollIntoViewIfNeeded().catch(() => {});
      await nameField.fill(data.businessRepName);

      const emailField = this.page.getByRole('textbox', { name: 'e.g. abc@company.com' });
      await emailField.fill(data.businessRepEmail);
    } else {
      console.warn('Representative fields are still hidden. Proceeding with save anyway to test sanitization.');
    }
  }

  async fillPdfParticipant(data: {
    countryCode: string;
    participantName: string;
    participantIdentifierPrefix: string;
    participantIdentifierSuffix: string;
    verificationMethod?: string;
    pdfFilePath: string;
  }): Promise<void> {
    await this.selectCountry(data.countryCode);
    await this.page.getByRole('textbox', { name: 'e.g. ABC Company Pte Ltd' }).fill(data.participantName);
    await this.page.getByRole('textbox', { name: 'e.g. SGUEN123456789K' }).fill(data.participantIdentifierSuffix);

    const uploadInput = this.page.locator('input[type="file"]');
    await uploadInput.setInputFiles(data.pdfFilePath);
    
    const fileName = data.pdfFilePath.split('/').pop() || 'sample-document.pdf';
    await expect(this.page.getByText(fileName).first()).toBeVisible({ timeout: 10000 });
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
    await this.page.getByRole('radio', { name: 'Solution Provider' }).check();
    
    const spDropdown = this.page.locator('[id*="select-solutionProvider"], [id*="select-kycVerificationMethod"]').first();
    await spDropdown.click();
    await this.page.getByRole('option', { name: data.solutionProviderName || 'MT SP' }).first().click();

    await this.selectCountry(data.countryCode || 'Singapore');
    await this.page.getByRole('textbox', { name: 'e.g. ABC Company Pte Ltd' }).fill(data.participantName);
    await this.page.getByRole('textbox', { name: 'e.g. SGUEN123456789K' }).fill(data.participantIdentifierSuffix);
    
    const nameField = this.page.getByRole('textbox', { name: 'e.g. John Lee' });
    if (await nameField.isVisible({ timeout: 2000 })) {
      await nameField.fill(data.businessRepName || 'John Lee');
    }

    const emailField = this.page.getByRole('textbox', { name: 'e.g. abc@company.com' });
    if (await emailField.isVisible({ timeout: 2000 })) {
      await emailField.fill(data.businessRepEmail || 'test@sp.com');
    }

    const uploadButton = this.page.getByRole('button', { name: /upload Click to Upload/i });
    if (await uploadButton.isVisible({ timeout: 2000 })) {
      const uploadInput = this.page.locator('input[type="file"]');
      await uploadInput.setInputFiles('tests/data/pdfs/sample-document.pdf');
    }
  }

  async checkCompleteVerificationLater(): Promise<void> {
    const checkbox = this.page.getByRole('checkbox', { name: /Complete verification later/i });
    if (await checkbox.isVisible({ timeout: 2000 })) {
      const isChecked = await checkbox.isChecked();
      if (!isChecked) {
        await checkbox.click();
        await this.page.waitForTimeout(500);
      }
    }
  }

  async save(): Promise<void> {
    const saveButton = this.page.locator('button:has-text("Save")').last();
    await saveButton.click();
    
    // Increased timeout and broadened message detection
    const successAlert = this.page.locator('div[role="alert"]:has-text("successfully"), div[role="alert"]:has-text("Success")').first();
    const errorMsg = this.page.locator('.MuiAlert-message, .MuiFormHelperText-root, [role="alert"]').filter({ hasText: /already registered|duplicate|failed|required|invalid|error/i }).first();
    
    const result = await Promise.race([
      successAlert.waitFor({ state: 'visible', timeout: 20000 }).then(() => 'success'),
      errorMsg.waitFor({ state: 'visible', timeout: 20000 }).then(() => 'error'),
      this.page.waitForTimeout(21000).then(() => 'timeout')
    ]);

    if (result === 'error') {
      const text = await errorMsg.textContent();
      // We DO NOT close modal here automatically, let the test decide.
      // But we will handle "Leave Without Saving" in clickAddParticipant for the next test.
      throw new Error(`Participant registration failed: ${text}`);
    } else if (result === 'timeout') {
      if (await this.page.locator('text=Participant Details').first().isVisible()) {
        throw new Error('Save failed or timed out: neither success nor error message appeared and modal is still open');
      }
      return; 
    }

    // Wait for the modal to disappear on success
    await this.page.locator('text=Participant Details').first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }
}
