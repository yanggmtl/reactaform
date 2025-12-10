import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TimeInput from '../../../src/components/fields/TimeInput';
import type { DefinitionPropertyField } from '../../../src/core/reactaFormTypes';
import { renderWithProvider, createMockField, baseFieldProps } from '../../test-utils';

describe('TimeInput', () => {
  it('renders time input with label', () => {
    const field = createMockField<DefinitionPropertyField>({ label: 'Meeting Time' });
    const { container } = renderWithProvider(<TimeInput {...baseFieldProps} field={field} value="" />);

    const timeInput = container.querySelector('input[type="time"]');
    expect(timeInput).toBeInTheDocument();
    expect(screen.getByText('Meeting Time')).toBeInTheDocument();
  });

  it('renders as time input type', () => {
    const field = createMockField<DefinitionPropertyField>({ label: 'Time' });
    const { container } = renderWithProvider(<TimeInput {...baseFieldProps} field={field} value="" />);

    const input = container.querySelector('input[type="time"]');
    expect(input).toHaveAttribute('type', 'time');
  });

  it('displays initial value in HH:MM format', () => {
    const field = createMockField<DefinitionPropertyField>({ label: 'Time' });
    const { container } = renderWithProvider(<TimeInput {...baseFieldProps} field={field} value="14:30" />);

    const input = container.querySelector('input[type="time"]') as HTMLInputElement;
    expect(input!.value).toBe('14:30');
  });

  it('calls onChange when user selects a time', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ label: 'Time', defaultValue: '' });
    const { container } = renderWithProvider(
      <TimeInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const timeInput = container.querySelector('input[type="time"]')!;
    fireEvent.change(timeInput, { target: { value: '09:45' } });

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('09:45');
  });

  it('validates Min time constraint', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ label: 'Time', defaultValue: '', min: '09:00' });
    const { container } = renderWithProvider(
      <TimeInput {...baseFieldProps} field={field} value="10:00" onChange={onChange} />
    );

    const timeInput = container.querySelector('input[type="time"]')!;
    fireEvent.change(timeInput, { target: { value: '08:30' } });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('08:30');
    expect(lastCall[1]).toBeTruthy(); // error for Min
  });

  it('validates max time constraint', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ label: 'Time', max: '17:00' });
    const { container } = renderWithProvider(
      <TimeInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const input = container.querySelector('input[type="time"]')!;
    await user.type(input, '18:00');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('18:00');
    expect(lastCall[1]).toBeTruthy(); // error for Max
  });

  it('accepts valid time within Min/Max range', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ label: 'Time', defaultValue: '', min: '09:00', max: '17:00' });
    const { container } = renderWithProvider(
      <TimeInput {...baseFieldProps} field={field} value="10:00" onChange={onChange} />
    );

    const timeInput = container.querySelector('input[type="time"]')!;
    fireEvent.change(timeInput, { target: { value: '12:30' } });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('12:30');
    expect(lastCall[1]).toBeNull(); // no error
  });

  it('sets min attribute when Min is provided', () => {
    const field = createMockField<DefinitionPropertyField>({ label: 'Time', min: '09:00' });
    const { container } = renderWithProvider(<TimeInput {...baseFieldProps} field={field} value="" />);

    const input = container.querySelector('input[type="time"]');
    expect(input).toHaveAttribute('min', '09:00');
  });

  it('sets max attribute when Max is provided', () => {
    const field = createMockField<DefinitionPropertyField>({ label: 'Time', max: '17:00' });
    const { container } = renderWithProvider(<TimeInput {...baseFieldProps} field={field} value="" />);

    const input = container.querySelector('input[type="time"]');
    expect(input).toHaveAttribute('max', '17:00');
  });

  it('includes seconds in step attribute', () => {
    const field = createMockField<DefinitionPropertyField>({ label: 'Time' });
    const { container } = renderWithProvider(<TimeInput {...baseFieldProps} field={field} value="" />);

    const input = container.querySelector('input[type="time"]');
    expect(input).toHaveAttribute('step', '1'); // allows seconds
  });

  it('handles HH:MM:SS format with seconds', () => {
    const field = createMockField<DefinitionPropertyField>({ label: 'Time' });
    const { container } = renderWithProvider(<TimeInput {...baseFieldProps} field={field} value="14:30:45" />);

    const input = container.querySelector('input[type="time"]') as HTMLInputElement;
    expect(input.value).toBe('14:30:45');
  });

  it('validates empty value when Min/Max are set', async () => {
    const onChange = vi.fn();
    const onError = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ label: 'Time', min: '09:00' });
    renderWithProvider(
      <TimeInput {...baseFieldProps} field={field} value="" onChange={onChange} onError={onError} />
    );

    // Empty value with Min/Max should show error
    expect(onError).toHaveBeenCalledWith(expect.any(String));
  });

  it('allows empty value when no Min/Max constraints', () => {
    const onError = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ label: 'Optional Time' });
    renderWithProvider(
      <TimeInput {...baseFieldProps} field={field} value="" onError={onError} />
    );

    // Should not call onError for empty optional field
    expect(onError).not.toHaveBeenCalled();
  });

  it('displays tooltip icon when provided', () => {
    const field = createMockField<DefinitionPropertyField>({ label: 'Time', tooltip: 'Select meeting time' });
    renderWithProvider(<TimeInput {...baseFieldProps} field={field} value="" />);

    expect(screen.getByTestId('tooltip-icon')).toBeInTheDocument();
  });

  it('handles midnight time (00:00)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ label: 'Time' });
    const { container } = renderWithProvider(
      <TimeInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const input = container.querySelector('input[type="time"]')!;
    await user.type(input, '00:00');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('00:00');
    expect(lastCall[1]).toBeNull(); // no error
  });

  it('handles end of day time (23:59)', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ label: 'Time', defaultValue: '' });
    const { container } = renderWithProvider(
      <TimeInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const timeInput = container.querySelector('input[type="time"]')!;
    fireEvent.change(timeInput, { target: { value: '23:59' } });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('23:59');
    expect(lastCall[1]).toBeNull(); // no error
  });
});
