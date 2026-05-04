import type { Page, BrowserContext } from '@playwright/test';
import type { UserCredentials } from '@src/types';
import { LoginPage } from '@src/pages';

const AUTH_STATE_PATH = 'playwright/.auth';

export class AuthHelper {
  static adminStatePath = `${AUTH_STATE_PATH}/admin.json`;
  static standardUserStatePath = `${AUTH_STATE_PATH}/standard-user.json`;

  static async loginViaUI(page: Page, credentials: UserCredentials): Promise<void> {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWith(credentials);
    await page.waitForURL('**/dashboard**');
  }

  static async saveState(context: BrowserContext, statePath: string): Promise<void> {
    await context.storageState({ path: statePath });
  }
}
