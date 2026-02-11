import { describe, it, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProvider, createMockField, baseFieldProps, waitForUpdate } from '../../test-utils';
import TextInput from '../../../src/components/fields/text-numeric/TextInput';
import type { DefinitionPropertyField } from '../../../src/core/reactaFormTypes';

describe('TextInput', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with basic props', () => {
    const field = createMockField<DefinitionPropertyField>({ name: 'text', type: 'text' });
    const { getByRole } = renderWithProvider(
      <TextInput {...baseFieldProps} field={field} value="" />
    );

    const input = getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('displays initial value', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'text' });
    const { getByDisplayValue } = renderWithProvider(
      <TextInput {...baseFieldProps} field={field} value="initial value" />
    );

    expect(getByDisplayValue('initial value')).toBeInTheDocument();
  });

  it('calls onChange when user types', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'text' });
    const { getByRole } = renderWithProvider(
      <TextInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const input = getByRole('textbox');
    await user.type(input, 'Hello World');

    expect(onChange).toHaveBeenCalled();
  });

  it('shows error for required field when empty', async () => {
    const onError = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'text', required: true });
    const { getByRole } = renderWithProvider(
      <TextInput {...baseFieldProps} field={field} value="" onError={onError} />
    );

    const input = getByRole('textbox');
    await user.click(input);
    await user.tab(); // trigger blur

    await waitForUpdate();
    expect(onError).toHaveBeenCalled();
  });

  it('respects maxLength validation', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'text', maxLength: 5 });
    const { getByRole } = renderWithProvider(
      <TextInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const input = getByRole('textbox');
    await user.type(input, 'TooLongText');

    expect(onChange).toHaveBeenCalled();
  });

  it('handles tooltip display when tooltip is provided', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'text', tooltip: 'This is a tooltip' });
    const { getByTestId } = renderWithProvider(
      <TextInput {...baseFieldProps} field={field} value="" />
    );

    // Look for tooltip icon with data-testid
    const tooltipIcon = getByTestId('tooltip-icon');
    expect(tooltipIcon).toBeInTheDocument();
  });

  it('renders with expected CSS classes', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'text' });
    const { getByRole } = renderWithProvider(
      <TextInput {...baseFieldProps} field={field} value="" />
    );

    const input = getByRole('textbox');
    expect(input).toHaveClass('reactaform-input');
    expect(input).toHaveClass('reactaform-input--text');
  });
});
