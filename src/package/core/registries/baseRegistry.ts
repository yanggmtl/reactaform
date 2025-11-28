export class BaseRegistry<T> {
  private map: Record<string, T> = {};

  register(name: string, value: T): void {
    this.map[name] = value;
  }

  get(name: string): T | undefined {
    return this.map[name];
  }

  has(name: string): boolean {
    return name in this.map;
  }

  list(): string[] {
    return Object.keys(this.map);
  }

  entries(): [string, T][] {
    return Object.entries(this.map);
  }

  values(): T[] {
    return Object.values(this.map);
  }

  size(): number {
    return Object.keys(this.map).length;
  }

  unregister(name: string): boolean {
    if (name in this.map) {
      delete this.map[name];
      return true;
    }
    return false;
  }

  clear(): void {
    this.map = {};
  }

  // Batch operations for better performance
  registerAll(entries: Record<string, T> | [string, T][]): void {
    if (Array.isArray(entries)) {
      entries.forEach(([name, value]) => this.register(name, value));
    } else {
      Object.entries(entries).forEach(([name, value]) => this.register(name, value));
    }
  }

  // Get with fallback
  getOrDefault(name: string, defaultValue: T): T {
    return this.get(name) ?? defaultValue;
  }
}

export default BaseRegistry;
