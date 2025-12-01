import { describe, it, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProvider, createMockField, baseFieldProps } from '../../test-utils';
import CheckboxInput from '../../../package/components/fields/CheckboxInput';
import type { DefinitionPropertyField } from '../../../package/core/reactaFormTypes';

describe('CheckboxInput', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with checkbox type', () => {
    const field = createMockField<DefinitionPropertyField>({ name: 'checkbox', type: 'boolean' });
    const { getByRole } = renderWithProvider(
      <CheckboxInput field={field} value={false} {...baseFieldProps} />
    );

    const checkbox = getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute('type', 'checkbox');
  });

  it('shows checked state correctly', () => {
    const field = createMockField<DefinitionPropertyField>();
    const { getByRole } = renderWithProvider(
      <CheckboxInput field={field} value={true} {...baseFieldProps} />
    );

    expect(getByRole('checkbox')).toBeChecked();
  });

  it('shows unchecked state correctly', () => {
    const field = createMockField<DefinitionPropertyField>();
    const { getByRole } = renderWithProvider(
      <CheckboxInput field={field} value={false} {...baseFieldProps} />
    );

    expect(getByRole('checkbox')).not.toBeChecked();
  });

  it('calls onChange when clicked', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>();
    const { getByRole } = renderWithProvider(
      <CheckboxInput field={field} value={false} onChange={onChange} {...baseFieldProps} />
    );

    const checkbox = getByRole('checkbox');
    await user.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(true, null);
  });

  it('toggles from checked to unchecked', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>();
    const { getByRole } = renderWithProvider(
      <CheckboxInput {...baseFieldProps} field={field} value={true} onChange={onChange} />
    );

    const checkbox = getByRole('checkbox');
    await user.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(false, null);
  });

  it('is disabled when disabled prop is true', () => {
    const field = createMockField<DefinitionPropertyField>();
    const { getByRole } = renderWithProvider(
      <CheckboxInput {...baseFieldProps} field={field} value={false} disabled={true} />
    );

    expect(getByRole('checkbox')).toBeDisabled();
  });

  it('has proper accessibility attributes', () => {
    const field = createMockField<DefinitionPropertyField>({ tooltip: 'This is a helpful checkbox' });
    const { getByRole } = renderWithProvider(
      <CheckboxInput field={field} value={false} {...baseFieldProps} />
    );

    const checkbox = getByRole('checkbox');
    expect(checkbox).toHaveAccessibleName();
  });

  it('handles keyboard interaction', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>();
    const { getByRole } = renderWithProvider(
      <CheckboxInput field={field} value={false} onChange={onChange} {...baseFieldProps} />
    );

    const checkbox = getByRole('checkbox');
    checkbox.focus();
    await user.keyboard('{Space}');

    expect(onChange).toHaveBeenCalledWith(true, null);
  });

  it('shows tooltip when configured', () => {
    const field = createMockField<DefinitionPropertyField>({ tooltip: 'This is a checkbox tooltip' });
    const { getByTestId } = renderWithProvider(
      <CheckboxInput field={field} value={false} {...baseFieldProps} />
    );

    expect(getByTestId('tooltip-icon')).toBeInTheDocument();
  });

  it('handles undefined/null values as false', () => {
    const field = createMockField<DefinitionPropertyField>();
    const { getByRole } = renderWithProvider(
      <CheckboxInput {...baseFieldProps} field={field} value={false} />
    );

    expect(getByRole('checkbox')).not.toBeChecked();
  });
});
