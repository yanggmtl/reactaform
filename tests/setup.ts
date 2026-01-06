import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Import validators to register them
import '../src/validation'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver with a typed wrapper to avoid `any` casts
type MockRO = new () => {
  observe: (...args: unknown[]) => void;
  unobserve: (...args: unknown[]) => void;
  disconnect: () => void;
};

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

const g = globalThis as unknown as {
  ResizeObserver?: MockRO;
  URL?: {
    createObjectURL?: (...args: unknown[]) => string;
    revokeObjectURL?: (...args: unknown[]) => void;
  };
  fetch?: (...args: unknown[]) => Promise<unknown>;
};

g.ResizeObserver = MockResizeObserver as unknown as MockRO;

// Mock scrollTo
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = (() =>
  (() => ({
    width: 120,
    height: 40,
    top: 0,
    left: 0,
    bottom: 40,
    right: 120,
    x: 0,
    y: 0,
    toJSON: vi.fn(),
  }) as unknown as DOMRect))() as unknown as () => DOMRect;

// Mock URL.createObjectURL for file tests
g.URL = g.URL || {};
g.URL.createObjectURL = vi.fn(() => 'mock-url');
g.URL.revokeObjectURL = vi.fn();

// Mock fetch for file/API tests
g.fetch = vi.fn();