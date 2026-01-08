import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UrlInput from '../../../src/components/fields/UrlInput';
import type { DefinitionPropertyField } from '../../../src/core/reactaFormTypes';
import { renderWithProvider, createMockField, baseFieldProps } from '../../test-utils';

describe('UrlInput', () => {
  it('renders input with label', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'url', label: 'Website URL' });
    renderWithProvider(<UrlInput {...baseFieldProps} field={field} value="" />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('Website URL')).toBeInTheDocument();
  });

  it('renders as url input type', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'url', label: 'URL' });
    renderWithProvider(<UrlInput {...baseFieldProps} field={field} value="" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'url');
  });

  it('displays placeholder', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'url', label: 'URL' });
    renderWithProvider(<UrlInput {...baseFieldProps} field={field} value="" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'https://example.com');
  });

  it('displays initial value', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'url', label: 'URL' });
    const value = 'https://example.com';
    renderWithProvider(<UrlInput {...baseFieldProps} field={field} value={value} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue(value);
  });

  it('calls onChange when user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'url', label: 'URL' });
    renderWithProvider(
      <UrlInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'https://test.com');

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('https://test.com');
  });

  it('validates required field', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onError = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'url', label: 'Required URL', required: true });
    renderWithProvider(
      <UrlInput {...baseFieldProps} field={field} value="" onChange={onChange} onError={onError} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, ' ');
    await user.clear(input);

    expect(onError.mock.calls.some(c => c[0] !== null)).toBeTruthy(); // error present
  });

  it('validates URL format', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onError = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'url', label: 'URL' });
    renderWithProvider(
      <UrlInput {...baseFieldProps} field={field} value="" onChange={onChange} onError={onError} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'not-a-url^');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('not-a-url^');
    expect(onError.mock.calls.some(c => c[0] !== null)).toBeTruthy(); // error for invalid URL
  });

  it('accepts valid HTTP URL', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'url', label: 'URL' });
    renderWithProvider(
      <UrlInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'http://example.com');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('http://example.com');
  });

  it('accepts valid HTTPS URL', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'url', label: 'URL' });
    renderWithProvider(
      <UrlInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'https://secure.example.com/path');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('https://secure.example.com/path');
  });

  it('accepts FTP URL', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ label: 'URL' });
    renderWithProvider(
      <UrlInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'ftp://files.example.com');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('ftp://files.example.com');
  });

  it('trims whitespace in validation', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ label: 'URL' });
    renderWithProvider(
      <UrlInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, ' https://example.com ');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('https://example.com'); // trimmed
  });

  it('displays tooltip icon when provided', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'url', label: 'URL', tooltip: 'Enter a valid website URL' });
    renderWithProvider(<UrlInput {...baseFieldProps} field={field} value="" />);

    expect(screen.getByTestId('tooltip-icon')).toBeInTheDocument();
  });

  it('handles empty value for optional field', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'url', label: 'Optional URL', required: false });
    renderWithProvider(
      <UrlInput {...baseFieldProps} field={field} value="" onChange={onChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'https://test.com');
    await user.clear(input);

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('');
  });
});
