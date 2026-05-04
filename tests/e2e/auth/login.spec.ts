import { test, expect } from '@src/fixtures';

test.describe('Login', () => {
  test('allows admin to log in with valid credentials', async ({ loginPage, dashboardPage, envConfig }) => {
    await loginPage.goto();
    await loginPage.loginWith(envConfig.credentials.admin);

    await expect(dashboardPage.page).toHaveURL(/.*dashboard.*/);
    expect(await dashboardPage.isLoaded()).toBe(true);
  });

  test('shows error message for invalid credentials', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.loginWith({ email: 'wrong@example.com', password: 'wrongpassword' });

    expect(await loginPage.isErrorVisible()).toBe(true);
  });

  test('allows standard user to log in', async ({ loginPage, dashboardPage, envConfig }) => {
    await loginPage.goto();
    await loginPage.loginWith(envConfig.credentials.standardUser);

    await expect(dashboardPage.page).toHaveURL(/.*dashboard.*/);
  });
});
