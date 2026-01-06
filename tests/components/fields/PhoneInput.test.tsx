import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhoneInput from '../../../src/components/fields/PhoneInput';
import { renderWithProvider, createMockField, baseFieldProps } from '../../test-utils';
import type { DefinitionPropertyField } from '../../../src/core/reactaFormTypes';

describe('PhoneInput', () => {
  it('renders input with label', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'phone', label: 'Phone Number' });
    renderWithProvider(<PhoneInput {...baseFieldProps} field={field} value="" />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('Phone Number')).toBeInTheDocument();
  });

  it('renders as tel input type', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'phone', label: 'Phone' });
    renderWithProvider(<PhoneInput {...baseFieldProps} field={field} value="" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'tel');
  });

  it('displays initial value', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'phone', label: 'Phone' });
    const value = '+1234567890';
    renderWithProvider(<PhoneInput {...baseFieldProps} field={field} value={value} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue(value);
  });

  it('calls onChange when user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'phone', label: 'Phone' });
    renderWithProvider(
      <PhoneInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '123456');

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[onChange.mock.calls.length - 1][0]).toBe('123456');
  });

  it('validates required field', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'phone', label: 'Required Phone', required: true });
    renderWithProvider(
      <PhoneInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, ' ');
    await user.clear(input);

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error present
  });

  it('validates pattern constraint', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({
      type: 'phone',
      label: 'Phone', 
      pattern: '^\\+?[1-9]\\d{1,14}$' // E.164 format
    });
    renderWithProvider(
      <PhoneInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'invalid');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('invalid');
    expect(lastCall[1]).toBeTruthy(); // error for pattern mismatch
  });

  it('accepts valid phone matching pattern', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ 
      type: 'phone',
      label: 'Phone', 
      pattern: '^\\+?[1-9]\\d{1,14}$'
    });
    renderWithProvider(
      <PhoneInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '+12345678901');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('+12345678901');
    expect(lastCall[1]).toBeNull(); // no error
  });

  it('trims whitespace in validation', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({
      type: 'phone',
      label: 'Phone', 
      pattern: '^\\d{10}$'
    });
    renderWithProvider(
      <PhoneInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, ' 1234567890 ');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe(' 1234567890 ');
    expect(lastCall[1]).toBeNull(); // no error after trim
  });

  it('displays tooltip when provided', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'phone', label: 'Phone', tooltip: 'Enter your phone number' });
    renderWithProvider(<PhoneInput {...baseFieldProps} field={field} value="" />);

    expect(screen.getByTestId('tooltip-icon')).toBeInTheDocument();
  });

  it('handles empty value correctly', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'phone', label: 'Optional Phone', required: false });
    renderWithProvider(
      <PhoneInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '123');
    await user.clear(input);

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('');
    expect(lastCall[1]).toBeNull(); // no error for optional field
  });
});
