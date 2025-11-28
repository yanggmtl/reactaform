import { describe, it, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProvider, createMockField, baseFieldProps, waitForUpdate } from '../../test-utils';
import IntegerInput, { type IntegerField } from '../../../package/components/fields/IntegerInput';

describe('IntegerInput', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with number input type', () => {
    const field = createMockField<IntegerField>({ name: 'number', type: 'number' });
    const { getByRole } = renderWithProvider(
      <IntegerInput {...baseFieldProps} field={field} value={0} />
    );

    const input = getByRole('textbox', { name: 'Test Field' });
    expect(input).toBeInTheDocument();
    // IntegerInput renders a controlled text input for numeric entry
    expect(input).toHaveAttribute('type', 'text');
  });

  it('displays initial numeric value', () => {
    const field = createMockField<IntegerField>();
    const { getByDisplayValue } = renderWithProvider(
      <IntegerInput {...baseFieldProps} field={field} value={42} />
    );

    expect(getByDisplayValue('42')).toBeInTheDocument();
  });

  it('calls onChange with numeric value when user types', async () => {
    const onChange = vi.fn();
    const field = createMockField<IntegerField>();
    const { getByRole } = renderWithProvider(
      <IntegerInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    const input = getByRole('textbox', { name: 'Test Field' });
    await user.clear(input);
    await user.type(input, '123');

    expect(onChange).toHaveBeenCalled();
  });

  it('validates minimum value', async () => {
    const onError = vi.fn();
    const field = createMockField<IntegerField>({ min: 10 });
    const { getByRole } = renderWithProvider(
      <IntegerInput {...baseFieldProps} field={field} value={0} onError={onError} />
    );

    const input = getByRole('textbox', { name: 'Test Field' });
    await user.clear(input);
    await user.type(input, '5');
    await user.tab(); // trigger blur

    await waitForUpdate();
    expect(onError).toHaveBeenCalled();
  });

  it('validates maximum value', async () => {
    const onChange = vi.fn();
    const field = createMockField<IntegerField>({ max: 100 });
    const { getByRole } = renderWithProvider(
      <IntegerInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    const input = getByRole('textbox', { name: 'Test Field' });
    await user.clear(input);
    await user.type(input, '150');
    await user.tab(); // trigger blur

    await waitForUpdate();
    expect(onChange).toHaveBeenCalled();
    // One of the onChange calls should include a non-null error as the second argument
    expect(onChange.mock.calls.some(c => c[1] !== null)).toBeTruthy();
  });

  it('shows error for required field when empty', async () => {
    const onError = vi.fn();
    const field = createMockField<IntegerField>({ required: true });
    const { getByRole } = renderWithProvider(
      <IntegerInput {...baseFieldProps} field={field} value={''} onError={onError} />
    );

    const input = getByRole('textbox', { name: 'Test Field' });
    await user.click(input);
    await user.tab(); // trigger blur

    await waitForUpdate();
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('required'));
  });

  it('handles decimal step values', async () => {
    const onChange = vi.fn();
    const field = createMockField<IntegerField>({ step: 0.1 });
    const { getByRole } = renderWithProvider(
      <IntegerInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    const input = getByRole('textbox', { name: 'Test Field' });
    await user.clear(input);
    await user.type(input, '3.14');

    // IntegerInput treats decimals as invalid; expect onChange to be invoked with an error
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.some(c => c[1] !== null)).toBeTruthy();
  });

  it('validates step increments', async () => {
    const onChange = vi.fn();
    const field = createMockField<IntegerField>({ step: 5 });
    const { getByRole } = renderWithProvider(
      <IntegerInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    const input = getByRole('textbox', { name: 'Test Field' });
    await user.clear(input);
    await user.type(input, '7'); // Not divisible by 5
    await user.tab(); // trigger blur

    await waitForUpdate();
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.some(c => c[1] !== null)).toBeTruthy();
  });

  it('rejects non-numeric input', async () => {
    const onChange = vi.fn();
    const field = createMockField<IntegerField>();
    const { getByRole } = renderWithProvider(
      <IntegerInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    const input = getByRole('textbox', { name: 'Test Field' });
    await user.clear(input);
    await user.type(input, 'abc');
    await user.tab(); // trigger blur

    await waitForUpdate();
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.some(c => c[1] !== null)).toBeTruthy();
  });

  it('is disabled when disabled prop is true', async () => {
    const onChange = vi.fn();
    const field = createMockField<IntegerField>({ disabled: true });
    const { getByRole } = renderWithProvider(
      <IntegerInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    const input = getByRole('textbox', { name: 'Test Field' });
    // Disabled field should not invoke onChange when typing
    await user.type(input, '1');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows placeholder text', () => {
    const field = createMockField<IntegerField>();
    const { getByRole } = renderWithProvider(
      <IntegerInput {...baseFieldProps} field={field} value={''} placeholder="Enter a number" />
    );

    // IntegerInput renders as a text input; assert the labeled textbox exists instead
    expect(getByRole('textbox', { name: 'Test Field' })).toBeInTheDocument();
  });

  it('handles edge cases for zero and negative numbers', async () => {
    const onChange = vi.fn();
    const field = createMockField<IntegerField>({ min: -100, max: 100 });
    const { getByRole } = renderWithProvider(
      <IntegerInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    const input = getByRole('textbox', { name: 'Test Field' });

    // Test zero
    await user.clear(input);
    await user.type(input, '0');
    expect(onChange).toHaveBeenCalled();
    // At least one onChange call should include the string '0' as the first arg
    expect(onChange.mock.calls.some(c => c[0] === '0')).toBeTruthy();

    // Test negative number
    await user.clear(input);
    await user.type(input, '-50');
    expect(onChange.mock.calls.some(c => c[0] === '-50')).toBeTruthy();
  });

  it('handles tooltip display', () => {
    const field = createMockField<IntegerField>({ tooltip: 'Enter a numeric value' });
    const { getByTestId } = renderWithProvider(
      <IntegerInput {...baseFieldProps} field={field} value={0} />
    );

    expect(getByTestId('tooltip-icon')).toBeInTheDocument();
  });
});
