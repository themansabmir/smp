import type { APIRequestContext, Page } from '@playwright/test';

export class ParticipantHelper {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseURL: string,
    private readonly page: Page,
  ) {}

  async deleteParticipantByName(participantName: string): Promise<void> {
    try {
      // First, fetch the list of participants to find the one by name
      const listResponse = await this.request.get(`${this.baseURL}/v1/admin/participant?limit=100`);
      if (!listResponse.ok()) {
        console.log(`Failed to fetch participants: ${listResponse.status()}`);
        return;
      }

      const participants = await listResponse.json();
      const participant = participants.data?.find((p: any) => p.participantName === participantName);

      if (!participant) {
        console.log(`Participant not found: ${participantName}`);
        return;
      }

      // Delete the participant
      const deleteResponse = await this.request.delete(
        `${this.baseURL}/v1/admin/participant/${participant.id}`,
      );

      if (!deleteResponse.ok()) {
        console.log(`Failed to delete participant: ${deleteResponse.status()}`);
      }
    } catch (error) {
      console.log(`Error deleting participant: ${error}`);
    }
  }

  async deleteParticipantByIdentifier(prefix: string, suffix: string): Promise<void> {
    try {
      const listResponse = await this.request.get(`${this.baseURL}/v1/admin/participant?limit=100`);
      if (!listResponse.ok()) {
        return;
      }

      const participants = await listResponse.json();
      const participant = participants.data?.find(
        (p: any) => p.participantIdentifier === `${prefix}${suffix}`,
      );

      if (!participant) {
        return;
      }

      await this.request.delete(`${this.baseURL}/v1/admin/participant/${participant.id}`);
    } catch (error) {
      console.log(`Error deleting participant by identifier: ${error}`);
    }
  }

  async deleteMostRecentEntry(page: Page): Promise<void> {
    try {
      // Wait for page to load
      await page.waitForTimeout(1000);
      
      // Check if we're on participant details page (has direct Delete button)
      const directDeleteButton = page.getByRole('button', { name: 'Delete' });
      
      if (await directDeleteButton.isVisible({ timeout: 2000 })) {
        console.log('Found direct Delete button, deleting entry');
        await directDeleteButton.click();
      } else {
        // Try the action menu approach for participants list page
        const actionButton = page.getByRole('gridcell', { name: '-' }).first();
        
        if (await actionButton.isVisible({ timeout: 2000 })) {
          console.log('Found action button, deleting entry');
          
          // Click action button to open menu
          await actionButton.click();
          await page.waitForTimeout(300);
          
          // Click Delete button
          await page.getByRole('button', { name: 'Delete' }).click();
        } else {
          console.log('No delete option found');
          return;
        }
      }
      
      await page.waitForTimeout(500);
      
      // Confirm deletion
      await page.getByRole('button', { name: 'Yes' }).click();
      
      // Check for "Ok" button which appears in some flows (like limit reached)
      try {
        const okButton = page.getByRole('button', { name: 'Ok' });
        if (await okButton.isVisible({ timeout: 4000 })) {
          console.log('Found Ok button, clicking it');
          await okButton.click();
          await page.waitForTimeout(500);
          
          // Click the close/cross button (first button as per user flow)
          console.log('Clicking close button');
          await page.getByRole('button').first().click();
        }
      } catch (e) {
        // Ok button not present, deletion likely succeeded directly
      }
      
    } catch (error) {
      console.log(`Deletion failed: ${error instanceof Error ? error.message : String(error)}`);
      // Continue test even if deletion fails
    }
  }
}
