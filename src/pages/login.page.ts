import type { Page } from '@playwright/test';
import { BasePage } from './base.page';
import type { UserCredentials } from '@src/types';

export class LoginPage extends BasePage {
  private readonly emailInput = this.getByTestId('email-input');
  private readonly passwordInput = this.getByTestId('password-input');
  private readonly submitButton = this.getByRole('button', { name: /sign in/i });
  private readonly errorMessage = this.getByTestId('login-error');

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/login');
    await this.waitForPageLoad();
  }

  async loginWith(credentials: UserCredentials): Promise<void> {
    await this.emailInput.fill(credentials.email);
    await this.passwordInput.fill(credentials.password);
    await this.submitButton.click();
  }

  async getErrorMessage(): Promise<string | null> {
    return this.errorMessage.textContent();
  }

  async isErrorVisible(): Promise<boolean> {
    return this.errorMessage.isVisible();
  }
}
