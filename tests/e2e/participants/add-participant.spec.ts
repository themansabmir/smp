import { expect, test } from '@src/fixtures';

const users = require('@tests/data/login-users.json');
const participants = require('@tests/data/participants.json');

test.describe('Add Participant', () => {
  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.loginWith({
      email: 'mansab@yopmail.com',
      password: 'Dexsmp@009'
    });
    await page.waitForURL('https://dev.invoicenowsmp.sg/invoicenow-participants');
  });

  test('add participant with Corppass Authorisation', async ({ addParticipantPage, participantHelper, page }) => {
    const corppassData = participants.corppass;

    // Delete the most recent entry before adding a new one
    await participantHelper.deleteMostRecentEntry(page);

    // Click Add Participant button (already on participants page after login)
    await addParticipantPage.clickAddParticipant();

    // Fill Corppass Authorisation form
    await addParticipantPage.fillCorpassParticipant(corppassData);

    // Save the participant
    await addParticipantPage.save();

    // Verify participant was added (can add assertion for success message)
    await expect(addParticipantPage.page).toHaveURL(/.*invoicenow-participants.*/);
  });

  test('add participant with PDF Authorisation', async ({ addParticipantPage, participantHelper, page }) => {
    const pdfData = participants.pdf;

    // Delete the most recent entry before adding a new one
    await participantHelper.deleteMostRecentEntry(page);

    // Click Add Participant button (already on participants page after login)
    await addParticipantPage.clickAddParticipant();

    // Fill PDF Authorisation form
    await addParticipantPage.fillPdfParticipant(pdfData);

    // Save the participant
    await addParticipantPage.save();

    // Verify participant was added
    await expect(addParticipantPage.page).toHaveURL(/.*invoicenow-participants.*/);
  });

  test('add participant as Solution Provider', async ({ addParticipantPage, participantHelper, page }) => {
    const spData = participants.solutionProvider;

    // Delete the most recent entry before adding a new one
    await participantHelper.deleteMostRecentEntry(page);

    // Click Add Participant button (already on participants page after login)
    await addParticipantPage.clickAddParticipant();

    // Fill Solution Provider form
    await addParticipantPage.fillSolutionProviderParticipant(spData);

    // Save the participant
    await addParticipantPage.save();

    // Verify participant was added
    await expect(addParticipantPage.page).toHaveURL(/.*invoicenow-participants.*/);
  });
});
