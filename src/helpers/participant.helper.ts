import type { APIRequestContext } from '@playwright/test';

export class ParticipantHelper {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseURL: string,
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
}
