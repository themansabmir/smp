import type { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { expect } from '@playwright/test';

export class ParticipantsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/invoicenow-participants');
    // Aggressively clear any existing modals/drawers that might be blocking the view
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(500);
    await this.page.keyboard.press('Escape');
    
    await this.page.waitForSelector('text=InvoiceNow Participants', { timeout: 20000 });
    await this.page.waitForTimeout(2000);
  }

  async searchParticipant(query: string): Promise<void> {
    // Aggressively check for and dismiss any blocking dialogs (like 'Deletion Blocked' or 'Duplicate')
    const dialogs = this.page.locator('.MuiDialog-root, [role="presentation"]');
    const okButton = this.page.getByRole('button', { name: /Ok|Close|Dismiss/i });
    
    if (await okButton.isVisible({ timeout: 1000 })) {
      await okButton.click();
      await this.page.waitForTimeout(500);
    }

    const searchInput = this.page.getByPlaceholder('Search participant ID, name and solution provider');
    // Ensure search input is reachable by clicking outside or pressing Escape if still blocked
    if (!(await searchInput.isVisible({ timeout: 2000 }))) {
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(1000);
    }

    if (!(await searchInput.isVisible({ timeout: 1000 }))) {
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(1000);
    }

    await searchInput.waitFor({ state: 'visible', timeout: 15000 });
    await searchInput.click();
    await searchInput.clear();
    if (query) {
      await searchInput.fill(query);
      await this.page.keyboard.press('Enter');
    } else {
      await searchInput.fill('');
      await this.page.keyboard.press('Enter');
    }
    
    // Wait for the table to stabilize
    await this.page.waitForTimeout(2000); 
  }

  async deleteParticipant(searchQuery: string): Promise<boolean> {
    await this.searchParticipant(searchQuery);
    
    const rows = this.page.locator('.MuiDataGrid-row, tr').filter({ hasText: searchQuery });
    if (!(await rows.first().isVisible({ timeout: 3000 }))) {
      return true; // No record to delete
    }

    const firstRow = rows.first();
    const viewMoreTrigger = firstRow.locator('[aria-label*="View More"], img[alt*="View More"], [cursor="pointer"]').last();
    
    await viewMoreTrigger.click({ timeout: 5000 });

    const drawer = this.page.locator('.MuiDrawer-root, [role="presentation"], .MuiDialog-root').filter({ hasText: 'Participant Details' }).last();
    await drawer.waitFor({ state: 'visible', timeout: 8000 });

    const deleteButton = drawer.locator('button:has-text("Delete")').first();
    await deleteButton.click();
    
    const confirmButton = this.page.getByRole('button', { name: 'Yes' });
    await confirmButton.waitFor({ state: 'visible', timeout: 5000 });
    await confirmButton.click();
    
    // Handle 'Deletion Blocked' or 'Deleted successfully'
    const blockDialog = this.page.locator('text=Deletion Blocked');
    const okButton = this.page.getByRole('button', { name: /Ok|Close/i });
    
    const result = await Promise.race([
      this.page.waitForSelector('text=Deleted successfully', { timeout: 8000 }).then(() => 'success'),
      blockDialog.waitFor({ state: 'visible', timeout: 8000 }).then(() => 'blocked'),
      this.page.waitForTimeout(9000).then(() => 'timeout')
    ]);

    if (result === 'blocked') {
      console.log('Deletion blocked by system limit.');
      await okButton.click();
      
      // Close the side drawer
      const closeButton = drawer.locator('button[aria-label*="close"], .MuiIconButton-root:has(svg[data-testid*="Close"])').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
      } else {
        await this.page.keyboard.press('Escape');
      }
      
      await drawer.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
      return false; // Deletion was blocked
    } else if (result === 'success') {
      await drawer.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
      return true;
    }

    return false;
  }

  async deleteAllByQuery(query: string): Promise<void> {
    if (!query) return;
    
    await this.searchParticipant(query);
    
    let iterations = 0;
    while (iterations < 3) {
      const rows = this.page.locator('.MuiDataGrid-row, tr').filter({ hasText: query });
      if (await rows.first().isVisible({ timeout: 1000 })) {
        const success = await this.deleteParticipant(query);
        if (!success) {
          break; 
        }
        await this.searchParticipant(query);
      } else {
        break;
      }
      iterations++;
    }
  }
}
