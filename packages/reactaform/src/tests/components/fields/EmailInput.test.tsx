import { describe, it, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProvider, createMockField, baseFieldProps, waitForUpdate } from '../../test-utils';
import EmailInput from '../../../package/components/fields/EmailInput';
import type { DefinitionPropertyField } from '../../../package';

describe('EmailInput', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with email input type', () => {
    const field = createMockField<DefinitionPropertyField>({ name: 'email', type: 'email' });
    const { getByRole } = renderWithProvider(
      <EmailInput {...baseFieldProps} field={field} value="" />
    );

    const input = getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'email');
  });

  it('validates email format on blur', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>();
    const { getByRole } = renderWithProvider(
      <EmailInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const input = getByRole('textbox');
    await user.type(input, 'invalid-email');
    await user.tab(); // trigger blur

    await waitForUpdate();
    expect(onChange).toHaveBeenCalled();
    // the second arg should contain the validation error
    expect(onChange.mock.calls.some(c => c[1] !== null)).toBeTruthy();
  });

  it('accepts valid email addresses', async () => {
    const onChange = vi.fn();
    const onError = vi.fn();
    const field = createMockField<DefinitionPropertyField>();
    const { getByRole } = renderWithProvider(
      <EmailInput {...baseFieldProps} field={field} value="" onChange={onChange} onError={onError} />
    );

    const input = getByRole('textbox');
    await user.type(input, 'test@example.com');
    await user.tab(); // trigger blur

    await waitForUpdate();
    expect(onChange).toHaveBeenCalled();
  });

  it('shows error for required field when empty', async () => {
    const onError = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ required: true });
    const { getByRole } = renderWithProvider(
      <EmailInput {...baseFieldProps} field={field} value="" onError={onError} />
    );

    const input = getByRole('textbox');
    await user.click(input);
    await user.tab(); // trigger blur

    await waitForUpdate();
    expect(onError).toHaveBeenCalled();
  });

  it('handles edge case email formats', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>();
    const { getByLabelText } = renderWithProvider(
      <EmailInput field={field} value="" onChange={onChange} {...baseFieldProps} />
    );

    const input = getByLabelText('Test Field');

    // Test various edge cases
    const testCases = [
      { email: 'user@domain', expectError: true },
      { email: 'user@domain.', expectError: true },
      { email: 'user@', expectError: true },
      { email: '@domain.com', expectError: true },
      { email: 'user+tag@domain.com', expectError: false },
      { email: 'user.name@domain.com', expectError: false }
    ];

    for (const testCase of testCases) {
      await user.clear(input);
      await user.type(input, testCase.email);
      await user.tab();
      
      await waitForUpdate();
      
      if (testCase.expectError) {
        expect(onChange.mock.calls.some(c => typeof c[1] === 'string' && c[1].toLowerCase().includes('valid'))).toBeTruthy();
      }
      
      vi.clearAllMocks(); // Clear for next iteration
    }
  });

  it('is disabled when field.disabled is true', () => {
    const field = createMockField<DefinitionPropertyField>({ disabled: true });
    const { getByRole } = renderWithProvider(
      <EmailInput {...baseFieldProps} field={field} value="" />
    );

    expect(getByRole('textbox')).toBeDisabled();
  });

  it('handles tooltip display when tooltip is provided', () => {
    const field = createMockField<DefinitionPropertyField>({ tooltip: 'Enter a valid email address' });
    const { getByTestId } = renderWithProvider(
      <EmailInput {...baseFieldProps} field={field} value="" />
    );

    const tooltipIcon = getByTestId('tooltip-icon');
    expect(tooltipIcon).toBeInTheDocument();
  });
});