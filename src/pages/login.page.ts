import type { Page } from '@playwright/test';
import type { UserCredentials } from '@src/types';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  private readonly emailInput = this.page.locator('input[type="email"], input[placeholder*="email"], input[aria-label*="Email"], input[name*="email"], input[id*="email"]');
  private readonly passwordInput = this.page.locator('input[type="password"], input[placeholder*="password"], input[aria-label*="Password"], input[name*="password"], input[id*="password"]');
  private readonly submitButton = this.page.locator('button:has-text("Sign In"), button:has-text("Sign in")');
  private readonly errorMessage = this.page.getByText(/invalid|incorrect|failed|error/i).first();
  private readonly errorContainer = this.page.locator('[role="alert"], .toast, .error, .error-message, .login-error, .alert, .notification, .message, .ant-message').first();

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/login');
    await this.waitForPageLoad();
    await this.emailInput.first().waitFor({ state: 'visible', timeout: 15000 });
  }

  async loginWith(credentials: UserCredentials): Promise<void> {
    await this.emailInput.fill(credentials.email);
    await this.passwordInput.fill(credentials.password);
    await this.submitButton.click();
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
