import type { Page } from '@playwright/test';
import type { UserCredentials } from '@src/types';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  private readonly emailInput = this.page.getByRole('textbox', { name: 'name@example.com' });
  private readonly passwordInput = this.page.getByRole('textbox', { name: 'Enter your password' });
  private readonly submitButton = this.page.getByRole('button', { name: 'Sign In' });
  private readonly errorMessage = this.page.getByText(/invalid|incorrect|failed|error/i).first();
  private readonly errorContainer = this.page.locator('[role="alert"], .toast, .error, .error-message, .login-error, .alert, .notification, .message, .ant-message').first();

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('https://dev.invoicenowsmp.sg/login');
    await this.waitForPageLoad();
    await this.emailInput.waitFor({ state: 'visible', timeout: 15000 });
  }

  async loginWith(credentials: UserCredentials): Promise<void> {
    await this.emailInput.fill(credentials.email);
    await this.passwordInput.fill(credentials.password);
    await this.submitButton.click();
    // Wait for the login to complete by waiting for URL change or a specific dashboard element
    await this.page.waitForURL(url => !url.href.includes('/login'), { timeout: 15000 });
  }

  async getErrorMessage(): Promise<string | null> {
    if (await this.errorMessage.isVisible()) {
      return this.errorMessage.textContent();
    }
    if (await this.errorContainer.isVisible()) {
      return this.errorContainer.textContent();
    }
    return null;
  }

  async isErrorVisible(): Promise<boolean> {
    try {
      await Promise.race([
        this.errorMessage.waitFor({ state: 'visible', timeout: 5000 }),
        this.errorContainer.waitFor({ state: 'visible', timeout: 5000 }),
      ]);
      return true;
    } catch {
      return false;
    }
  }
}
