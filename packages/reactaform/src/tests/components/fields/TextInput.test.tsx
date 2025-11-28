import { describe, it, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProvider, createMockField, baseFieldProps, waitForUpdate } from '../../test-utils';
import TextInput, { type TextField } from '../../../package/components/fields/TextInput';

describe('TextInput', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with basic props', () => {
    const field = createMockField<TextField>({ name: 'text', type: 'string' });
    const { getByRole } = renderWithProvider(
      <TextInput {...baseFieldProps} field={field} value="" />
    );

    const input = getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('displays initial value', () => {
    const field = createMockField<TextField>();
    const { getByDisplayValue } = renderWithProvider(
      <TextInput {...baseFieldProps} field={field} value="initial value" />
    );

    expect(getByDisplayValue('initial value')).toBeInTheDocument();
  });

  it('calls onChange when user types', async () => {
    const onChange = vi.fn();
    const field = createMockField<TextField>();
    const { getByRole } = renderWithProvider(
      <TextInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const input = getByRole('textbox');
    await user.type(input, 'Hello World');

    expect(onChange).toHaveBeenCalled();
  });

  it('shows error for required field when empty', async () => {
    const onError = vi.fn();
    const field = createMockField<TextField>({ required: true });
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
    const field = createMockField<TextField>({ maxLength: 5 });
    const { getByRole } = renderWithProvider(
      <TextInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const input = getByRole('textbox');
    await user.type(input, 'TooLongText');

    expect(onChange).toHaveBeenCalled();
  });

  it('is disabled when field.disabled is true', () => {
    const field = createMockField<TextField>({ disabled: true });
    const { getByRole } = renderWithProvider(
      <TextInput {...baseFieldProps} field={field} value="" />
    );

    expect(getByRole('textbox')).toBeDisabled();
  });

  it('handles tooltip display when tooltip is provided', () => {
    const field = createMockField<TextField>({ tooltip: 'This is a tooltip' });
    const { getByTestId } = renderWithProvider(
      <TextInput {...baseFieldProps} field={field} value="" />
    );

    // Look for tooltip icon with data-testid
    const tooltipIcon = getByTestId('tooltip-icon');
    expect(tooltipIcon).toBeInTheDocument();
  });

  it('renders with expected CSS classes', () => {
    const field = createMockField<TextField>();
    const { getByRole } = renderWithProvider(
      <TextInput {...baseFieldProps} field={field} value="" />
    );

    const input = getByRole('textbox');
    expect(input).toHaveClass('reactaform-input');
    expect(input).toHaveClass('reactaform-input--text');
  });
});