import { describe, it, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProvider, createMockField, baseFieldProps, waitForUpdate } from '../../test-utils';
import FloatInput from '../../../src/components/fields/FloatInput';
import type { DefinitionPropertyField } from '../../../src/core/reactaFormTypes';

describe('FloatInput', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with text input type', () => {
    const field = createMockField<DefinitionPropertyField>({ name: 'float', type: 'number' });
    const { getByRole } = renderWithProvider(
      <FloatInput {...baseFieldProps} field={field} value={0} />
    );

    const input = getByRole('textbox', { name: 'Test Field' });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('displays initial float value', () => {
    const field = createMockField<DefinitionPropertyField>();
    const { getByDisplayValue } = renderWithProvider(
      <FloatInput {...baseFieldProps} field={field} value={3.14159} />
    );

    expect(getByDisplayValue('3.14159')).toBeInTheDocument();
  });

  it('calls onChange with value when user types', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>();
    const { getByRole } = renderWithProvider(
      <FloatInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    const input = getByRole('textbox', { name: 'Test Field' });
    await user.clear(input);
    await user.type(input, '2.718');

    expect(onChange).toHaveBeenCalled();
  });

  it('validates minimum value', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ min: 10.5 });
    const { getByRole } = renderWithProvider(
      <FloatInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    const input = getByRole('textbox', { name: 'Test Field' });
    await user.clear(input);
    await user.type(input, '5.5');
    await user.tab();

    await waitForUpdate();
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.some(c => c[1] !== null)).toBeTruthy();
  });

  it('validates maximum value', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ max: 100.0 });
    const { getByRole } = renderWithProvider(
      <FloatInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    const input = getByRole('textbox', { name: 'Test Field' });
    await user.clear(input);
    await user.type(input, '150.5');
    await user.tab();

    await waitForUpdate();
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.some(c => c[1] !== null)).toBeTruthy();
  });

  it('shows error for required field when empty', async () => {
    const onError = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ required: true });
    const { getByRole } = renderWithProvider(
      <FloatInput {...baseFieldProps} field={field} value={''} onError={onError} />
    );

    const input = getByRole('textbox', { name: 'Test Field' });
    await user.click(input);
    await user.tab();

    await waitForUpdate();
    expect(onError).toHaveBeenCalled();
  });

  it('accepts scientific notation', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>();
    const { getByRole } = renderWithProvider(
      <FloatInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    const input = getByRole('textbox', { name: 'Test Field' });
    await user.clear(input);
    await user.type(input, '1.23e-4');

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.some(c => c[1] === null)).toBeTruthy();
  });

  it('rejects invalid float input', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>();
    const { getByRole } = renderWithProvider(
      <FloatInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    const input = getByRole('textbox', { name: 'Test Field' });
    await user.clear(input);
    await user.type(input, 'abc');
    await user.tab();

    await waitForUpdate();
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.some(c => c[1] !== null)).toBeTruthy();
  });

  it('handles negative numbers', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ min: -100, max: 100 });
    const { getByRole } = renderWithProvider(
      <FloatInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    const input = getByRole('textbox', { name: 'Test Field' });
    await user.clear(input);
    await user.type(input, '-3.14');

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.some(c => c[0] === '-3.14')).toBeTruthy();
  });

  it('handles tooltip display', () => {
    const field = createMockField<DefinitionPropertyField>({ tooltip: 'Enter a decimal number' });
    const { getByTestId } = renderWithProvider(
      <FloatInput {...baseFieldProps} field={field} value={0} />
    );

    expect(getByTestId('tooltip-icon')).toBeInTheDocument();
  });
});
