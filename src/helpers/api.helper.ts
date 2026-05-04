import type { APIRequestContext } from '@playwright/test';

export class ApiHelper {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseURL: string,
    private readonly apiKey: string,
  ) {}

  private get defaultHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
    };
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    const response = await this.request.get(url.toString(), {
      headers: this.defaultHeaders,
    });
    if (!response.ok()) {
      throw new Error(`GET ${endpoint} failed: ${response.status()} ${await response.text()}`);
    }
    return response.json() as Promise<T>;
  }

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await this.request.post(`${this.baseURL}${endpoint}`, {
      headers: this.defaultHeaders,
      data: body,
    });
    if (!response.ok()) {
      throw new Error(`POST ${endpoint} failed: ${response.status()} ${await response.text()}`);
    }
    return response.json() as Promise<T>;
  }

  async put<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await this.request.put(`${this.baseURL}${endpoint}`, {
      headers: this.defaultHeaders,
      data: body,
    });
    if (!response.ok()) {
      throw new Error(`PUT ${endpoint} failed: ${response.status()} ${await response.text()}`);
    }
    return response.json() as Promise<T>;
  }

  async delete(endpoint: string): Promise<void> {
    const response = await this.request.delete(`${this.baseURL}${endpoint}`, {
      headers: this.defaultHeaders,
    });
    if (!response.ok()) {
      throw new Error(`DELETE ${endpoint} failed: ${response.status()} ${await response.text()}`);
    }
  }
}
