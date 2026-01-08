import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MultilineTextInput from '../../../src/components/fields/MultilineTextInput';
import { renderWithProvider, createMockField, baseFieldProps } from '../../test-utils';
import type { DefinitionPropertyField } from '../../../src/core/reactaFormTypes';

describe('MultilineTextInput', () => {
  it('renders textarea with label', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'multiline', label: 'Comments' });
    renderWithProvider(<MultilineTextInput {...baseFieldProps} field={field} value="" />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('Comments')).toBeInTheDocument();
  });

  it('displays initial value', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'multiline', label: 'Bio' });
    const value = 'This is a\nmultiline text';
    renderWithProvider(<MultilineTextInput {...baseFieldProps} field={field} value={value} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue(value);
  });

  it('calls onChange when user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'multiline', label: 'Description' });
    renderWithProvider(
      <MultilineTextInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'New text');

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[onChange.mock.calls.length - 1][0]).toBe('New text');
  });

  it('validates required field', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onError = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'multiline', label: 'Required Text', required: true });
    renderWithProvider(
      <MultilineTextInput {...baseFieldProps} field={field} value="" onChange={onChange} onError={onError} />
    );

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, ' ');
    await user.clear(textarea);

    expect(onError.mock.calls.some(c => c[0] !== null)).toBeTruthy(); // error present
  });

  it('validates minLength constraint', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onError = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'multiline', label: 'Text', minLength: 5 });
    renderWithProvider(
      <MultilineTextInput {...baseFieldProps} field={field} value="" onChange={onChange} onError={onError} />
    );

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'abc');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('abc');
    expect(onError.mock.calls.some(c => c[0] !== null)).toBeTruthy(); // error for minLength
  });

  it('validates maxLength constraint', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onError = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'multiline', label: 'Text', maxLength: 5 });
    renderWithProvider(
      <MultilineTextInput {...baseFieldProps} field={field} value="" onChange={onChange} onError={onError} />
    );

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'toolong');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('toolong');
    expect(onError.mock.calls.some(c => c[0] !== null)).toBeTruthy(); // error for maxLength
  });

  it('accepts valid text within length constraints', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'multiline', label: 'Text', minLength: 3, maxLength: 10 });
    renderWithProvider(
      <MultilineTextInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'valid');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('valid');

  });

  it('applies minHeight style', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'multiline', label: 'Tall Text', minHeight: '200px' });
    renderWithProvider(<MultilineTextInput {...baseFieldProps} field={field} value="" />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveStyle({ minHeight: '200px' });
  });

  it('applies default minHeight when not specified', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'multiline', label: 'Default Text' });
    renderWithProvider(<MultilineTextInput {...baseFieldProps} field={field} value="" />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveStyle({ minHeight: '80px' });
  });

  it('displays tooltip when provided', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'multiline', label: 'Text', tooltip: 'Enter your comments here' });
    renderWithProvider(<MultilineTextInput {...baseFieldProps} field={field} value="" />);

    expect(screen.getByTestId('tooltip-icon')).toBeInTheDocument();
  });

  it('handles multiline text correctly', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'multiline', label: 'Multiline' });
    renderWithProvider(
      <MultilineTextInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Line 1{Enter}Line 2{Enter}Line 3');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toContain('\n');
    expect(lastCall[0]).toBe('Line 1\nLine 2\nLine 3');
  });
});
