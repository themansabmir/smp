import { test, expect } from '@src/fixtures';
const accessPointData = require('@tests/data/access-points.json');
const userData = require('@tests/data/login-users.json');

test.describe('Access Point Configuration', () => {
  test.beforeEach(async ({ loginPage, accessPointPage }) => {
    await loginPage.goto();
    await loginPage.loginWith(userData.admin);
    await accessPointPage.goto();
    
    // Cleanup any existing test data to avoid bulky data and strict mode violations
    await accessPointPage.deleteAllByName(accessPointData.validConfig.name);
    await accessPointPage.deleteAllByName('<script>alert("XSS")</script>');
  });

  test('HF-01: successfully add a new access point configuration', async ({ accessPointPage, page }) => {
    const data = accessPointData.validConfig;
    
    await accessPointPage.clickAddAccessPoint();
    await accessPointPage.fillAccessPointDetails(data);
    await accessPointPage.save();
    
    // Verify it appears in the list
    await expect(page.locator('.MuiPaper-root', { hasText: data.name }).first()).toBeVisible({ timeout: 10000 });
  });

  test('NF-01: should show validation error when mandatory fields are missing', async ({ accessPointPage, page }) => {
    await accessPointPage.clickAddAccessPoint();
    await accessPointPage.save();
    
    // Check that we are still in the modal
    await expect(page.locator('text=Add Access Point Configuration')).toBeVisible();
  });

  test('EC-01: should handle invalid date range (Expiry before Valid From)', async ({ accessPointPage, page }) => {
    const data = {
      ...accessPointData.validConfig,
      name: "Date Range Test AP",
      validFrom: "2026-12-31",
      expiryDate: "2025-01-01"
    };
    
    await accessPointPage.clickAddAccessPoint();
    await accessPointPage.fillAccessPointDetails(data);
    await accessPointPage.save();
    
    // Check if system prevents saving (modal stays open)
    await expect(page.locator('text=Add Access Point Configuration')).toBeVisible();
  });

  test('SEC-01: should sanitize XSS payload in configuration name', async ({ accessPointPage, page }) => {
    const xssPayload = '<script>alert("XSS")</script>';
    const data = { ...accessPointData.validConfig, name: xssPayload };
    
    await accessPointPage.clickAddAccessPoint();
    await accessPointPage.fillAccessPointDetails(data);
    await accessPointPage.save();
    
    // Verify name is rendered as text and not executed
    await expect(page.locator('.MuiPaper-root', { hasText: xssPayload }).first()).toBeVisible();
    
    // Cleanup XSS entry
    await accessPointPage.deleteAccessPoint(xssPayload);
  });

  test('Edit Flow: successfully update an existing access point configuration', async ({ accessPointPage, page }) => {
    // First ensure we have one to edit
    const initialData = accessPointData.validConfig;
    await accessPointPage.clickAddAccessPoint();
    await accessPointPage.fillAccessPointDetails(initialData);
    await accessPointPage.save();
    
    const newName = `Updated AP Name ${Date.now()}`;
    
    // Edit the one we just added
    const card = page.locator('.MuiPaper-root', { hasText: initialData.name }).first();
    await card.getByRole('button', { name: 'Edit' }).click();
    
    await page.getByRole('textbox', { name: 'e.g. ABC Solution (Test)' }).fill(newName);
    await accessPointPage.save();
    
    // Verify name update
    await expect(page.locator('.MuiPaper-root', { hasText: newName }).first()).toBeVisible({ timeout: 10000 });
    
    // Cleanup
    await accessPointPage.deleteAccessPoint(newName);
  });

  test('Duplicate Check: should handle duplicate AP Configuration ID', async ({ accessPointPage, page }) => {
    // First, find an existing ID from the list. We'll wait for any card to be visible first.
    const idValueLocator = page.locator('div:has(> p:has-text("AP Configuration ID")) >> p').nth(1);
    await idValueLocator.waitFor({ state: 'visible', timeout: 15000 });
    const existingId = await idValueLocator.textContent();
    
    if (existingId) {
      await accessPointPage.clickAddAccessPoint();
      await accessPointPage.fillAccessPointDetails({
        ...accessPointData.validConfig,
        id: existingId,
        name: "Duplicate ID Test"
      });
      await accessPointPage.save();
      
      // Modal should stay open (or show error toast - based on previous run it stays open on failure)
      await expect(page.locator('text=Add Access Point Configuration')).toBeVisible();
    }
  });
});

test.describe('Unauthorized Access', () => {
  test('SEC-02: should redirect to login when accessing AP configuration without session', async ({ page }) => {
    await page.goto('https://dev.invoicenowsmp.sg/access-point-configuration');
    await expect(page).toHaveURL(/.*login.*/);
  });
});
