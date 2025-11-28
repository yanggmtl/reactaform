import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DropdownInput, { type DropdownField } from '../../../package/components/fields/DropdownInput';
import { renderWithProvider, createMockField, baseFieldProps } from '../../test-utils';

describe('DropdownInput', () => {
  const mockOptions = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
    { label: 'Option 3', value: 'opt3' },
  ];

  it('renders select dropdown with label', () => {
    const field = createMockField<DropdownField>({ displayName: 'Select Option', options: mockOptions });
    renderWithProvider(<DropdownInput {...baseFieldProps} field={field} value="opt1" />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Select Option')).toBeInTheDocument();
  });

  it('displays all options in dropdown', () => {
    const field = createMockField<DropdownField>({ displayName: 'Dropdown', options: mockOptions });
    renderWithProvider(<DropdownInput {...baseFieldProps} field={field} value="opt1" />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    
    mockOptions.forEach(opt => {
      expect(screen.getByText(opt.label)).toBeInTheDocument();
    });
  });

  it('displays initial selected value', () => {
    const field = createMockField<DropdownField>({ displayName: 'Dropdown', options: mockOptions });
    renderWithProvider(<DropdownInput {...baseFieldProps} field={field} value="opt2" />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('opt2');
  });

  it('calls onChange when option is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DropdownField>({ displayName: 'Dropdown', options: mockOptions });
    renderWithProvider(
      <DropdownInput {...baseFieldProps} field={field} value="opt1" onChange={onChange} />
    );

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'opt3');

    expect(onChange).toHaveBeenCalledWith('opt3', null);
  });

  it('validates required field with empty value', () => {
    const onChange = vi.fn();
    const field = createMockField<DropdownField>({ displayName: 'Required Dropdown', options: mockOptions, required: true });
    renderWithProvider(
      <DropdownInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    // Should auto-correct to first option
    expect(onChange).toHaveBeenCalledWith('opt1', null);
  });

  it('auto-corrects invalid value to first option', () => {
    const onChange = vi.fn();
    const field = createMockField<DropdownField>({ displayName: 'Dropdown', options: mockOptions });
    renderWithProvider(
      <DropdownInput {...baseFieldProps} field={field} value="invalid" onChange={onChange} />
    );

    // Should auto-correct to first option
    expect(onChange).toHaveBeenCalledWith('opt1', null);
  });

  it('validates that selected value is in options', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DropdownField>({ displayName: 'Dropdown', options: mockOptions });
    renderWithProvider(
      <DropdownInput {...baseFieldProps} field={field} value="opt1" onChange={onChange} />
    );

    // Change to valid option
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'opt2');

    expect(onChange).toHaveBeenCalledWith('opt2', null);
  });

  it('disables select when disabled prop is true', () => {
    const field = createMockField<DropdownField>({ displayName: 'Disabled Dropdown', options: mockOptions, disabled: true });
    renderWithProvider(<DropdownInput {...baseFieldProps} field={field} value="opt1" />);

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('does not call onChange when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DropdownField>({ displayName: 'Disabled', options: mockOptions, disabled: true });
    renderWithProvider(
      <DropdownInput {...baseFieldProps} field={field} value="opt1" onChange={onChange} />
    );

    onChange.mockClear(); // Clear initial call
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'opt2');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('handles empty options array', () => {
    const field = createMockField<DropdownField>({ displayName: 'Empty Dropdown', options: [] });
    renderWithProvider(<DropdownInput {...baseFieldProps} field={field} value="" />);

    const select = screen.getByRole('combobox');
    expect(select.children.length).toBe(0);
  });

  it('handles numeric option values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const numericOptions = [
      { label: 'One', value: '1' },
      { label: 'Two', value: '2' },
      { label: 'Three', value: '3' },
    ];
    const field = createMockField<DropdownField>({ displayName: 'Numbers', options: numericOptions });
    renderWithProvider(
      <DropdownInput {...baseFieldProps} field={field} value="1" onChange={onChange} />
    );

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, '2');

    expect(onChange).toHaveBeenCalledWith('2', null);
  });

  it('displays tooltip when provided', () => {
    const field = createMockField<DropdownField>({ displayName: 'Dropdown', options: mockOptions, tooltip: 'Choose an option' });
    renderWithProvider(<DropdownInput {...baseFieldProps} field={field} value="opt1" />);

    const icons = screen.getAllByTestId('tooltip-icon');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('maintains selection across re-renders', () => {
    const field = createMockField<DropdownField>({ label: 'Dropdown', options: mockOptions });
    const { rerender } = renderWithProvider(
      <DropdownInput {...baseFieldProps} field={field} value="opt2" />
    );

    let select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('opt2');

    rerender(<DropdownInput {...baseFieldProps} field={field} value="opt2" />);
    
    select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('opt2');
  });

  it('updates when value prop changes', () => {
    const field = createMockField<DropdownField>({ label: 'Dropdown', options: mockOptions });
    const { rerender } = renderWithProvider(
      <DropdownInput {...baseFieldProps} field={field} value="opt1" />
    );

    let select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('opt1');

    rerender(<DropdownInput {...baseFieldProps} field={field} value="opt3" />);
    
    select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('opt3');
  });
});
