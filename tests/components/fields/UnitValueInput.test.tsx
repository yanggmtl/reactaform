import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UnitValueInput from '../../../src/components/fields/UnitValueInput';
import type { DefinitionPropertyField } from '../../../src/core/reactaFormTypes';
import { renderWithProvider, createMockField, baseFieldProps } from '../../test-utils';

describe('UnitValueInput', () => {
  it('renders text input and unit selector with label', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'unitvalue', label: 'Distance', dimension: 'length', defaultValue: ['10', 'm'] });
    renderWithProvider(<UnitValueInput {...baseFieldProps} field={field} value={['10', 'm']} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Distance')).toBeInTheDocument();
  });

  it('displays initial value and unit', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'unitvalue', label: 'Weight', dimension: 'weight', defaultValue: ['5', 'kg'] });
    renderWithProvider(<UnitValueInput {...baseFieldProps} field={field} value={['5', 'kg']} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    
    expect(input.value).toBe('5');
    expect(select.value).toBe('kg');
  });

  it('calls onChange when value is changed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'unitvalue', label: 'Length', dimension: 'length', defaultValue: ['10', 'm'] });
    renderWithProvider(
      <UnitValueInput {...baseFieldProps} field={field} value={['10', 'm']} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '25');

    expect(onChange).toHaveBeenCalled();
  });

  it('calls onChange when unit is changed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'unitvalue', label: 'Length', dimension: 'length', defaultValue: ['10', 'm'] });
    renderWithProvider(
      <UnitValueInput {...baseFieldProps} field={field} value={['10', 'm']} onChange={onChange} />
    );

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'cm');

    expect(onChange).toHaveBeenCalled();
  });

  it('validates required field', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'unitvalue', label: 'Required Value', dimension: 'length', required: true, defaultValue: ['10', 'm'] });
    renderWithProvider(
      <UnitValueInput {...baseFieldProps} field={field} value={['10', 'm']} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.clear(input);

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for required
  });

  it('validates invalid number format', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'unitvalue', label: 'Value', dimension: 'length', defaultValue: ['10', 'm'] });
    renderWithProvider(
      <UnitValueInput {...baseFieldProps} field={field} value={['10', 'm']} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'abc');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for invalid number
  });

  it('accepts valid float values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'unitvalue', label: 'Value', dimension: 'length', defaultValue: ['10', 'm'] });
    renderWithProvider(
      <UnitValueInput {...baseFieldProps} field={field} value={['10', 'm']} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '12.5');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0][0]).toBe('12.5');
    expect(lastCall[1]).toBeNull(); // no error
  });

  it('accepts scientific notation', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'unitvalue', label: 'Value', dimension: 'length', defaultValue: ['10', 'm'] });
    renderWithProvider(
      <UnitValueInput {...baseFieldProps} field={field} value={['10', 'm']} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '1.5e3');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0][0]).toBe('1.5e3');
    expect(lastCall[1]).toBeNull(); // no error
  });

  it('renders conversion button', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'unitvalue', label: 'Distance', dimension: 'length', defaultValue: ['10', 'm'] });
    renderWithProvider(<UnitValueInput {...baseFieldProps} field={field} value={['10', 'm']} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('disables conversion button when value is empty', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'unitvalue', label: 'Distance', dimension: 'length', defaultValue: ['', 'm'] });
    renderWithProvider(<UnitValueInput {...baseFieldProps} field={field} value={['', 'm']} />);

    const buttons = screen.getAllByRole('button');
    const conversionButton = buttons[0];
    expect(conversionButton).toBeDisabled();
  });

  it('disables conversion button when there is an error', async () => {
    const user = userEvent.setup();
    const field = createMockField<DefinitionPropertyField>({ type: 'unitvalue', label: 'Value', dimension: 'length', defaultValue: ['10', 'm'] });
    const { container } = renderWithProvider(
      <UnitValueInput {...baseFieldProps} field={field} value={['10', 'm']} />
    );

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'invalid');

    const buttons = container.querySelectorAll('button');
    const conversionButton = buttons[0];
    expect(conversionButton).toBeDisabled();
  });

  it('displays tooltip icon when provided', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'unitvalue', label: 'Value', dimension: 'length', tooltip: 'Enter length value', defaultValue: ['10', 'm'] });
    renderWithProvider(<UnitValueInput {...baseFieldProps} field={field} value={['10', 'm']} />);

    const tooltips = screen.getAllByTestId('tooltip-icon');
    expect(tooltips.length).toBeGreaterThan(0);
  });

  it('returns null when dimension is not provided', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'unitvalue', label: 'Value', defaultValue: ['10', 'm'] });
    const { container } = renderWithProvider(
      <UnitValueInput {...baseFieldProps} field={field} value={['10', 'm']} />
    );

    expect(container.querySelector('input')).not.toBeInTheDocument();
  });
});
