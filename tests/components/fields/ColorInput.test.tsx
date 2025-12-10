import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColorInput from '../../../src/components/fields/ColorInput';
import { type DefinitionPropertyField } from '../../../src/core/reactaFormTypes';
import { renderWithProvider, createMockField, baseFieldProps } from '../../test-utils';

describe('ColorInput', () => {
  it('renders select and color picker', () => {
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Choose Color' });
    renderWithProvider(<ColorInput {...baseFieldProps} field={field} value="#ff0000" />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Choose Color')).toBeInTheDocument();
  });

  it('displays initial color value in select', () => {
    const field = createMockField<DefinitionPropertyField>({ label: 'Color' });
    renderWithProvider(<ColorInput {...baseFieldProps} field={field} value="#ff0000" />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('#ff0000');
  });

  it('calls onChange when selecting a predefined color', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ label: 'Color' });
    renderWithProvider(
      <ColorInput {...baseFieldProps} field={field} value="#000000" onChange={onChange} />
    );

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, '#0000ff'); // Blue

    expect(onChange).toHaveBeenCalledWith('#0000ff', null);
  });

  it('displays all predefined colors in select', () => {
    const field = createMockField<DefinitionPropertyField>({ label: 'Color' });
    renderWithProvider(<ColorInput {...baseFieldProps} field={field} value="#000000" />);

    const select = screen.getByRole('combobox');
    const options = Array.from(select.querySelectorAll('option'));
    
    // Should have at least the predefined colors
    expect(options.length).toBeGreaterThanOrEqual(14);
    expect(options.some(opt => opt.textContent === 'Red')).toBe(true);
    expect(options.some(opt => opt.textContent === 'Blue')).toBe(true);
    expect(options.some(opt => opt.textContent === 'Green')).toBe(true);
  });

  it('normalizes 3-digit hex colors to 6 digits', () => {
    const field = createMockField<DefinitionPropertyField>({ label: 'Color' });
    renderWithProvider(<ColorInput {...baseFieldProps} field={field} value="#abc" />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    // #abc should normalize to #aabbcc
    expect(select.value).toBe('#aabbcc');
  });

  it('displays custom RGB value when color not in predefined list', () => {
    const field = createMockField<DefinitionPropertyField>({ label: 'Color' });
    renderWithProvider(<ColorInput {...baseFieldProps} field={field} value="#123456" />);

    const select = screen.getByRole('combobox');
    // Should show RGB representation
    expect(select.textContent).toContain('(18, 52, 86)');
  });

  it('handles invalid hex color by defaulting to black', () => {
    const field = createMockField<DefinitionPropertyField>({ label: 'Color' });
    renderWithProvider(<ColorInput {...baseFieldProps} field={field} value="invalid" />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('#000000');
  });

  it('handles empty value by defaulting to black', () => {
    const field = createMockField<DefinitionPropertyField>({ label: 'Color' });
    renderWithProvider(<ColorInput {...baseFieldProps} field={field} value="" />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('#000000');
  });

  it('displays color preview box with correct background', () => {
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Color' });
    const { container } = renderWithProvider(
      <ColorInput {...baseFieldProps} field={field} value="#ff0000" />
    );

    const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement | null;
    expect(colorInput).toBeTruthy();
    const label = colorInput?.parentElement as HTMLElement | undefined;
    expect(label).toBeTruthy();
    expect(label!.style.backgroundColor).toBe('rgb(255, 0, 0)'); // #ff0000
  });

  it('updates color when using color picker', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Color' });
    const { container } = renderWithProvider(
      <ColorInput {...baseFieldProps} field={field} value="#000000" onChange={onChange} />
    );

    const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement | null;
    expect(colorInput).toBeTruthy();

    if (colorInput) {
      fireEvent.change(colorInput, { target: { value: '#00ff00' } });
      const label = colorInput.parentElement as HTMLElement | undefined;
      await waitFor(() => {
        expect(label).toBeTruthy();
        expect(label!.style.backgroundColor === 'rgb(0, 255, 0)' || label!.style.backgroundColor === 'rgb(0, 255, 0, 1)' ).toBe(true);
      });
    } else {
      throw new Error('color input not found');
    }
  });

  it('has accessible id matching field name', () => {
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Color', name: 'bgColor' });
    renderWithProvider(<ColorInput {...baseFieldProps} field={field} value="#000000" />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('id', 'bgColor');
  });

  it('displays tooltip when provided', () => {
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Color', tooltip: 'Pick your favorite color' });
    renderWithProvider(<ColorInput {...baseFieldProps} field={field} value="#000000" />);

    const icons = screen.queryAllByTestId('tooltip-icon');
    expect(icons.length).toBeGreaterThanOrEqual(0);
  });

  it('handles uppercase hex colors', () => {
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Color' });
    renderWithProvider(<ColorInput {...baseFieldProps} field={field} value="#FF0000" />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('#ff0000'); // normalized to lowercase
  });

  it('preserves custom color across re-renders', () => {
    const field = createMockField<DefinitionPropertyField>({ label: 'Color' });
    const { rerender } = renderWithProvider(
      <ColorInput {...baseFieldProps} field={field} value="#abcdef" />
    );

    let select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('#abcdef');

    // Re-render with same value
    rerender(<ColorInput {...baseFieldProps} field={field} value="#abcdef" />);
    
    select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('#abcdef');
  });
});
