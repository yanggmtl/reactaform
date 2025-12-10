import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SpinInput from '../../../src/components/fields/SpinInput';
import { renderWithProvider, createMockField, baseFieldProps } from '../../test-utils';
import type { DefinitionPropertyField } from '../../../src/core/reactaFormTypes';

describe('SpinInput', () => {
  it('renders text input with increment/decrement buttons', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'spin', label: 'Counter', defaultValue: 5 });
    renderWithProvider(<SpinInput {...baseFieldProps} field={field} value={5} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('Counter')).toBeInTheDocument();
    // Buttons should be present (up and down arrows)
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('displays initial value', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'spin', label: 'Value', defaultValue: 10 });
    renderWithProvider(<SpinInput {...baseFieldProps} field={field} value={10} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('10');
  });

  it('calls onChange when user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'spin', label: 'Number', defaultValue: 0 });
    renderWithProvider(
      <SpinInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '25');

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe(25);
  });

  it('increments value when up button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'spin', label: 'Counter', defaultValue: 5 });
    renderWithProvider(
      <SpinInput {...baseFieldProps} field={field} value={5} onChange={onChange} />
    );

    const buttons = screen.getAllByRole('button');
    const upButton = buttons[0]; // First button is increment
    await user.click(upButton);

    expect(onChange).toHaveBeenCalledWith(6, null);
  });

  it('decrements value when down button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'spin', label: 'Counter', defaultValue: 5 });
    renderWithProvider(
      <SpinInput {...baseFieldProps} field={field} value={5} onChange={onChange} />
    );

    const buttons = screen.getAllByRole('button');
    const downButton = buttons[1]; // Second button is decrement
    await user.click(downButton);

    expect(onChange).toHaveBeenCalledWith(4, null);
  });

  it('respects step value when incrementing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'spin', label: 'Counter', defaultValue: 0, step: 5 });
    renderWithProvider(
      <SpinInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    const buttons = screen.getAllByRole('button');
    const upButton = buttons[0];
    await user.click(upButton);

    expect(onChange).toHaveBeenCalledWith(5, null);
  });

  it('respects step value when decrementing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'spin', label: 'Counter', defaultValue: 10, step: 5 });
    renderWithProvider(
      <SpinInput {...baseFieldProps} field={field} value={10} onChange={onChange} />
    );

    const buttons = screen.getAllByRole('button');
    const downButton = buttons[1];
    await user.click(downButton);

    expect(onChange).toHaveBeenCalledWith(5, null);
  });

  it('validates min constraint', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'spin', label: 'Number', defaultValue: 10, min: 5 });
    renderWithProvider(
      <SpinInput {...baseFieldProps} field={field} value={10} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '3');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for min
  });

  it('validates max constraint', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'spin', label: 'Number', defaultValue: 10, max: 20 });
    renderWithProvider(
      <SpinInput {...baseFieldProps} field={field} value={10} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '25');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for max
  });

  it('does not increment beyond max', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'spin', label: 'Counter', defaultValue: 10, max: 10 });
    renderWithProvider(
      <SpinInput {...baseFieldProps} field={field} value={10} onChange={onChange} />
    );

    const buttons = screen.getAllByRole('button');
    const upButton = buttons[0];
    await user.click(upButton);

    // Should not call onChange with value > max
    const calls = onChange.mock.calls.filter((call) => Number(call[0]) > 10);
    expect(calls.length).toBe(0);
  });

  it('does not decrement below min', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'spin', label: 'Counter', defaultValue: 5, min: 5 });
    renderWithProvider(
      <SpinInput {...baseFieldProps} field={field} value={5} onChange={onChange} />
    );

    const buttons = screen.getAllByRole('button');
    const downButton = buttons[1];
    await user.click(downButton);

    // Should not call onChange with value < min
    const calls = onChange.mock.calls.filter((call) => Number(call[0]) < 5);
    expect(calls.length).toBe(0);
  });

  it('rejects decimal values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'spin', label: 'Integer', defaultValue: 0 });
    renderWithProvider(
      <SpinInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '12.5');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for non-integer
  });

  it('validates invalid input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'spin', label: 'Number', defaultValue: 0 });
    renderWithProvider(
      <SpinInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'abc');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for invalid format
  });

  it('validates required field', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'spin', label: 'Required Number', defaultValue: 0, required: true });
    renderWithProvider(
      <SpinInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.clear(input);

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for required
  });

  it('renders input and buttons when rendered', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'spin', label: 'Counter', defaultValue: 10 });
    renderWithProvider(<SpinInput {...baseFieldProps} field={field} value={10} />);

    const input = screen.getByRole('textbox');
    const buttons = screen.getAllByRole('button');
    
    expect(input).toBeInTheDocument();
    expect(buttons.length).toBe(2);
  });

  it('accepts negative integers when within min/max', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'spin', label: 'Counter', defaultValue: 0, min: -10, max: 10 });
    renderWithProvider(
      <SpinInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    onChange.mockClear();
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '-5');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe(-5);
    expect(lastCall[1]).toBeNull();
  });

  it('displays tooltip icon when provided', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'spin', label: 'Counter', defaultValue: 0, tooltip: 'Use buttons or type' });
    renderWithProvider(<SpinInput {...baseFieldProps} field={field} value={0} />);

    const tooltips = screen.getAllByTestId('tooltip-icon');
    expect(tooltips.length).toBeGreaterThan(0);
  });
});
