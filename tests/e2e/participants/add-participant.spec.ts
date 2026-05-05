import { expect, test } from '@src/fixtures';

const users = require('@tests/data/login-users.json');
const participants = require('@tests/data/participants.json');

test.describe('Add Participant', () => {
  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.loginWith(users.admin);
    // Wait for navigation to participants page after successful login
    await page.waitForURL(/.*invoicenow-participants.*/, { timeout: 30000 });
  });

  test('add participant with Corppass Authorisation', async ({ addParticipantPage, participantHelper }) => {
    const corppassData = participants.corppass;

    // Click Add Participant button (already on participants page after login)
    await addParticipantPage.clickAddParticipant();

    // Fill Corppass Authorisation form
    await addParticipantPage.fillCorpassParticipant(corppassData);

    // Select Access Point
    await addParticipantPage.selectAccessPoint('MT API');

    // Save the participant
    await addParticipantPage.save();

    // Verify participant was added (can add assertion for success message)
    await expect(addParticipantPage.page).toHaveURL(/.*invoicenow-participants.*/);

    // Cleanup: Delete the participant after test
    await participantHelper.deleteParticipantByName(corppassData.participantName);
  });

  test('add participant with PDF Authorisation', async ({ addParticipantPage, participantHelper }) => {
    const pdfData = participants.pdf;

    // Click Add Participant button (already on participants page after login)
    await addParticipantPage.clickAddParticipant();

    // Fill PDF Authorisation form
    await addParticipantPage.fillPdfParticipant(pdfData);

    // Select Access Point
    await addParticipantPage.selectAccessPoint('MT API');

    // Save the participant
    await addParticipantPage.save();

    // Verify participant was added
    await expect(addParticipantPage.page).toHaveURL(/.*invoicenow-participants.*/);

    // Cleanup: Delete the participant after test
    await participantHelper.deleteParticipantByName(pdfData.participantName);
  });

  test('add participant as Solution Provider', async ({ addParticipantPage, participantHelper }) => {
    const spData = participants.solutionProvider;

    // Click Add Participant button (already on participants page after login)
    await addParticipantPage.clickAddParticipant();

    // Fill Solution Provider form
    await addParticipantPage.fillSolutionProviderParticipant(spData);

    // Save the participant
    await addParticipantPage.save();

    // Verify participant was added
    await expect(addParticipantPage.page).toHaveURL(/.*invoicenow-participants.*/);

    // Cleanup: Delete the participant after test
    await participantHelper.deleteParticipantByName(spData.participantName);
  });
});
