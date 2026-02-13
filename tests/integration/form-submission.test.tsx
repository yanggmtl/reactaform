import { afterEach, describe, expect, it } from 'vitest';
import { renderWithProvider, screen, waitFor, act } from '../test-utils';
import userEvent from '@testing-library/user-event';
import ReactaFormRenderer from '../../src/components/form/ReactaFormRenderer';
import { registerSubmissionHandler } from '../../src/core/registries/submissionHandlerRegistry';
import type { ReactaDefinition } from '../../src/core/reactaFormTypes';
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
    
    // For dropdown, click to open and select option
    await user.click(select);
    const optionTwo = await screen.findByText('Two');
    await user.click(optionTwo);

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

  it('shows required field error only after blur when fieldValidationMode is onBlur', async () => {
    const definition = {
      name: 'test-def-onblur',
      version: '1',
      displayName: 'Test Form',
      properties: [
        {
          name: 'fullName',
          displayName: 'Full Name',
          type: 'string',
          defaultValue: '',
          required: true,
        },
      ],
    } as unknown as ReactaDefinition;

    const result = createInstanceFromDefinition(definition, 'test-instance');
    expect(result.success).toBe(true);
    const instance = result.instance!;

    await act(async () => {
      renderWithProvider(
        <ReactaFormRenderer definition={definition} instance={instance} chunkDelay={0} chunkSize={1000} />,
        { fieldValidationMode: 'onBlur' }
      );
    });

    const user = userEvent.setup();
    const nameInput = await screen.findByLabelText('Full Name');

    expect(screen.queryByText('Value required')).not.toBeInTheDocument();

    await user.type(nameInput, 'A');
    await user.clear(nameInput);

    expect(screen.queryByText('Value required')).not.toBeInTheDocument();

    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Value required')).toBeInTheDocument();
    });
  });

  it('allows button handlers to update disabled fields', async () => {
    let receivedValues: Record<string, unknown> | null = null;

    registerSubmissionHandler('testDisabledSubmitHandler', (_definition, _instanceName, valuesMap) => {
      receivedValues = { ...valuesMap } as Record<string, unknown>;
      return undefined;
    });

    // Dynamic import avoids top-level coupling in this integration test file.
    const { registerButtonHandler } = await import('../../src/core/registries/buttonHandlerRegistry');
    registerButtonHandler('calcSumForDisabledResult', (valuesMap, handleChange, handleError) => {
      const left = Number(valuesMap['left']) || 0;
      const right = Number(valuesMap['right']) || 0;
      handleChange('result', left + right);
      handleError('result', null);
    });

    const definition = {
      name: 'test-def-disabled',
      version: '1',
      displayName: 'Test Form',
      submitHandlerName: 'testDisabledSubmitHandler',
      properties: [
        {
          name: 'left',
          displayName: 'Left',
          type: 'int',
          defaultValue: 2,
        },
        {
          name: 'right',
          displayName: 'Right',
          type: 'int',
          defaultValue: 3,
        },
        {
          name: 'calc',
          displayName: 'Calculate Sum',
          type: 'button',
          action: 'calcSumForDisabledResult',
        },
        {
          name: 'result',
          displayName: 'Result',
          type: 'int',
          defaultValue: 0,
          disabled: true,
        },
      ],
    } as unknown as ReactaDefinition;

    const result = createInstanceFromDefinition(definition, 'test-instance');
    expect(result.success).toBe(true);
    const instance = result.instance!;

    await act(async () => {
      renderWithProvider(
        <ReactaFormRenderer definition={definition} instance={instance} chunkDelay={0} chunkSize={1000} />
      );
    });

    const user = userEvent.setup();
    const calcButton = await screen.findByRole('button', { name: /calculate sum/i });
    await user.click(calcButton);

    const submitBtn = screen.getByRole('button', { name: /submit/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(receivedValues).not.toBeNull();
    });

    expect(receivedValues).toMatchObject({
      left: 2,
      right: 3,
      result: 5,
    });
  });
});
