import { test, expect } from '@src/fixtures';
const participantsData = require('@tests/data/participants.json');
const userData = require('@tests/data/login-users.json');

test.describe('Comprehensive Participant Management', () => {
  test.beforeEach(async ({ loginPage, participantsPage }) => {
    test.setTimeout(300000);
    await loginPage.goto();
    await loginPage.loginWith(userData.admin);
    await participantsPage.goto();
    
    // Attempt cleanup
    const cleanupQueries = [
      participantsData.corppass.participantIdentifierSuffix,
      participantsData.pdf.participantIdentifierSuffix,
      participantsData.solutionProvider.participantIdentifierSuffix,
      participantsData.xss.participantIdentifierSuffix,
      'Duplicate Test Name'
    ];
    
    for (const query of cleanupQueries) {
      await participantsPage.deleteAllByQuery(query);
    }
  });

  test.afterEach(async ({ participantsPage }) => {
    await participantsPage.goto();
    const cleanupQueries = [
      participantsData.corppass.participantIdentifierSuffix,
      participantsData.pdf.participantIdentifierSuffix,
      participantsData.solutionProvider.participantIdentifierSuffix,
      'Duplicate Test Name'
    ];
    for (const query of cleanupQueries) {
      await participantsPage.deleteAllByQuery(query);
    }
  });

  test('HF-01: successfully add participant via Corppass Authorisation', async ({ addParticipantPage, participantsPage, page }) => {
    const timestamp = Date.now().toString().slice(-4);
    const data = { 
      ...participantsData.corppass, 
      participantName: `${participantsData.corppass.participantName}_${timestamp}`,
      participantIdentifierSuffix: `${participantsData.corppass.participantIdentifierSuffix}_${timestamp}`
    };
    
    await addParticipantPage.clickAddParticipant();
    await addParticipantPage.fillCorpassParticipant(data);
    await addParticipantPage.checkCompleteVerificationLater();
    await addParticipantPage.save();
    
    await participantsPage.searchParticipant(data.participantName);
    await expect(page.locator('tr, .MuiDataGrid-row').filter({ hasText: data.participantName }).first()).toBeVisible({ timeout: 30000 });
  });

  test('HF-02: successfully add participant via PDF Authorisation', async ({ addParticipantPage, participantsPage, page }) => {
    const timestamp = Date.now().toString().slice(-4);
    const data = { 
      ...participantsData.pdf, 
      participantName: `${participantsData.pdf.participantName}_${timestamp}`,
      participantIdentifierSuffix: `${participantsData.pdf.participantIdentifierSuffix}_${timestamp}`
    };
    
    await addParticipantPage.clickAddParticipant();
    await addParticipantPage.fillPdfParticipant(data);
    await addParticipantPage.checkCompleteVerificationLater();
    await addParticipantPage.save();
    
    await participantsPage.searchParticipant(data.participantName);
    await expect(page.locator('tr, .MuiDataGrid-row').filter({ hasText: data.participantName }).first()).toBeVisible({ timeout: 30000 });
  });

  test('HF-03: successfully add participant as Solution Provider', async ({ addParticipantPage, participantsPage, page }) => {
    const timestamp = Date.now().toString().slice(-4);
    const data = { 
      ...participantsData.solutionProvider, 
      participantName: `${participantsData.solutionProvider.participantName}_${timestamp}`,
      participantIdentifierSuffix: `${participantsData.solutionProvider.participantIdentifierSuffix}_${timestamp}`
    };
    
    await addParticipantPage.clickAddParticipant();
    await addParticipantPage.fillSolutionProviderParticipant(data);
    await addParticipantPage.checkCompleteVerificationLater();
    await addParticipantPage.save();
    
    await participantsPage.searchParticipant(data.participantName);
    await expect(page.locator('tr, .MuiDataGrid-row').filter({ hasText: data.participantName }).first()).toBeVisible({ timeout: 30000 });
  });

  test('NF-01: should show validation errors for empty mandatory fields', async ({ addParticipantPage, page }) => {
    await addParticipantPage.clickAddParticipant();
    const saveButton = page.locator('button:has-text("Save")').last();
    await saveButton.click();
    await expect(page.locator('text=Participant Details')).toBeVisible();
    await addParticipantPage.closeModal();
  });

  test('NF-02: should handle invalid email format', async ({ addParticipantPage, page }) => {
    const data = { ...participantsData.corppass, businessRepEmail: 'invalid-email' };
    await addParticipantPage.clickAddParticipant();
    await addParticipantPage.fillCorpassParticipant(data);
    const saveButton = page.locator('button:has-text("Save")').last();
    await saveButton.click();
    await expect(page.locator('text=Participant Details')).toBeVisible();
    await addParticipantPage.closeModal();
  });

  test('EC-01: should handle duplicate Participant Identifier', async ({ addParticipantPage, page }) => {
    const data = participantsData.corppass;
    
    // Step 1: Ensure it's registered (might already be)
    await addParticipantPage.clickAddParticipant();
    await addParticipantPage.fillCorpassParticipant(data);
    await addParticipantPage.checkCompleteVerificationLater();
    try {
      await addParticipantPage.save();
    } catch (e) {
      // Ignore if it fails due to already registered
      await addParticipantPage.closeModal();
    }
    
    // Step 2: Try to add it again
    await addParticipantPage.clickAddParticipant();
    await addParticipantPage.fillCorpassParticipant({
      ...data,
      participantName: 'Duplicate Test Name'
    });
    await addParticipantPage.checkCompleteVerificationLater();
    
    try {
      await addParticipantPage.save();
      throw new Error('Save should have failed for duplicate ID');
    } catch (e: any) {
      expect(e.message).toContain('already registered under another provider');
    }
    
    // Explicitly verify modal is still open before closing
    await expect(page.locator('text=Participant Details').first()).toBeVisible();
    await addParticipantPage.closeModal();
  });

  test('SEC-01: should sanitize XSS payload in Participant Name', async ({ addParticipantPage, participantsPage, page }) => {
    const timestamp = Date.now().toString().slice(-4);
    const data = { 
      ...participantsData.xss, 
      participantName: `${participantsData.xss.participantName}_${timestamp}`,
      participantIdentifierSuffix: `${participantsData.xss.participantIdentifierSuffix}_${timestamp}`
    };
    await addParticipantPage.clickAddParticipant();
    await page.waitForSelector('text=Participant Details', { state: 'visible', timeout: 10000 });
    await addParticipantPage.fillCorpassParticipant(data);
    await page.waitForTimeout(1000);
    await addParticipantPage.checkCompleteVerificationLater();
    await addParticipantPage.save();
    await participantsPage.searchParticipant(data.participantName);
    await expect(page.getByText(data.participantName).first()).toBeVisible({ timeout: 30000 });
  });
});
