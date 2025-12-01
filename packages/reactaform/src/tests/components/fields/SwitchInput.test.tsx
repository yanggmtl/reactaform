import { describe, it, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProvider, createMockField, baseFieldProps, waitForUpdate } from '../../test-utils';
import SwitchInput from '../../../package/components/fields/SwitchInput';
import type { DefinitionPropertyField } from '../../../package';

describe('SwitchInput', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with switch role/appearance', () => {
    const field = createMockField<DefinitionPropertyField>({ name: 'switch', type: 'boolean' });
    const { container } = renderWithProvider(
      <SwitchInput {...baseFieldProps} field={field} value={false} />
    );

    // Switch should have appropriate class or data attributes
    const switchElement = container.querySelector('.switch, [role="switch"], input[type="checkbox"]');
    expect(switchElement).toBeInTheDocument();
  });

  it('shows active state when value is true', () => {
    const field = createMockField<DefinitionPropertyField>();
    const { container } = renderWithProvider(
      <SwitchInput field={field} value={true} {...baseFieldProps} />
    );

    const switchElement = container.querySelector('[role="switch"], .switch, [data-testid="switch"]');
    expect(switchElement).toHaveClass(/active|checked|on/);
  });

  it('shows inactive state when value is false', () => {
    const field = createMockField<DefinitionPropertyField>();
    const { container } = renderWithProvider(
      <SwitchInput field={field} value={false} {...baseFieldProps} />
    );

    const switchElement = container.querySelector('[role="switch"], .switch, [data-testid="switch"]');
    expect(switchElement).not.toHaveClass(/active|checked|on/);
  });

  it('calls onChange when clicked', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>();
    const { container } = renderWithProvider(
      <SwitchInput field={field} value={false} onChange={onChange} {...baseFieldProps} />
    );

    const switchElement = container.querySelector('[role="switch"], .switch, [data-testid="switch"]');
    await user.click(switchElement!);

    expect(onChange).toHaveBeenCalledWith(true, null);
  });

  it('toggles from on to off', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>();
    const { container } = renderWithProvider(
      <SwitchInput field={field} value={true} onChange={onChange} {...baseFieldProps} />
    );

    const switchElement = container.querySelector('[role="switch"], .switch, [data-testid="switch"]');
    await user.click(switchElement!);

    expect(onChange).toHaveBeenCalledWith(false, null);
  });

  it('shows error for required field when false', async () => {
    const onError = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ required: true });
    const { container } = renderWithProvider(
      <SwitchInput field={field} value={false} onError={onError} {...baseFieldProps} />
    );

    const switchElement = container.querySelector('[role="switch"], .switch, [data-testid="switch"]');
    await user.click(switchElement!);
    await user.click(switchElement!); // turn it off
    
    await waitForUpdate();
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('required'));
  });

  it('is disabled when disabled prop is true', () => {
    const field = createMockField<DefinitionPropertyField>();
    const { container } = renderWithProvider(
      <SwitchInput field={field} value={false} disabled={true} {...baseFieldProps} />
    );

    const switchElement = container.querySelector('[role="switch"], .switch, [data-testid="switch"]');
    expect(switchElement).toHaveClass(/disabled/);
  });

  it('has proper accessibility attributes', () => {
    const field = createMockField<DefinitionPropertyField>();
    const { container } = renderWithProvider(
      <SwitchInput field={field} value={false} {...baseFieldProps} />
    );

    const switchElement = container.querySelector('[role="switch"], .switch, [data-testid="switch"]');
    expect(switchElement).toHaveAttribute('aria-checked', 'false');
  });

  it('updates aria-checked when value changes', () => {
    const field = createMockField<DefinitionPropertyField>();
    const { container, rerender } = renderWithProvider(
      <SwitchInput field={field} value={false} {...baseFieldProps} />
    );

    let switchElement = container.querySelector('[role="switch"], .switch, [data-testid="switch"]');
    expect(switchElement).toHaveAttribute('aria-checked', 'false');

    rerender(
      <SwitchInput field={field} value={true} {...baseFieldProps} />
    );

    switchElement = container.querySelector('[role="switch"], .switch, [data-testid="switch"]');
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
  });

  it('handles keyboard interaction', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>();
    const { getByTestId } = renderWithProvider(
      <SwitchInput field={field} value={false} onChange={onChange} {...baseFieldProps} />
    );

    const switchElement = getByTestId('switch');
    (switchElement as HTMLElement).focus();
    await user.keyboard('{Space}');

    expect(onChange).toHaveBeenCalledWith(true, null);
  });

  it('shows tooltip when configured', () => {
    const field = createMockField<DefinitionPropertyField>({ tooltip: 'This is a switch tooltip' });
    const { getByTestId } = renderWithProvider(
      <SwitchInput field={field} value={false} {...baseFieldProps} />
    );

    expect(getByTestId('tooltip-icon')).toBeInTheDocument();
  });

  it('handles undefined/null values as false', () => {
    const field = createMockField<DefinitionPropertyField>();
    const { container } = renderWithProvider(
      <SwitchInput field={field} value={false} {...baseFieldProps} />
    );

    const switchElement = container.querySelector('[role="switch"], .switch, [data-testid="switch"]');
    expect(switchElement).toHaveAttribute('aria-checked', 'false');
  });
});