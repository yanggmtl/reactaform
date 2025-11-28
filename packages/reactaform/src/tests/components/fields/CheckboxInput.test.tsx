import { describe, it, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProvider, createMockField, baseFieldProps, waitForUpdate } from '../../test-utils';
import CheckboxInput, { type CheckboxField } from '../../../package/components/fields/CheckboxInput';

describe('CheckboxInput', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with checkbox type', () => {
    const field = createMockField<CheckboxField>({ name: 'checkbox', type: 'boolean' });
    const { getByRole } = renderWithProvider(
      <CheckboxInput field={field} value={false} {...baseFieldProps} />
    );

    const checkbox = getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute('type', 'checkbox');
  });

  it('shows checked state correctly', () => {
    const field = createMockField<CheckboxField>();
    const { getByRole } = renderWithProvider(
      <CheckboxInput field={field} value={true} {...baseFieldProps} />
    );

    expect(getByRole('checkbox')).toBeChecked();
  });

  it('shows unchecked state correctly', () => {
    const field = createMockField<CheckboxField>();
    const { getByRole } = renderWithProvider(
      <CheckboxInput field={field} value={false} {...baseFieldProps} />
    );

    expect(getByRole('checkbox')).not.toBeChecked();
  });

  it('calls onChange when clicked', async () => {
    const onChange = vi.fn();
    const field = createMockField<CheckboxField>();
    const { getByRole } = renderWithProvider(
      <CheckboxInput field={field} value={false} onChange={onChange} {...baseFieldProps} />
    );

    const checkbox = getByRole('checkbox');
    await user.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(true, null);
  });

  it('toggles from checked to unchecked', async () => {
    const onChange = vi.fn();
    const field = createMockField<CheckboxField>();
    const { getByRole } = renderWithProvider(
      <CheckboxInput {...baseFieldProps} field={field} value={true} onChange={onChange} />
    );

    const checkbox = getByRole('checkbox');
    await user.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(false, null);
  });

  it('shows error for required field when unchecked', async () => {
    const onError = vi.fn();
    const field = createMockField<CheckboxField>({ required: true });
    const { getByRole } = renderWithProvider(
      <CheckboxInput {...baseFieldProps} field={field} value={false} onError={onError} />
    );

    const checkbox = getByRole('checkbox');
    await user.click(checkbox);
    await user.click(checkbox); // uncheck it
    
    await waitForUpdate();
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('required'));
  });

  it('is disabled when disabled prop is true', () => {
    const field = createMockField<CheckboxField>();
    const { getByRole } = renderWithProvider(
      <CheckboxInput {...baseFieldProps} field={field} value={false} disabled={true} />
    );

    expect(getByRole('checkbox')).toBeDisabled();
  });

  it('has proper accessibility attributes', () => {
    const field = createMockField<CheckboxField>({ tooltip: 'This is a helpful checkbox' });
    const { getByRole } = renderWithProvider(
      <CheckboxInput field={field} value={false} {...baseFieldProps} />
    );

    const checkbox = getByRole('checkbox');
    expect(checkbox).toHaveAccessibleName();
  });

  it('handles keyboard interaction', async () => {
    const onChange = vi.fn();
    const field = createMockField<CheckboxField>();
    const { getByRole } = renderWithProvider(
      <CheckboxInput field={field} value={false} onChange={onChange} {...baseFieldProps} />
    );

    const checkbox = getByRole('checkbox');
    checkbox.focus();
    await user.keyboard('{Space}');

    expect(onChange).toHaveBeenCalledWith(true, null);
  });

  it('shows tooltip when configured', () => {
    const field = createMockField<CheckboxField>({ tooltip: 'This is a checkbox tooltip' });
    const { getByTestId } = renderWithProvider(
      <CheckboxInput field={field} value={false} {...baseFieldProps} />
    );

    expect(getByTestId('tooltip-icon')).toBeInTheDocument();
  });

  it('handles undefined/null values as false', () => {
    const field = createMockField<CheckboxField>();
    const { getByRole } = renderWithProvider(
      <CheckboxInput {...baseFieldProps} field={field} value={false} />
    );

    expect(getByRole('checkbox')).not.toBeChecked();
  });
});