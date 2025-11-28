import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IntegerArrayInput, { type IntegerArrayField } from '../../../package/components/fields/IntegerArrayInput';
import { renderWithProvider, createMockField, baseFieldProps } from '../../test-utils';

describe('IntegerArrayInput', () => {
  it('renders text input with label', () => {
    const field = createMockField<IntegerArrayField>({ displayName: 'Numbers', defaultValue: [] });
    renderWithProvider(<IntegerArrayInput {...baseFieldProps} field={field} value={[]} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText(field.displayName)).toBeInTheDocument();
  });

  it('displays initial array value as comma-separated string', () => {
    const field = createMockField<IntegerArrayField>({ displayName: 'Numbers', defaultValue: [1, 2, 3] });
    renderWithProvider(<IntegerArrayInput {...baseFieldProps} field={field} value={[1, 2, 3]} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('1, 2, 3');
  });

  it('calls onChange when user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<IntegerArrayField>({ displayName: 'Numbers', defaultValue: [] });
    renderWithProvider(
      <IntegerArrayInput {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '5, 10, 15');

    expect(onChange).toHaveBeenCalled();
  });

  it('validates integer format', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<IntegerArrayField>({ displayName: 'Numbers', defaultValue: [] });
    renderWithProvider(
      <IntegerArrayInput {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '1, 2, 3');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeNull(); // no error for valid integers
  });

  it('rejects decimal values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<IntegerArrayField>({ displayName: 'Numbers', defaultValue: [] });
    renderWithProvider(
      <IntegerArrayInput {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '1, 2.5, 3');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for decimals
  });

  it('rejects non-numeric values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<IntegerArrayField>({ label: 'Numbers', defaultValue: [] });
    renderWithProvider(
      <IntegerArrayInput {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '1, abc, 3');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for non-numeric
  });

  it('validates required field', async () => {
    const onError = vi.fn();
    const field = createMockField<IntegerArrayField>({ displayName: 'Required Numbers', defaultValue: [], required: true });
    renderWithProvider(
      <IntegerArrayInput {...baseFieldProps} field={field} value={[]} onError={onError} />
    );

    // onError effect should be invoked on mount with an error
    expect(onError).toHaveBeenCalled();
    const last = onError.mock.calls[onError.mock.calls.length - 1];
    expect(last[0]).toBeTruthy();
  });

  it('validates minCount constraint', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<IntegerArrayField>({ displayName: 'Numbers', defaultValue: [], minCount: 3 });
    renderWithProvider(
      <IntegerArrayInput {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '1, 2');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for minCount
  });

  it('validates maxCount constraint', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<IntegerArrayField>({ displayName: 'Numbers', defaultValue: [], maxCount: 3 });
    renderWithProvider(
      <IntegerArrayInput {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '1, 2, 3, 4');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for maxCount
  });

  it('validates min value constraint', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<IntegerArrayField>({ displayName: 'Numbers', defaultValue: [], min: 5 });
    renderWithProvider(
      <IntegerArrayInput {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '3, 7, 10');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for value < min
  });

  it('validates max value constraint', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<IntegerArrayField>({ displayName: 'Numbers', defaultValue: [], max: 10 });
    renderWithProvider(
      <IntegerArrayInput {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '5, 8, 15');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for value > max
  });

  it('accepts valid array within constraints', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<IntegerArrayField>({ displayName: 'Numbers', defaultValue: [], min: 1, max: 100, minCount: 2, maxCount: 5 });
    renderWithProvider(
      <IntegerArrayInput {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '10, 20, 30');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeNull(); // no error
  });

  it('handles negative integers', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<IntegerArrayField>({ displayName: 'Numbers', defaultValue: [] });
    renderWithProvider(
      <IntegerArrayInput {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '-5, -10, 15');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeNull(); // no error for negative integers
  });

  it('disables input when disabled prop is true', () => {
    const field = createMockField<IntegerArrayField>({ displayName: 'Disabled', defaultValue: [], disabled: true });
    renderWithProvider(<IntegerArrayInput {...baseFieldProps} field={field} value={[]} />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('does not call onChange when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<IntegerArrayField>({ displayName: 'Disabled', defaultValue: [], disabled: true });
    renderWithProvider(
      <IntegerArrayInput {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    onChange.mockClear();
    const input = screen.getByRole('textbox');
    await user.type(input, '1, 2, 3');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('displays tooltip icon when provided', () => {
    const field = createMockField<IntegerArrayField>({ displayName: 'Numbers', defaultValue: [], tooltip: 'Enter comma-separated integers' });
    renderWithProvider(<IntegerArrayInput {...baseFieldProps} field={field} value={[]} />);
    const icons = screen.getAllByTestId('tooltip-icon');
    expect(icons.length).toBeGreaterThan(0);
  });
});
