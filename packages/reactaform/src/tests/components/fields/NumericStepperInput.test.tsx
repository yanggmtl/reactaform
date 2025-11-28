import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NumericStepperInput, { type NumericStepperField } from '../../../package/components/fields/NumericStepperInput';
import { renderWithProvider, createMockField, baseFieldProps } from '../../test-utils';

describe('NumericStepperInput', () => {
  it('renders number input with label', () => {
    const field = createMockField<NumericStepperField>({ type: 'numericStepper', label: 'Quantity', defaultValue: 5 });
    renderWithProvider(<NumericStepperInput {...baseFieldProps} field={field} value={5} />);

    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
  });

  it('displays initial value', () => {
    const field = createMockField<NumericStepperField>({ type: 'numericStepper', label: 'Count', defaultValue: 10 });
    renderWithProvider(<NumericStepperInput {...baseFieldProps} field={field} value={10} />);

    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    expect(input.value).toBe('10');
  });

  it('calls onChange when user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<NumericStepperField>({ type: 'numericStepper', label: 'Number', defaultValue: 0 });
    renderWithProvider(
      <NumericStepperInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '25');

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe(25);
  });

  it('validates min constraint', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<NumericStepperField>({ type: 'numericStepper', label: 'Number', defaultValue: 10, min: 5 });
    renderWithProvider(
      <NumericStepperInput {...baseFieldProps} field={field} value={10} onChange={onChange} />
    );

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '3');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for min
  });

  it('validates max constraint', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<NumericStepperField>({ type: 'numericStepper', label: 'Number', defaultValue: 10, max: 20 });
    renderWithProvider(
      <NumericStepperInput {...baseFieldProps} field={field} value={10} onChange={onChange} />
    );

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '25');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for max
  });

  it('accepts valid number within min/max range', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<NumericStepperField>({ label: 'Number', defaultValue: 0, min: 1, max: 100 });
    renderWithProvider(
      <NumericStepperInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '50');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe(50);
    expect(lastCall[1]).toBeNull(); // no error
  });

  it('sets min attribute when min is provided', () => {
    const field = createMockField<NumericStepperField>({ label: 'Number', defaultValue: 10, min: 5 });
    renderWithProvider(<NumericStepperInput {...baseFieldProps} field={field} value={10} />);

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('min', '5');
  });

  it('sets max attribute when max is provided', () => {
    const field = createMockField<NumericStepperField>({ label: 'Number', defaultValue: 10, max: 20 });
    renderWithProvider(<NumericStepperInput {...baseFieldProps} field={field} value={10} />);

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('max', '20');
  });

  it('sets step attribute', () => {
    const field = createMockField<NumericStepperField>({ type: 'numericStepper', label: 'Number', defaultValue: 0, step: 5 });
    renderWithProvider(<NumericStepperInput {...baseFieldProps} field={field} value={0} />);

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('step', '5');
  });

  it('defaults step to 1 when not provided', () => {
    const field = createMockField<NumericStepperField>({ type: 'numericStepper', label: 'Number', defaultValue: 0 });
    renderWithProvider(<NumericStepperInput {...baseFieldProps} field={field} value={0} />);

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('step', '1');
  });

  it('rejects decimal values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<NumericStepperField>({ type: 'numericStepper', label: 'Integer', defaultValue: 0 });
    renderWithProvider(
      <NumericStepperInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '12.5');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for non-integer
  });

  it('validates required field', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<NumericStepperField>({ type: 'numericStepper', label: 'Required Number', defaultValue: 0, required: true });
    renderWithProvider(
      <NumericStepperInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    const input = screen.getByRole('spinbutton');
    await user.clear(input);

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for required
  });

  it('disables input when disabled prop is true', () => {
    const field = createMockField<NumericStepperField>({ type: 'numericStepper', label: 'Disabled', defaultValue: 10, disabled: true });
    renderWithProvider(<NumericStepperInput {...baseFieldProps} field={field} value={10} />);

    const input = screen.getByRole('spinbutton');
    expect(input).toBeDisabled();
  });

  it('does not call onChange when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<NumericStepperField>({ type: 'numericStepper', label: 'Disabled', defaultValue: 10, disabled: true });
    renderWithProvider(
      <NumericStepperInput {...baseFieldProps} field={field} value={10} onChange={onChange} />
    );

    onChange.mockClear();
    const input = screen.getByRole('spinbutton');
    await user.type(input, '5');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('has accessible id matching field name', () => {
    const field = createMockField<NumericStepperField>({ type: 'numericStepper', label: 'Count', name: 'itemCount', defaultValue: 0 });
    renderWithProvider(<NumericStepperInput {...baseFieldProps} field={field} value={0} />);

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('id', 'itemCount');
  });
});
