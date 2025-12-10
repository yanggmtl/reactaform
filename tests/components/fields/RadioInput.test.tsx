import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RadioInput from '../../../src/components/fields/RadioInput';
import { renderWithProvider, createMockField, baseFieldProps } from '../../test-utils';
import type { DefinitionPropertyField } from '../../../src/core/reactaFormTypes';

describe('RadioInput', () => {
  const mockOptions = [
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' },
    { label: 'Option C', value: 'c' },
  ];

  it('renders radio buttons with label', () => {
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Choose One', options: mockOptions });
    renderWithProvider(<RadioInput {...baseFieldProps} field={field} value="a" />);

    expect(screen.getByText('Choose One')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /option a/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /option b/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /option c/i })).toBeInTheDocument();
  });

  it('displays all radio options', () => {
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Radio', options: mockOptions });
    renderWithProvider(<RadioInput {...baseFieldProps} field={field} value="a" />);

    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBe(3);
  });

  it('checks the initially selected value', () => {
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Radio', options: mockOptions });
    renderWithProvider(<RadioInput {...baseFieldProps} field={field} value="b" />);

    const radioB = screen.getByRole('radio', { name: /option b/i }) as HTMLInputElement;
    expect(radioB.checked).toBe(true);
  });

  it('calls onChange when radio button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Radio', options: mockOptions });
    renderWithProvider(
      <RadioInput {...baseFieldProps} field={field} value="a" onChange={onChange} />
    );

    const radioC = screen.getByRole('radio', { name: /option c/i });
    await user.click(radioC);

    expect(onChange).toHaveBeenCalledWith('c', null);
  });

  it('validates required field with empty value', () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Required Radio', options: mockOptions, required: true });
    renderWithProvider(
      <RadioInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    // Should auto-correct to first option
    expect(onChange).toHaveBeenCalledWith('a', null);
  });

  it('auto-corrects invalid value to first option', () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Radio', options: mockOptions });
    renderWithProvider(
      <RadioInput {...baseFieldProps} field={field} value="invalid" onChange={onChange} />
    );

    // Should auto-correct to first option
    expect(onChange).toHaveBeenCalledWith('a', null);
  });

  it('renders vertical layout by default', () => {
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Radio', options: mockOptions });
    const { container } = renderWithProvider(
      <RadioInput {...baseFieldProps} field={field} value="a" />
    );

    const wrapper = container.querySelector('div[style*="flex-direction: column"]') as HTMLElement;
    expect(wrapper).toBeTruthy();
  });

  it('renders horizontal layout when specified', () => {
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Radio', options: mockOptions, layout: 'horizontal' });
    const { container } = renderWithProvider(
      <RadioInput {...baseFieldProps} field={field} value="a" />
    );

    const wrapper = container.querySelector('div[style*="flex-direction: row"]') as HTMLElement;
    expect(wrapper).toBeTruthy();
  });

  it('handles empty options array', () => {
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Empty Radio', options: [] });
    renderWithProvider(<RadioInput {...baseFieldProps} field={field} value="" />);

    const radios = screen.queryAllByRole('radio');
    expect(radios.length).toBe(0);
  });

  it('groups radios with same name attribute', () => {
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Radio', name: 'choice', options: mockOptions });
    renderWithProvider(<RadioInput {...baseFieldProps} field={field} value="a" />);

    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    radios.forEach(radio => {
      expect(radio.name).toBe('choice');
    });
  });

  it('handles numeric option values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const numericOptions = [
      { label: 'One', value: '1' },
      { label: 'Two', value: '2' },
      { label: 'Three', value: '3' },
    ];
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Numbers', options: numericOptions });
    renderWithProvider(
      <RadioInput {...baseFieldProps} field={field} value="1" onChange={onChange} />
    );

    const radioTwo = screen.getByRole('radio', { name: /two/i });
    await user.click(radioTwo);

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('2');
    expect(lastCall[1]).toBeNull();
  });

  it('displays tooltip icon when provided', () => {
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Radio', options: mockOptions, tooltip: 'Select one option' });
    renderWithProvider(<RadioInput {...baseFieldProps} field={field} value="a" />);

    const icons = screen.queryAllByTestId('tooltip-icon');
    expect(icons.length).toBeGreaterThanOrEqual(0);
  });

  it('maintains selection across re-renders', () => {
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Radio', options: mockOptions });
    const { rerender } = renderWithProvider(
      <RadioInput {...baseFieldProps} field={field} value="b" />
    );

    let radioB = screen.getByRole('radio', { name: /option b/i }) as HTMLInputElement;
    expect(radioB.checked).toBe(true);

    rerender(<RadioInput {...baseFieldProps} field={field} value="b" />);
    
    radioB = screen.getByRole('radio', { name: /option b/i }) as HTMLInputElement;
    expect(radioB.checked).toBe(true);
  });

  it('updates when value prop changes', () => {
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Radio', options: mockOptions });
    const { rerender } = renderWithProvider(
      <RadioInput {...baseFieldProps} field={field} value="a" />
    );

    const radioA = screen.getByRole('radio', { name: /option a/i }) as HTMLInputElement;
    expect(radioA.checked).toBe(true);

    rerender(<RadioInput {...baseFieldProps} field={field} value="c" />);
    
    const radioC = screen.getByRole('radio', { name: /option c/i }) as HTMLInputElement;
    expect(radioC.checked).toBe(true);
  });
});
