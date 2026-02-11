import { describe, it, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProvider, createMockField, baseFieldProps, waitForUpdate } from '../../test-utils';
import EmailInput from '../../../src/components/fields/advanced/EmailInput';
import type { DefinitionPropertyField } from '../../../src/core/reactaFormTypes';

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
    const onError = vi.fn();
    const field = createMockField<DefinitionPropertyField>(
      { name: 'email', type: 'email' }
    );
    const { getByRole } = renderWithProvider(
      <EmailInput {...baseFieldProps} field={field} value="" onChange={onChange} onError={onError} />
    );

    const input = getByRole('textbox');
    await user.type(input, 'invalid-email');
    await user.tab(); // trigger blur

    await waitForUpdate();
    expect(onChange).toHaveBeenCalled();
    // onError should be called with validation error
    expect(onError.mock.calls.some(c => c[0] !== null)).toBeTruthy();
  });

  it('accepts valid email addresses', async () => {
    const onChange = vi.fn();
    const onError = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ name: 'email', type: 'email' });
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
    const field = createMockField<DefinitionPropertyField>({ type: 'email', required: true });
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
    const onError = vi.fn();
    const field = createMockField<DefinitionPropertyField>({type: 'email'});
    const { getByLabelText } = renderWithProvider(
      <EmailInput field={field} value="" onChange={onChange} onError={onError} {...baseFieldProps} />
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
        expect(onError.mock.calls.some(c => typeof c[0] === 'string' && c[0].toLowerCase().includes('valid'))).toBeTruthy();
      }
      
      vi.clearAllMocks(); // Clear for next iteration
    }
  });

  it('handles tooltip display when tooltip is provided', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'email', tooltip: 'Enter a valid email address' });
    const { getByTestId } = renderWithProvider(
      <EmailInput {...baseFieldProps} field={field} value="" />
    );

    const tooltipIcon = getByTestId('tooltip-icon');
    expect(tooltipIcon).toBeInTheDocument();
  });
});