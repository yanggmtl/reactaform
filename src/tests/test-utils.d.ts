import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    darkMode?: boolean;
    language?: string;
}
export declare function renderWithProvider(ui: React.ReactElement, { darkMode, language, ...renderOptions }?: CustomRenderOptions): ReturnType<typeof render>;
export declare function createMockField<T extends import("../package/core/reactaFormTypes").DefinitionPropertyField = import("../package/core/reactaFormTypes").DefinitionPropertyField>(overrides?: Record<string, unknown>): T;
export declare const mockTranslation: (text: string) => string;
export declare const baseFieldProps: {
    placeholder: string;
};
export declare function createMockFile(name?: string, size?: number, type?: string): File;
export declare const waitForUpdate: () => Promise<void>;
export * from '@testing-library/react';
export { vi } from 'vitest';
