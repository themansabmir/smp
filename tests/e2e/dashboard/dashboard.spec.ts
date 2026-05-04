import { test, expect } from '@src/fixtures';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ loginPage, envConfig }) => {
    await loginPage.goto();
    await loginPage.loginWith(envConfig.credentials.admin);
  });

  test('displays main heading after login', async ({ dashboardPage }) => {
    await expect(dashboardPage.page).toHaveURL(/.*dashboard.*/);
    expect(await dashboardPage.isLoaded()).toBe(true);
  });

  test('logs user out and redirects to login page', async ({ dashboardPage, page }) => {
    await dashboardPage.logout();
    await expect(page).toHaveURL(/.*login.*/);
  });
});
