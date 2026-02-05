import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../../../src/components/fields/Button';
import { registerButtonHandler } from '../../../src/core/registries/buttonHandlerRegistry';
import type { DefinitionPropertyField } from '../../../src/core/reactaFormTypes';
import { ReactaFormProvider } from '../../../src/components/form/ReactaFormProvider';

// Helper to create a mock field
function createMockField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return {
    name: 'testButton',
    displayName: 'Test Button',
    type: 'button',
    defaultValue: null,
    action: 'testAction',
    ...overrides,
  } as DefinitionPropertyField;
}

// Helper to render with provider
function renderWithProvider(ui: React.ReactElement) {
  return render(
    <ReactaFormProvider
      definitionName="TestForm"
      defaultLanguage="en"
      defaultTheme="light"
    >
      {ui}
    </ReactaFormProvider>
  );
}

describe('Button', () => {
  it('renders button with displayName', () => {
    const field = createMockField({ displayName: 'Click Me' });
    const valuesMap = {};
    const handleChange = vi.fn();
    const handleError = vi.fn();

    renderWithProvider(
      <Button
        field={field}
        value={null}
        valuesMap={valuesMap}
        handleChange={handleChange}
        handleError={handleError}
      />
    );

    expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
  });

  it('calls registered button handler when clicked', async () => {
    const user = userEvent.setup();
    const handlerFn = vi.fn();
    registerButtonHandler('clickTest', handlerFn);

    const field = createMockField({ action: 'clickTest' });
    const valuesMap = { field1: 'value1', field2: 42 };
    const handleChange = vi.fn();
    const handleError = vi.fn();

    renderWithProvider(
      <Button
        field={field}
        value={null}
        valuesMap={valuesMap}
        handleChange={handleChange}
        handleError={handleError}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(handlerFn).toHaveBeenCalledWith(
        valuesMap,
        handleChange,
        handleError,
        expect.any(Function) // Translation function
      );
    });
  });

  it('button handler can modify form values', async () => {
    const user = userEvent.setup();
    
    registerButtonHandler('modifyValues', (valuesMap, handleChange) => {
      const value1 = Number(valuesMap['number1']) || 0;
      const value2 = Number(valuesMap['number2']) || 0;
      handleChange('result', value1 + value2);
    });

    const field = createMockField({ action: 'modifyValues' });
    const valuesMap = { number1: 10, number2: 20, result: 0 };
    const handleChange = vi.fn();
    const handleError = vi.fn();

    renderWithProvider(
      <Button
        field={field}
        value={null}
        valuesMap={valuesMap}
        handleChange={handleChange}
        handleError={handleError}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith('result', 30);
    });
  });

  it('button handler can report errors', async () => {
    const user = userEvent.setup();
    
    registerButtonHandler('reportError', (valuesMap, handleChange, handleError, t) => {
      handleError('someField', t('This is an error'));
    });

    const field = createMockField({ action: 'reportError' });
    const valuesMap = {};
    const handleChange = vi.fn();
    const handleError = vi.fn();

    renderWithProvider(
      <Button
        field={field}
        value={null}
        valuesMap={valuesMap}
        handleChange={handleChange}
        handleError={handleError}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(handleError).toHaveBeenCalledWith('someField', 'This is an error');
    });
  });

  it('shows processing state during async handler execution', async () => {
    const user = userEvent.setup();
    
    registerButtonHandler('asyncAction', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    const field = createMockField({ action: 'asyncAction', displayName: 'Async Button' });
    const valuesMap = {};
    const handleChange = vi.fn();
    const handleError = vi.fn();

    renderWithProvider(
      <Button
        field={field}
        value={null}
        valuesMap={valuesMap}
        handleChange={handleChange}
        handleError={handleError}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    // Button should show "Processing..." immediately after click
    expect(button).toHaveTextContent('Processing...');
    expect(button).toBeDisabled();

    // Wait for async handler to complete
    await waitFor(() => {
      expect(button).toHaveTextContent('Async Button');
      expect(button).not.toBeDisabled();
    });
  });

  it('displays error when handler throws exception', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    registerButtonHandler('throwError', () => {
      throw new Error('Handler failed');
    });

    const field = createMockField({ action: 'throwError' });
    const valuesMap = {};
    const handleChange = vi.fn();
    const handleError = vi.fn();

    renderWithProvider(
      <Button
        field={field}
        value={null}
        valuesMap={valuesMap}
        handleChange={handleChange}
        handleError={handleError}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(screen.getByText('Handler failed')).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('warns when action is not defined', async () => {
    const user = userEvent.setup();
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const field = createMockField({ action: undefined });
    const valuesMap = {};
    const handleChange = vi.fn();
    const handleError = vi.fn();

    renderWithProvider(
      <Button
        field={field}
        value={null}
        valuesMap={valuesMap}
        handleChange={handleChange}
        handleError={handleError}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('has no action defined')
      );
    });

    consoleWarnSpy.mockRestore();
  });

  it('displays error when handler is not registered', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const field = createMockField({ action: 'nonExistentHandler' });
    const valuesMap = {};
    const handleChange = vi.fn();
    const handleError = vi.fn();

    renderWithProvider(
      <Button
        field={field}
        value={null}
        valuesMap={valuesMap}
        handleChange={handleChange}
        handleError={handleError}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(screen.getByText(/not found/)).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('has accessible attributes', () => {
    const field = createMockField({ displayName: 'Accessible Button' });
    const valuesMap = {};
    const handleChange = vi.fn();
    const handleError = vi.fn();

    renderWithProvider(
      <Button
        field={field}
        value={null}
        valuesMap={valuesMap}
        handleChange={handleChange}
        handleError={handleError}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Accessible Button');
    expect(button).toHaveAttribute('type', 'button');
  });
});
