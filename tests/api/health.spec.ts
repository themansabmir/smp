import { test, expect } from '@src/fixtures';

test.describe('API Health', () => {
  test('health endpoint returns 200', async ({ apiHelper }) => {
    const response = await apiHelper.get<{ status: string }>('/health');
    expect(response.status).toBe('ok');
  });
});
