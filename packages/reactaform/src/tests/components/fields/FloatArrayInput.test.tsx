import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FloatArrayInput from '../../../package/components/fields/FloatArrayInput';
import type { DefinitionPropertyField } from '../../../package/core/reactaFormTypes';
import { renderWithProvider, createMockField, baseFieldProps } from '../../test-utils';

describe('FloatArrayInput', () => {
  it('renders text input with label', () => {
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Floats', defaultValue: [] });
    renderWithProvider(<FloatArrayInput {...baseFieldProps} field={field} value={[]} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText(field.displayName)).toBeInTheDocument();
  });

  it('displays initial array value as comma-separated string', () => {
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Floats', defaultValue: [1.5, 2.7, 3.9] });
    renderWithProvider(<FloatArrayInput {...baseFieldProps} field={field} value={[1.5, 2.7, 3.9]} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('1.5, 2.7, 3.9');
  });

  it('calls onChange when user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Floats', defaultValue: [] });
    renderWithProvider(
      <FloatArrayInput {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '5.5, 10.2, 15.8');

    expect(onChange).toHaveBeenCalled();
  });

  it('validates float format', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Floats', defaultValue: [] });
    renderWithProvider(
      <FloatArrayInput {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '1.5, 2.7, 3.9');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeNull(); // no error for valid floats
  });

  it('accepts integer values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Floats', defaultValue: [] });
    renderWithProvider(
      <FloatArrayInput {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '1, 2, 3');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeNull(); // no error for integers (valid floats)
  });

  it('accepts scientific notation', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Floats', defaultValue: [] });
    renderWithProvider(
      <FloatArrayInput {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '1.5e3, 2.7e-2, 3.9e+1');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeNull(); // no error for scientific notation
  });

  it('rejects non-numeric values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Floats', defaultValue: [] });
    renderWithProvider(
      <FloatArrayInput {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '1.5, abc, 3.9');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for non-numeric
  });

  it('validates required field', async () => {
    const onError = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Required Floats', defaultValue: [], required: true });
    renderWithProvider(
      <FloatArrayInput {...baseFieldProps} field={field} value={[]} onError={onError} />
    );

    // onError effect should be invoked on mount with an error
    expect(onError).toHaveBeenCalled();
    const last = onError.mock.calls[onError.mock.calls.length - 1];
    expect(last[0]).toBeTruthy();
  });

  it('validates minCount constraint', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Floats', defaultValue: [], minCount: 3 });
    renderWithProvider(
      <FloatArrayInput {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '1.5, 2.7');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for minCount
  });

  it('validates maxCount constraint', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Floats', defaultValue: [], maxCount: 3 });
    renderWithProvider(
      <FloatArrayInput {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '1.5, 2.7, 3.9, 4.2');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for maxCount
  });

  it('validates min value constraint', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Floats', defaultValue: [], min: 5.0 });
    renderWithProvider(
      <FloatArrayInput {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '3.5, 7.2, 10.5');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for value < min
  });

  it('validates max value constraint', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Floats', defaultValue: [], max: 10.0 });
    renderWithProvider(
      <FloatArrayInput {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '5.5, 8.2, 15.7');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for value > max
  });

  it('accepts valid array within constraints', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Floats', defaultValue: [], min: 1.0, max: 100.0, minCount: 2, maxCount: 5 });
    renderWithProvider(
      <FloatArrayInput {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '10.5, 20.3, 30.8');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeNull(); // no error
  });

  it('handles negative floats', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Floats', defaultValue: [] });
    renderWithProvider(
      <FloatArrayInput {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '-5.5, -10.2, 15.8');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeNull(); // no error for negative floats
  });

  it('disables input when disabled prop is true', () => {
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Disabled', defaultValue: [], disabled: true });
    renderWithProvider(<FloatArrayInput {...baseFieldProps} field={field} value={[]} />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('does not call onChange when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Disabled', defaultValue: [], disabled: true });
    renderWithProvider(
      <FloatArrayInput {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    onChange.mockClear();
    const input = screen.getByRole('textbox');
    await user.type(input, '1.5, 2.7, 3.9');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('displays tooltip icon when provided', () => {
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Floats', defaultValue: [], tooltip: 'Enter comma-separated floats' });
    renderWithProvider(<FloatArrayInput {...baseFieldProps} field={field} value={[]} />);

    const icons = screen.getAllByTestId('tooltip-icon');
    expect(icons.length).toBeGreaterThan(0);
  });
});
