import type { ReactNode } from 'react';
import type { DefinitionPropertyField } from '../package/core/reactaFormTypes';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { ReactaFormProvider } from '../package/components/ReactaFormProvider';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  darkMode?: boolean;
  language?: string;
}

// Custom render function that wraps components with ReactaFormProvider
export function renderWithProvider(
  ui: React.ReactElement,
  {
    darkMode = false,
    language = 'en',
    ...renderOptions
  }: CustomRenderOptions = {}
): ReturnType<typeof render> {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ReactaFormProvider
        defaultDarkMode={darkMode}
        defaultLanguage={language}
        definitionName="test-form"
      >
        {children}
      </ReactaFormProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Mock field factory for consistent test fields
// Safer mock factory: return a concrete field type; default to the base DefinitionPropertyField.
export function createMockField<T extends DefinitionPropertyField = DefinitionPropertyField>(
  overrides: Record<string, unknown> = {}
): T {
  // Allow shorthand `label` in tests; map to `displayName`.
  const normalized: Record<string, unknown> = { ...overrides };
  if ('label' in normalized && !('displayName' in normalized)) {
    normalized.displayName = String(normalized['label']);
    delete normalized['label'];
  }

  const base: DefinitionPropertyField = {
    name: 'testField',
    displayName: 'Test Field',
    type: 'string',
    defaultValue: '',
    required: false,
  };

  // Return as the requested generic type so callers can cast where necessary.
  return ({ ...base, ...normalized } as unknown) as T;
}

// Mock translation function
export const mockTranslation = (text: string) => text;

// Common test props for field components - without onChange/onError to avoid conflicts
export const baseFieldProps = {
  placeholder: 'Test placeholder',
};

// Helper to create files for file input testing
export function createMockFile(
  name = 'test.txt',
  size = 1024,
  type = 'text/plain'
): File {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

// Helper to wait for async updates
export const waitForUpdate = () => new Promise(resolve => setTimeout(resolve, 0));

// Re-export testing utilities for convenience in tests.
// eslint-disable-next-line react-refresh/only-export-components -- re-exports test helpers, not components
export * from '@testing-library/react';
export { vi } from 'vitest';