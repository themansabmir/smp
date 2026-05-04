import type { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  private readonly pageHeading = this.getByRole('heading', { level: 1 });
  private readonly userMenu = this.getByTestId('user-menu');
  private readonly logoutButton = this.getByTestId('logout-button');

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/dashboard');
    await this.waitForPageLoad();
  }

  async getHeadingText(): Promise<string | null> {
    return this.pageHeading.textContent();
  }

  async isLoaded(): Promise<boolean> {
    return this.pageHeading.isVisible();
  }

  async logout(): Promise<void> {
    await this.userMenu.click();
    await this.logoutButton.click();
  }
}
