import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import DateInput from '../../../src/components/fields/DateInput';
import { renderWithProvider, createMockField, baseFieldProps } from '../../test-utils';
import type { DefinitionPropertyField } from '../../../src/core/reactaFormTypes';

describe('DateInput', () => {
  it('renders date input with label', () => {
    const field = createMockField<DefinitionPropertyField>({ type: "date", displayName: 'Birth Date' });
    const { container } = renderWithProvider(<DateInput {...baseFieldProps} field={field} value="" />);

    expect(screen.getByText(field.displayName)).toBeInTheDocument();
    const dateInput = container.querySelector('input[type="date"]');
    expect(dateInput).toBeInTheDocument();
  });

  it('displays initial value formatted for input', () => {
    const field = createMockField<DefinitionPropertyField>({ type: "date", displayName: 'Date' });
    const { container } = renderWithProvider(<DateInput {...baseFieldProps} field={field} value="2024-03-15" />);

    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(dateInput.value).toBe('2024-03-15');

    // also accept ISO datetime strings and ensure formatting to date portion
    const { container: c2 } = renderWithProvider(<DateInput {...baseFieldProps} field={field} value={'2024-03-15T14:30:00Z'} />);
    const dateInput2 = c2.querySelector('input[type="date"]') as HTMLInputElement;
    expect(dateInput2.value).toBe('2024-03-15');
  });

  it('calls onChange when date is changed', () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: "date", displayName: 'Date' });
    const { container } = renderWithProvider(<DateInput {...baseFieldProps} field={field} value="" onChange={onChange} />);

    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2024-12-25' } });

    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(typeof last[0]).toBe('string');
    expect(last[0]).toContain('2024-12-25');
    expect(last[1]).toBeNull();
  });

  it('validates required field and sets aria-invalid / calls onError', () => {
    const onError = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: "date", displayName: 'Required Date', required: true });
    const { container } = renderWithProvider(<DateInput {...baseFieldProps} field={field} value="" onError={onError} />);

    const input = container.querySelector('input[type="date"]')!;
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(onError).toHaveBeenCalled();
  });

  it('validates minDate constraint', () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: "date", displayName: 'Date', minDate: '2024-01-01' });
    const { container } = renderWithProvider(<DateInput {...baseFieldProps} field={field} value="" onChange={onChange} />);

    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2023-12-31' } });

    const last = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(last[1]).toBeTruthy(); // error due to minDate
  });

  it('validates maxDate constraint', () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: "date", displayName: 'Date', maxDate: '2024-12-31' });
    const { container } = renderWithProvider(<DateInput {...baseFieldProps} field={field} value="" onChange={onChange} />);

    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2025-01-01' } });

    const last = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(last[1]).toBeTruthy(); // error due to maxDate
  });
});
