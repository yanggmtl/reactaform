import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithProvider, createMockField } from '../test-utils';
import TextInput from '../../src/components/fields/TextInput';

// This test tries to dynamically import axe-core. If it's not installed
// the test is skipped and a friendly message is printed explaining how
// to enable the check (`npm i -D axe-core`).

describe('Accessibility smoke (axe)', () => {
  it('has no detectable a11y violations for a representative field', async () => {
    let axe: any;
    try {
      // Use an indirect dynamic import via Function to avoid Vite's
      // static import analysis when the package is not installed.
      // Teams can opt-in by installing `axe-core` as a devDependency.
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const dynImport = new Function('modulePath', 'return import(modulePath)');
      // @ts-ignore
      axe = await dynImport('axe-core');
    } catch (err) {
      // Skip the test if axe-core is not available
      // eslint-disable-next-line no-console
      console.warn('axe-core not installed; skipping accessibility smoke test. Run `npm i -D axe-core` to enable.');
      return;
    }

    const field = createMockField({ name: 'a11yText', displayName: 'Accessible text', type: 'string' });

    const { container } = renderWithProvider(
      <div>
        <TextInput field={field} value={undefined} onChange={() => {}} />
      </div>
    );

    // axe-core attaches to global window in JSDOM; run analyzer
    const results = await (axe as any).run(container);

    // If there are violations, print them to help debugging
    if (results.violations && results.violations.length > 0) {
      // eslint-disable-next-line no-console
      console.error('Accessibility violations:', JSON.stringify(results.violations, null, 2));
    }

    expect(results.violations).toHaveLength(0);
  });
});
