import { renderWithProvider, screen, waitFor, act } from '../test-utils';
import userEvent from '@testing-library/user-event';
import ReactaFormRenderer from '../../src/components/ReactaFormRenderer';
import { registerSubmissionHandler } from '../../src/core/registries';
import type { ReactaDefinition } from '../../src/core/reactaFormTypes';
import { afterEach, describe, expect, it } from 'vitest';
import { createInstanceFromDefinition } from '../../src/core/reactaFormModel';

describe('Form integration: rendering and submission', () => {
  afterEach(() => {
    // nothing to cleanup in registry for now
  });

  it('renders fields, accepts user input and calls submission handler with payload', async () => {
    let receivedValues: Record<string, unknown> | null = null;

    // register a simple submission handler that captures the valuesMap
    registerSubmissionHandler('testSubmitHandler', (_definition, _instanceName, valuesMap) => {
      receivedValues = { ...valuesMap } as Record<string, unknown>;
      return undefined; // indicate success
    });

    const definition = {
      name: 'test-def',
      version: '1',
      displayName: 'Test Form',
      submitHandlerName: 'testSubmitHandler',
      properties: [
        {
          name: 'fullName',
          displayName: 'Full Name',
          type: 'string',
          defaultValue: '',
        },
        {
          name: 'birthDate',
          displayName: 'Birth Date',
          type: 'date',
          defaultValue: '',
        },
        {
          name: 'choice',
          displayName: 'Choice',
          type: 'dropdown',
          defaultValue: 'one',
          options: [
            { label: 'One', value: 'one' },
            { label: 'Two', value: 'two' },
          ],
        },
      ],
    } as unknown as ReactaDefinition;

    const result = createInstanceFromDefinition(definition, 'test-instance');
    expect(result.success).toBe(true);
    expect(result.instance).not.toBeNull();
    const instance = result.instance!;
    // Render the form renderer with immediate loading (no chunk delay)
    await act(async () => {
      renderWithProvider(
        <ReactaFormRenderer definition={definition} instance={instance} chunkDelay={0} chunkSize={1000} />
      );
    });

    // Ensure fields are present. Use label queries to select the intended inputs.
    const nameInput = await screen.findByLabelText('Full Name');
    const dateInput = await screen.findByLabelText('Birth Date');
    const select = await screen.findByRole('combobox');

    // Simulate user interactions using userEvent (wraps updates in act)
    const user = userEvent.setup();
    await user.type(nameInput, 'Alice');
    // For date input, type the yyyy-MM-dd value
    await user.type(dateInput, '1990-05-15');
    await user.selectOptions(select, 'two');

    // Wait for debounced onChange handlers to flush (components use debounce by default)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
    });

    // Submit
    const submitBtn = screen.getByRole('button', { name: /submit/i });
    await user.click(submitBtn);

    // Wait for the registered handler to be called and assert payload
    await waitFor(() => {
      expect(receivedValues).not.toBeNull();
    });

    expect(receivedValues).toMatchObject({
      fullName: 'Alice',
      birthDate: '1990-05-15',
      choice: 'two',
    });
  });
});
