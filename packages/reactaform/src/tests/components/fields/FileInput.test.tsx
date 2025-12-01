import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import FileInput from '../../../package/components/fields/FileInput';
import type { DefinitionPropertyField } from '../../../package/core/reactaFormTypes';
import { renderWithProvider, createMockField, baseFieldProps } from '../../test-utils';

describe('FileInput', () => {
  it('renders file input button with label', () => {
    const field = createMockField<DefinitionPropertyField>({ label: 'Upload', accept: '*' });
    renderWithProvider(<FileInput {...baseFieldProps} field={field} value={null} />);

    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('Choose File...')).toBeInTheDocument();
  });

  it('renders choose files button for multiple files', () => {
    const field = createMockField<DefinitionPropertyField>({ label: 'Upload', accept: '*', multiple: true });
    renderWithProvider(<FileInput {...baseFieldProps} field={field} value={null} />);

    expect(screen.getByText('Choose Files...')).toBeInTheDocument();
  });

  it('renders dropdown menu button', () => {
    const field = createMockField<DefinitionPropertyField>({ label: 'Upload', accept: '*' });
    renderWithProvider(<FileInput {...baseFieldProps} field={field} value={null} />);

    const menuButton = screen.getByLabelText('Show selected files');
    expect(menuButton).toBeInTheDocument();
  });

  it('displays initial value on mount', () => {
    const onChange = vi.fn();
    const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    const field = createMockField<DefinitionPropertyField>({ label: 'Upload', accept: '*' });
    renderWithProvider(
      <FileInput {...baseFieldProps} field={field} value={mockFile} onChange={onChange} />
    );

    // Component should call onChange on mount for validation
    expect(onChange).toHaveBeenCalled();
  });

  it('calls onChange when file is selected', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Upload', accept: '*' });
    const { container } = renderWithProvider(
      <FileInput {...baseFieldProps} field={field} value={null} onChange={onChange} />
    );

    onChange.mockClear();
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });

    Object.defineProperty(fileInput, 'files', { value: [mockFile] });
    fireEvent.change(fileInput);

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBeInstanceOf(File);
  });

  it('calls onChange with array for multiple files', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Upload', accept: '*', multiple: true });
    const { container } = renderWithProvider(
      <FileInput {...baseFieldProps} field={field} value={null} onChange={onChange} />
    );

    onChange.mockClear();
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFiles = [
      new File(['content1'], 'test1.txt', { type: 'text/plain' }),
      new File(['content2'], 'test2.txt', { type: 'text/plain' })
    ];

    Object.defineProperty(fileInput, 'files', { value: mockFiles });
    fireEvent.change(fileInput);

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(Array.isArray(lastCall[0])).toBe(true);
  });

  it('validates required field', () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Required Upload', accept: '*', required: true });
    renderWithProvider(
      <FileInput {...baseFieldProps} field={field} value={null} onChange={onChange} />
    );

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for required
  });

  it('accepts valid file for required field', async () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Required Upload', accept: '*', required: true });
    const { container } = renderWithProvider(
      <FileInput {...baseFieldProps} field={field} value={null} onChange={onChange} />
    );

    onChange.mockClear();
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });

    Object.defineProperty(fileInput, 'files', { value: [mockFile] });
    fireEvent.change(fileInput);

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeNull(); // no error
  });

  it('sets accept attribute', () => {
    const field = createMockField<DefinitionPropertyField>({ label: 'Upload', accept: 'image/*,.pdf' });
    const { container } = renderWithProvider(
      <FileInput {...baseFieldProps} field={field} value={null} />
    );

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toHaveAttribute('accept', 'image/*,.pdf');
  });

  it('sets multiple attribute when multiple is true', () => {
    const field = createMockField<DefinitionPropertyField>({ label: 'Upload', accept: '*', multiple: true });
    const { container } = renderWithProvider(
      <FileInput {...baseFieldProps} field={field} value={null} />
    );

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toHaveAttribute('multiple');
  });

  it('displays tooltip icon when provided', () => {
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Upload', accept: '*', tooltip: 'Select a file to upload' });
    renderWithProvider(<FileInput {...baseFieldProps} field={field} value={null} />);

    const icons = screen.getAllByTestId('tooltip-icon');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('has accessible id matching field name', () => {
    const field = createMockField<DefinitionPropertyField>({ displayName: 'Upload', name: 'fileUpload', accept: '*' });
    const { container } = renderWithProvider(
      <FileInput {...baseFieldProps} field={field} value={null} />
    );

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toHaveAttribute('id', 'fileUpload');
  });
});
