export class DataFactory {
  private static counter = 0;

  private static next(): number {
    return ++DataFactory.counter;
  }

  static uniqueEmail(prefix = 'test'): string {
    return `${prefix}+${Date.now()}-${DataFactory.next()}@example.com`;
  }

  static uniqueName(prefix = 'Test User'): string {
    return `${prefix} ${DataFactory.next()}`;
  }

  static randomString(length = 8): string {
    return Math.random().toString(36).slice(2, 2 + length);
  }

  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static timestamp(): string {
    return new Date().toISOString();
  }
}
