import { expect, test } from '@src/fixtures';

const users = require('@tests/data/login-users.json');

test.describe('Login', () => {
  test('allows a valid admin user to sign in', async ({ loginPage, dashboardPage, page }) => {
    await loginPage.goto();
    await loginPage.loginWith(users.admin);
    // Wait for navigation to participants page
    await page.waitForURL(/.*invoicenow-participants.*/, { timeout: 30000 });

    await expect(dashboardPage.page).toHaveURL(/.*invoicenow-participants.*/);
  });

  test('allows a valid owner user to sign in', async ({ loginPage, dashboardPage, page }) => {
    await loginPage.goto();
    await loginPage.loginWith(users.owner);
    // Wait for navigation to participants page
    await page.waitForURL(/.*invoicenow-participants.*/, { timeout: 30000 });

    await expect(dashboardPage.page).toHaveURL(/.*invoicenow-participants.*/);
  });

  test('shows an error message for invalid credentials', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.loginWith(users.invalid);

    await expect(page).toHaveURL(/.*login.*/);
    expect(await loginPage.isErrorVisible()).toBe(true);
  });
});
