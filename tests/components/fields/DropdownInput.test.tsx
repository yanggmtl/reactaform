import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DropdownInput from '../../../src/components/fields/DropdownInput';
import { renderWithProvider, createMockField, baseFieldProps } from '../../test-utils';
import type { DefinitionPropertyField } from '../../../src/core/reactaFormTypes';

describe('DropdownInput', () => {
  const mockOptions = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
    { label: 'Option 3', value: 'opt3' },
  ];

  it('renders select dropdown with label', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'dropdown', displayName: 'Select Option', options: mockOptions });
    renderWithProvider(<DropdownInput {...baseFieldProps} field={field} value="opt1" />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Select Option')).toBeInTheDocument();
  });

  it('displays all options in dropdown', async () => {
    const user = userEvent.setup();
    const field = createMockField<DefinitionPropertyField>({ type: 'dropdown', displayName: 'Dropdown', options: mockOptions });
    renderWithProvider(<DropdownInput {...baseFieldProps} field={field} value="opt1" />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    
    // Open dropdown
    await user.click(select);

    mockOptions.forEach(opt => {
      // Use getAllByText because the selected value is also displayed
      const options = screen.getAllByText(opt.label);
      expect(options.length).toBeGreaterThan(0);
      // Or better, check specifically for the option role
      expect(screen.getByRole('option', { name: opt.label })).toBeInTheDocument();
    });
  });

  it('displays initial selected value', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'dropdown', displayName: 'Dropdown', options: mockOptions });
    renderWithProvider(<DropdownInput {...baseFieldProps} field={field} value="opt2" />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveTextContent('Option 2');
  });

  it('calls onChange when option is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'dropdown', displayName: 'Dropdown', options: mockOptions });
    renderWithProvider(
      <DropdownInput {...baseFieldProps} field={field} value="opt1" onChange={onChange} />
    );

    const select = screen.getByRole('combobox');
    await user.click(select);
    
    const option = screen.getByRole('option', { name: 'Option 3' });
    await user.click(option);

    expect(onChange).toHaveBeenCalledWith('opt3');
  });

  it('validates required field with empty value', () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'dropdown', displayName: 'Required Dropdown', options: mockOptions, required: true });
    renderWithProvider(
      <DropdownInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    // Should auto-correct to first option
    expect(onChange).toHaveBeenCalledWith('opt1');
  });

  it('validates that selected value is in options', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'dropdown', displayName: 'Dropdown', options: mockOptions });
    renderWithProvider(
      <DropdownInput {...baseFieldProps} field={field} value="opt1" onChange={onChange} />
    );

    // Change to valid option
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    const option = screen.getByRole('option', { name: 'Option 2' });
    await user.click(option);

    expect(onChange).toHaveBeenCalledWith('opt2');
  });

  it('handles empty options array', async () => {
    const user = userEvent.setup();
    const field = createMockField<DefinitionPropertyField>({ type: 'dropdown', displayName: 'Empty Dropdown', options: [] });
    renderWithProvider(<DropdownInput {...baseFieldProps} field={field} value="" />);

    const select = screen.getByRole('combobox');
    await user.click(select);
    
    // Should not find any options
    const listbox = screen.queryByRole('listbox');
    if (listbox) {
        expect(listbox.children.length).toBe(0);
    } else {
        // If listbox is not rendered when empty, that's also fine, or check for no options
        expect(screen.queryByRole('option')).not.toBeInTheDocument();
    }
  });

  it('handles numeric option values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const numericOptions = [
      { label: 'One', value: '1' },
      { label: 'Two', value: '2' },
      { label: 'Three', value: '3' },
    ];
    const field = createMockField<DefinitionPropertyField>({ type: 'dropdown', displayName: 'Numbers', options: numericOptions });
    renderWithProvider(
      <DropdownInput {...baseFieldProps} field={field} value="1" onChange={onChange} />
    );

    const select = screen.getByRole('combobox');
    await user.click(select);
    
    const option = screen.getByRole('option', { name: 'Two' });
    await user.click(option);

    expect(onChange).toHaveBeenCalledWith('2');
  });

  it('displays tooltip when provided', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'dropdown', displayName: 'Dropdown', options: mockOptions, tooltip: 'Choose an option' });
    renderWithProvider(<DropdownInput {...baseFieldProps} field={field} value="opt1" />);

    const icons = screen.getAllByTestId('tooltip-icon');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('maintains selection across re-renders', () => {
    const field = createMockField<DefinitionPropertyField>({ label: 'Dropdown', options: mockOptions });
    const { rerender } = renderWithProvider(
      <DropdownInput {...baseFieldProps} field={field} value="opt2" />
    );

    let select = screen.getByRole('combobox');
    expect(select).toHaveTextContent('Option 2');

    rerender(<DropdownInput {...baseFieldProps} field={field} value="opt2" />);
    
    select = screen.getByRole('combobox');
    expect(select).toHaveTextContent('Option 2');
  });

  it('updates when value prop changes', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'dropdown', label: 'Dropdown', options: mockOptions });
    const { rerender } = renderWithProvider(
      <DropdownInput {...baseFieldProps} field={field} value="opt1" />
    );

    let select = screen.getByRole('combobox');
    expect(select).toHaveTextContent('Option 1');

    rerender(<DropdownInput {...baseFieldProps} field={field} value="opt3" />);
    
    select = screen.getByRole('combobox');
    expect(select).toHaveTextContent('Option 3');
  });
});
