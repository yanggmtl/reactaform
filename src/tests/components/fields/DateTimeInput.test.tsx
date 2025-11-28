import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import DateTimeInput, { type DateTimeField } from '../../../package/components/fields/DateTimeInput';
import { renderWithProvider, createMockField, baseFieldProps } from '../../test-utils';

describe('DateTimeInput', () => {
  it('renders date and time inputs with label', () => {
    const field = createMockField<DateTimeField>({ displayName: 'Appointment' });
    const { container } = renderWithProvider(<DateTimeInput {...baseFieldProps} field={field} value="" />);

    expect(screen.getByText(field.displayName)).toBeInTheDocument();
    const dateInput = container.querySelector('input[type="date"]');
    const timeInput = container.querySelector('input[type="time"]');
    expect(dateInput).toBeInTheDocument();
    expect(timeInput).toBeInTheDocument();
  });

  it('displays initial value split into date and time', () => {
    const field = createMockField<DateTimeField>({ displayName: 'DateTime' });
    const { container } = renderWithProvider(
      <DateTimeInput {...baseFieldProps} field={field} value="2024-03-15T14:30" />
    );

    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    const timeInput = container.querySelector('input[type="time"]') as HTMLInputElement;

    expect(dateInput?.value).toBe('2024-03-15');
    expect(timeInput?.value).toBe('14:30');
  });

  it('calls onChange when date is changed', async () => {
    const onChange = vi.fn();
    const field = createMockField<DateTimeField>({ displayName: 'DateTime' });
    const { container } = renderWithProvider(
      <DateTimeInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2024-12-25' } });

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(typeof lastCall[0]).toBe('string');
  });

  it('calls onChange when time is changed', async () => {
    const onChange = vi.fn();
    const field = createMockField<DateTimeField>({ displayName: 'DateTime' });
    const { container } = renderWithProvider(
      <DateTimeInput {...baseFieldProps} field={field} value="2024-01-01T" onChange={onChange} />
    );

    const timeInput = container.querySelector('input[type="time"]') as HTMLInputElement;
    fireEvent.change(timeInput, { target: { value: '09:30' } });

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(typeof lastCall[0]).toBe('string');
  });

  it('combines date and time into ISO format', async () => {
    const onChange = vi.fn();
    const field = createMockField<DateTimeField>({ displayName: 'DateTime' });
    const { container } = renderWithProvider(
      <DateTimeInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    const timeInput = container.querySelector('input[type="time"]') as HTMLInputElement;

    fireEvent.change(dateInput, { target: { value: '2024-06-15' } });
    fireEvent.change(timeInput, { target: { value: '10:45' } });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toContain('2024-06-15');
    expect(lastCall[0]).toContain('10:45');
  });

  it('validates required field', async () => {
    const field = createMockField<DateTimeField>({ displayName: 'Required DateTime', required: true });
    const { container } = renderWithProvider(
      <DateTimeInput {...baseFieldProps} field={field} value="" />
    );

    const dateInput = container.querySelector('input[type="date"]')!;
    const timeInput = container.querySelector('input[type="time"]')!;

    // Initially should have aria-invalid due to required validation
    expect(dateInput).toHaveAttribute('aria-invalid', 'true');
    expect(timeInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('validates min datetime constraint', async () => {
    const onChange = vi.fn();
    const field = createMockField<DateTimeField>({ displayName: 'DateTime', min: '2024-01-01T09:00' });
    const { container } = renderWithProvider(
      <DateTimeInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    const timeInput = container.querySelector('input[type="time"]') as HTMLInputElement;

    fireEvent.change(dateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(timeInput, { target: { value: '08:00' } });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for min constraint
  });

  it('validates max datetime constraint', async () => {
    const onChange = vi.fn();
    const field = createMockField<DateTimeField>({ displayName: 'DateTime', max: '2024-12-31T17:00' });
    const { container } = renderWithProvider(
      <DateTimeInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    const timeInput = container.querySelector('input[type="time"]') as HTMLInputElement;

    fireEvent.change(dateInput, { target: { value: '2024-12-31' } });
    fireEvent.change(timeInput, { target: { value: '18:00' } });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for max constraint
  });

  it('accepts valid datetime within min/max range', async () => {
    const onChange = vi.fn();
    const field = createMockField<DateTimeField>({ displayName: 'DateTime', min: '2024-01-01T00:00', max: '2024-12-31T23:59' });
    const { container } = renderWithProvider(
      <DateTimeInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    const timeInput = container.querySelector('input[type="time"]') as HTMLInputElement;

    fireEvent.change(dateInput, { target: { value: '2024-06-15' } });
    fireEvent.change(timeInput, { target: { value: '12:30' } });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toContain('2024-06-15');
    expect(lastCall[1]).toBeNull(); // no error
  });

  it('handles date only with trailing T', async () => {
    const onChange = vi.fn();
    const field = createMockField<DateTimeField>({ displayName: 'DateTime' });
    const { container } = renderWithProvider(
      <DateTimeInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2024-03-15' } });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toMatch(/2024-03-15T/);
  });

  it('defaults time to 00:00 when value has date only', () => {
    const field = createMockField<DateTimeField>({ displayName: 'DateTime' });
    const { container } = renderWithProvider(
      <DateTimeInput {...baseFieldProps} field={field} value="2024-03-15" />
    );

    const timeInput = container.querySelector('input[type="time"]') as HTMLInputElement;

    expect(timeInput.value).toBe('00:00');
  });

  it('sets aria-invalid on inputs when error exists', async () => {
    const field = createMockField<DateTimeField>({ displayName: 'DateTime', required: true });
    const { container } = renderWithProvider(
      <DateTimeInput {...baseFieldProps} field={field} value="" />
    );

    const dateInput = container.querySelector('input[type="date"]')!;
    const timeInput = container.querySelector('input[type="time"]')!;

    expect(dateInput).toHaveAttribute('aria-invalid', 'true');
    expect(timeInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('displays tooltip when provided', () => {
    const field = createMockField<DateTimeField>({ displayName: 'DateTime', tooltip: 'Select date and time' });
    renderWithProvider(<DateTimeInput {...baseFieldProps} field={field} value="" />);

    const icons = screen.getAllByTestId('tooltip-icon');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('handles empty value for optional field', async () => {
    const onChange = vi.fn();
    const field = createMockField<DateTimeField>({ displayName: 'Optional DateTime', required: false });
    const { container } = renderWithProvider(
      <DateTimeInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(dateInput, { target: { value: '' } });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('');
    expect(lastCall[1]).toBeNull(); // no error for optional field
  });

  it('time input has step attribute for seconds', () => {
    const field = createMockField<DateTimeField>({ displayName: 'DateTime' });
    const { container } = renderWithProvider(<DateTimeInput {...baseFieldProps} field={field} value="" />);

    const timeInput = container.querySelector('input[type="time"]')!;

    expect(timeInput).toHaveAttribute('step', '1');
  });
});
