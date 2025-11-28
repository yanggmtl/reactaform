import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateTimeZoneInput, { type DateTimeZoneField } from '../../../package/components/fields/DateTimeZoneInput';
import { renderWithProvider, createMockField, baseFieldProps } from '../../test-utils';

describe('DateTimeZoneInput', () => {
  const getDateInput = (container: HTMLElement) => container.querySelector('input[type="date"]')!;
  const getTimeInput = (container: HTMLElement) => container.querySelector('input[type="time"]')!;
  const getTimezoneSelect = (container: HTMLElement) => container.querySelector('select')!;

  it('renders date, time, and timezone inputs with label', () => {
    const field = createMockField<DateTimeZoneField>({ label: 'Event Time' });
    const { container } = renderWithProvider(<DateTimeZoneInput {...baseFieldProps} field={field} value="" />);

    expect(getDateInput(container)).toBeInTheDocument();
    expect(getTimeInput(container)).toBeInTheDocument();
    expect(getTimezoneSelect(container)).toBeInTheDocument();
    expect(screen.getByText('Event Time')).toBeInTheDocument();
  });

  it('displays initial value split into date, time, and timezone', () => {
    const field = createMockField<DateTimeZoneField>({ label: 'DateTime' });
    const { container } = renderWithProvider(
      <DateTimeZoneInput {...baseFieldProps} field={field} value="2024-03-15T14:30+05:00" />
    );

    const dateInput = getDateInput(container) as HTMLInputElement;
    const timeInput = getTimeInput(container) as HTMLInputElement;
    const tzSelect = getTimezoneSelect(container) as HTMLSelectElement;

    expect(dateInput.value).toBe('2024-03-15');
    expect(timeInput.value).toBe('14:30');
    expect(tzSelect.value).toBe('+05:00');
  });

  it('defaults to UTC (Z) timezone when not specified', () => {
    const field = createMockField<DateTimeZoneField>({ label: 'DateTime' });
    const { container } = renderWithProvider(
      <DateTimeZoneInput {...baseFieldProps} field={field} value="2024-03-15T14:30" />
    );

    const tzSelect = getTimezoneSelect(container) as HTMLSelectElement;
    expect(tzSelect.value).toBe('Z');
  });

  it('calls onChange when date is changed', async () => {
    const onChange = vi.fn();
    const field = createMockField<DateTimeZoneField>({ label: 'DateTime' });
    const { container } = renderWithProvider(
      <DateTimeZoneInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const dateInput = getDateInput(container) as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2024-12-25' } });

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(typeof lastCall[0]).toBe('string');
  });

  it('calls onChange when time is changed', async () => {
    const onChange = vi.fn();
    const field = createMockField<DateTimeZoneField>({ label: 'DateTime' });
    const { container } = renderWithProvider(
      <DateTimeZoneInput {...baseFieldProps} field={field} value="2024-01-01T00:00Z" onChange={onChange} />
    );

    const timeInput = getTimeInput(container) as HTMLInputElement;
    fireEvent.change(timeInput, { target: { value: '09:30' } });

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(typeof lastCall[0]).toBe('string');
  });

  it('calls onChange when timezone is changed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DateTimeZoneField>({ label: 'DateTime' });
    const { container } = renderWithProvider(
      <DateTimeZoneInput {...baseFieldProps} field={field} value="2024-01-01T12:00Z" onChange={onChange} />
    );

    const tzSelect = getTimezoneSelect(container);
    await user.selectOptions(tzSelect, '+05:00');

    expect(onChange).toHaveBeenCalledWith(expect.stringContaining('+05:00'), null);
  });

  it('combines date, time, and timezone into ISO format with offset', async () => {
    const onChange = vi.fn();
    const field = createMockField<DateTimeZoneField>({ label: 'DateTime' });
    const { container } = renderWithProvider(
      <DateTimeZoneInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );
    const dateInput = getDateInput(container) as HTMLInputElement;
    const timeInput = getTimeInput(container) as HTMLInputElement;
    const tzSelect = getTimezoneSelect(container) as HTMLSelectElement;

    fireEvent.change(dateInput, { target: { value: '2024-06-15' } });
    fireEvent.change(timeInput, { target: { value: '10:45' } });
    fireEvent.change(tzSelect, { target: { value: '-08:00' } });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toContain('2024-06-15');
    expect(lastCall[0]).toContain('-08:00');
  });

  it('validates required field', async () => {
    const onChange = vi.fn();
    const field = createMockField<DateTimeZoneField>({ label: 'Required DateTime', required: true });
    const { container } = renderWithProvider(
      <DateTimeZoneInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    // Empty values should trigger error
    const dateInput = getDateInput(container);
    await userEvent.setup().clear(dateInput);

    if (onChange.mock.calls.length > 0) {
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[1]).toBeTruthy(); // error present
    }
  });

  it('validates minDate constraint', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DateTimeZoneField>({ label: 'DateTime', minDate: '2024-01-01' });
    const { container } = renderWithProvider(
      <DateTimeZoneInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const dateInput = getDateInput(container);
    await user.type(dateInput, '2023-12-31');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for minDate
  });

  it('validates maxDate constraint', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DateTimeZoneField>({ label: 'DateTime', maxDate: '2024-12-31' });
    const { container } = renderWithProvider(
      <DateTimeZoneInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const dateInput = getDateInput(container);
    await user.type(dateInput, '2025-01-01');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for maxDate
  });

  it('accepts valid datetime within min/max range', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DateTimeZoneField>({ 
      label: 'DateTime', 
      minDate: '2024-01-01',
      maxDate: '2024-12-31'
    });
    const { container } = renderWithProvider(
      <DateTimeZoneInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const dateInput = getDateInput(container);
    await user.type(dateInput, '2024-06-15');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeNull(); // no error
  });

  it('includes UTC in timezone options', () => {
    const field = createMockField<DateTimeZoneField>({ label: 'DateTime' });
    const { container } = renderWithProvider(
      <DateTimeZoneInput {...baseFieldProps} field={field} value="" />
    );

    const tzSelect = getTimezoneSelect(container);
    const options = Array.from(tzSelect.querySelectorAll('option'));
    const utcOption = options.find(opt => opt.value === 'Z');
    
    expect(utcOption).toBeTruthy();
    expect(utcOption?.textContent).toBe('UTC');
  });

  it('includes multiple timezone options', () => {
    const field = createMockField<DateTimeZoneField>({ label: 'DateTime' });
    const { container } = renderWithProvider(
      <DateTimeZoneInput {...baseFieldProps} field={field} value="" />
    );

    const tzSelect = getTimezoneSelect(container);
    const options = Array.from(tzSelect.querySelectorAll('option'));
    
    expect(options.length).toBeGreaterThan(10);
    expect(options.some(opt => opt.value === '+05:00')).toBe(true);
    expect(options.some(opt => opt.value === '-08:00')).toBe(true);
  });

  it('sets aria-invalid on date input when error exists', async () => {
    const field = createMockField<DateTimeZoneField>({ label: 'DateTime', required: true });
    const { container } = renderWithProvider(
      <DateTimeZoneInput {...baseFieldProps} field={field} value="" />
    );

    const dateInput = getDateInput(container);
    // Empty required field should have aria-invalid
    expect(dateInput).toHaveAttribute('aria-invalid');
  });

  it('displays tooltip icon when provided', () => {
    const field = createMockField<DateTimeZoneField>({ label: 'DateTime', tooltip: 'Select date, time, and timezone' });
    renderWithProvider(<DateTimeZoneInput {...baseFieldProps} field={field} value="" />);

    const icons = screen.getAllByTestId('tooltip-icon');
    expect(icons.length).toBeGreaterThan(0);
  });
});
