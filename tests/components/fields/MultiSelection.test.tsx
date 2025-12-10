import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MultiSelection, {type OptionsField } from '../../../src/components/fields/MultiSelection';
import { renderWithProvider, createMockField, baseFieldProps } from '../../test-utils';

describe('MultiSelection', () => {
  const mockOptions = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
    { label: 'Option 3', value: 'opt3' },
  ];

  it('renders control with label', () => {
    const field = createMockField<OptionsField>({ label: 'Select Multiple', options: mockOptions });
    renderWithProvider(<MultiSelection {...baseFieldProps} field={field} value={[]} />);

    expect(screen.getByText('Select Multiple')).toBeInTheDocument();
    expect(screen.getByText(/0 \/ 3 selected/i)).toBeInTheDocument();
  });

  it('displays selection count', () => {
    const field = createMockField<OptionsField>({ label: 'Select', options: mockOptions });
    renderWithProvider(<MultiSelection {...baseFieldProps} field={field} value={['opt1', 'opt2']} />);

    expect(screen.getByText(/2 \/ 3 selected/i)).toBeInTheDocument();
  });

  it('shows clear button when items are selected', () => {
    const field = createMockField<OptionsField>({ label: 'Select', options: mockOptions });
    renderWithProvider(<MultiSelection {...baseFieldProps} field={field} value={['opt1']} />);

    const clearButton = screen.getByRole('button', { name: /clear selections/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('does not show clear button when no items selected', () => {
    const field = createMockField<OptionsField>({ label: 'Select', options: mockOptions });
    renderWithProvider(<MultiSelection {...baseFieldProps} field={field} value={[]} />);

    const clearButton = screen.queryByRole('button', { name: /clear selections/i });
    expect(clearButton).not.toBeInTheDocument();
  });

  it('opens dropdown when control is clicked', async () => {
    const user = userEvent.setup();
    const field = createMockField<OptionsField>({ label: 'Select', options: mockOptions });
    const { container } = renderWithProvider(
      <MultiSelection {...baseFieldProps} field={field} value={[]} />
    );

    const control = container.querySelector('.reactaform-multiselection-control')!;
    await user.click(control);

    // Check if popup with checkboxes appears
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(3);
  });

  it('displays all options in dropdown', async () => {
    const user = userEvent.setup();
    const field = createMockField<OptionsField>({ label: 'Select', options: mockOptions });
    const { container } = renderWithProvider(
      <MultiSelection {...baseFieldProps} field={field} value={[]} />
    );

    const control = container.querySelector('.reactaform-multiselection-control')!;
    await user.click(control);

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('checks selected options in dropdown', async () => {
    const user = userEvent.setup();
    const field = createMockField<OptionsField>({ label: 'Select', options: mockOptions });
    const { container } = renderWithProvider(
      <MultiSelection {...baseFieldProps} field={field} value={['opt1', 'opt3']} />
    );

    const control = container.querySelector('.reactaform-multiselection-control')!;
    await user.click(control);

    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(checkboxes[0].checked).toBe(true);  // opt1
    expect(checkboxes[1].checked).toBe(false); // opt2
    expect(checkboxes[2].checked).toBe(true);  // opt3
  });

  it('calls onChange when option is toggled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<OptionsField>({ label: 'Select', options: mockOptions });
    const { container } = renderWithProvider(
      <MultiSelection {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    const control = container.querySelector('.reactaform-multiselection-control')!;
    await user.click(control);

    const option = screen.getByText('Option 1');
    await user.click(option);

    expect(onChange).toHaveBeenCalledWith(['opt1'], null);
  });

  it('adds to selection when unchecked option is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<OptionsField>({ label: 'Select', options: mockOptions });
    const { container } = renderWithProvider(
      <MultiSelection {...baseFieldProps} field={field} value={['opt1']} onChange={onChange} />
    );

    const control = container.querySelector('.reactaform-multiselection-control')!;
    await user.click(control);

    const option = screen.getByText('Option 2');
    await user.click(option);

    expect(onChange).toHaveBeenCalledWith(['opt1', 'opt2'], null);
  });

  it('removes from selection when checked option is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<OptionsField>({ label: 'Select', options: mockOptions });
    const { container } = renderWithProvider(
      <MultiSelection {...baseFieldProps} field={field} value={['opt1', 'opt2']} onChange={onChange} />
    );

    const control = container.querySelector('.reactaform-multiselection-control')!;
    await user.click(control);

    const option = screen.getByText('Option 1');
    await user.click(option);

    expect(onChange).toHaveBeenCalledWith(['opt2'], null);
  });

  it('clears all selections when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<OptionsField>({ label: 'Select', options: mockOptions });
    renderWithProvider(
      <MultiSelection {...baseFieldProps} field={field} value={['opt1', 'opt2']} onChange={onChange} />
    );

    const clearButton = screen.getByRole('button', { name: /clear selections/i });
    await user.click(clearButton);

    expect(onChange).toHaveBeenCalledWith([], null);
  });

  it('filters out invalid values from selection', () => {
    const field = createMockField<OptionsField>({ label: 'Select', options: mockOptions });
    renderWithProvider(
      <MultiSelection {...baseFieldProps} field={field} value={['opt1', 'invalid', 'opt2']} />
    );

    // Should only show 2 valid selections
    expect(screen.getByText(/2 \/ 3 selected/i)).toBeInTheDocument();
  });

  it('handles null value as empty array', () => {
    const field = createMockField<OptionsField>({ label: 'Select', options: mockOptions });
    renderWithProvider(<MultiSelection {...baseFieldProps} field={field} value={null} />);

    expect(screen.getByText(/0 \/ 3 selected/i)).toBeInTheDocument();
  });

  it('displays tooltip icon when provided', () => {
    const field = createMockField<OptionsField>({ label: 'Select', options: mockOptions, tooltip: 'Choose multiple options' });
    renderWithProvider(<MultiSelection {...baseFieldProps} field={field} value={[]} />);

    const tooltips = screen.getAllByTestId('tooltip-icon');
    expect(tooltips.length).toBeGreaterThan(0);
  });
});
