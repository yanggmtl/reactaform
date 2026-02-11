import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SliderInput from '../../../src/components/fields/advanced/SliderInput';
import { renderWithProvider, createMockField, baseFieldProps } from '../../test-utils';
import type { DefinitionPropertyField } from '../../../src/core/reactaFormTypes';

describe('SliderInput', () => {
  it('renders slider and text input with label', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'slider', label: 'Volume', min: 0, max: 100 });
    const { container } = renderWithProvider(<SliderInput {...baseFieldProps} field={field} value={50} />);

    const slider = container.querySelector('input[type="range"]');
    const textInput = container.querySelector('input[type="text"]');
    
    expect(slider).toBeInTheDocument();
    expect(textInput).toBeInTheDocument();
    expect(screen.getByText('Volume')).toBeInTheDocument();
  });

  it('displays initial value in both inputs', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'slider', label: 'Level', min: 0, max: 100 });
    const { container } = renderWithProvider(<SliderInput {...baseFieldProps} field={field} value={75} />);

    const slider = container.querySelector('input[type="range"]') as HTMLInputElement;
    const textInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    
    expect(slider.value).toBe('75');
    expect(textInput.value).toBe('75');
  });

  it('calls onChange when slider is moved', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'slider', label: 'Value', min: 0, max: 100 });
    const { container } = renderWithProvider(
      <SliderInput {...baseFieldProps} field={field} value={50} onChange={onChange} />
    );

    const slider = container.querySelector('input[type="range"]')!;
    fireEvent.change(slider, { target: { value: '60' } });

    expect(onChange).toHaveBeenCalled();
  });

  it('calls onChange when text input is changed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'slider', label: 'Value', min: 0, max: 100 });
    const { container } = renderWithProvider(
      <SliderInput {...baseFieldProps} field={field} value={50} onChange={onChange} />
    );

    const textInput = container.querySelector('input[type="text"]')!;
    await user.clear(textInput);
    await user.type(textInput, '75');

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('75');
  });

  it('validates min constraint', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onError = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'slider', label: 'Value', min: 10, max: 100 });
    const { container } = renderWithProvider(
      <SliderInput {...baseFieldProps} field={field} value={50} onChange={onChange} onError={onError} />
    );

    const textInput = container.querySelector('input[type="text"]')!;
    await user.clear(textInput);
    await user.type(textInput, '5');

    expect(onError.mock.calls.some(c => c[0] !== null)).toBeTruthy(); // error for min
  });

  it('validates max constraint', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onError = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'slider', label: 'Value', min: 0, max: 100 });
    const { container } = renderWithProvider(
      <SliderInput {...baseFieldProps} field={field} value={50} onChange={onChange} onError={onError} />
    );

    const textInput = container.querySelector('input[type="text"]')!;
    await user.clear(textInput);
    await user.type(textInput, '150');

    expect(onError.mock.calls.some(c => c[0] !== null)).toBeTruthy(); // error for max
  });

  it('accepts valid value within min/max range', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'slider', label: 'Value', min: 0, max: 100 });
    const { container } = renderWithProvider(
      <SliderInput {...baseFieldProps} field={field} value={50} onChange={onChange} />
    );

    const textInput = container.querySelector('input[type="text"]')!;
    await user.clear(textInput);
    await user.type(textInput, '75');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('75');

  });

  it('accepts decimal values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'slider', label: 'Value', min: 0, max: 100 });
    const { container } = renderWithProvider(
      <SliderInput {...baseFieldProps} field={field} value={50} onChange={onChange} />
    );

    const textInput = container.querySelector('input[type="text"]')!;
    await user.clear(textInput);
    await user.type(textInput, '42.5');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('42.5');

  });

  it('validates invalid number format', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onError = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'slider', label: 'Value', min: 0, max: 100 });
    const { container } = renderWithProvider(
      <SliderInput {...baseFieldProps} field={field} value={50} onChange={onChange} onError={onError} />
    );

    const textInput = container.querySelector('input[type="text"]')!;
    await user.clear(textInput);
    await user.type(textInput, 'abc');

    expect(onError.mock.calls.some(c => c[0] !== null)).toBeTruthy(); // error for invalid format
  });

  it('validates required field', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onError = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'slider', label: 'Required Value', min: 0, max: 100, required: true });
    const { container } = renderWithProvider(
      <SliderInput {...baseFieldProps} field={field} value={50} onChange={onChange} onError={onError} />
    );

    const textInput = container.querySelector('input[type="text"]')!;
    await user.clear(textInput);

    expect(onError.mock.calls.some(c => c[0] !== null)).toBeTruthy(); // error for required
  });

  it('sets min and max attributes on slider', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'slider', label: 'Value', min: 10, max: 90 });
    const { container } = renderWithProvider(<SliderInput {...baseFieldProps} field={field} value={50} />);

    const slider = container.querySelector('input[type="range"]');
    expect(slider).toHaveAttribute('min', '10');
    expect(slider).toHaveAttribute('max', '90');
  });

  it('displays tooltip icon when provided', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'slider', label: 'Value', min: 0, max: 100, tooltip: 'Adjust the value' });
    renderWithProvider(<SliderInput {...baseFieldProps} field={field} value={50} />);

    expect(screen.getByTestId('tooltip-icon')).toBeInTheDocument();
  });
});
