import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditableGrid, { type EditableGridField } from '../../../package/components/fields/EditableGrid';
import { renderWithProvider, createMockField, baseFieldProps } from '../../test-utils';

describe('EditableGrid', () => {
  it('renders table with column headers', () => {
    const field = createMockField<EditableGridField>({ displayName: 'Data Grid', numColumns: 3, columns: ['Name', 'Age', 'City'] });
    renderWithProvider(<EditableGrid {...baseFieldProps} field={field} value={[]} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
  });

  it('renders default UI when columns not provided', () => {
    const field = createMockField<EditableGridField>({ displayName: 'Grid', numColumns: 2, columns: [] });
    const { container } = renderWithProvider(<EditableGrid {...baseFieldProps} field={field} value={[]} />);

    // Component should still render header actions and Add Row button
    expect(screen.getByText('+ Add Row')).toBeInTheDocument();
    const actionHeader = container.querySelector('.editable-grid-table thead th');
    expect(actionHeader).toBeInTheDocument();
  });

  it('renders initial row data', () => {
    const field = createMockField<EditableGridField>({ 
      displayName: 'Grid', 
      numColumns: 2, 
      columns: ['First', 'Second'] 
    });
    renderWithProvider(<EditableGrid {...baseFieldProps} field={field} value={[['A', 'B']]} />);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveValue('A');
    expect(inputs[1]).toHaveValue('B');
  });

  it('renders add row button', () => {
    const field = createMockField<EditableGridField>({ displayName: 'Grid', numColumns: 2, columns: ['A', 'B'] });
    renderWithProvider(<EditableGrid {...baseFieldProps} field={field} value={[]} />);

    expect(screen.getByText('+ Add Row')).toBeInTheDocument();
  });

  it('renders insert before and after buttons', () => {
    const field = createMockField<EditableGridField>({ displayName: 'Grid', numColumns: 2, columns: ['A', 'B'] });
    renderWithProvider(<EditableGrid {...baseFieldProps} field={field} value={[]} />);

    expect(screen.getByText('Insert Before')).toBeInTheDocument();
    expect(screen.getByText('Insert After')).toBeInTheDocument();
  });

  it('insert buttons are disabled when no row is focused', () => {
    const field = createMockField<EditableGridField>({ displayName: 'Grid', numColumns: 2, columns: ['A', 'B'] });
    renderWithProvider(<EditableGrid {...baseFieldProps} field={field} value={[]} />);

    const insertBefore = screen.getByText('Insert Before');
    const insertAfter = screen.getByText('Insert After');
    
    expect(insertBefore).toBeDisabled();
    expect(insertAfter).toBeDisabled();
  });

  it('adds new row when add button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<EditableGridField>({ displayName: 'Grid', numColumns: 2, columns: ['A', 'B'] });
    renderWithProvider(
      <EditableGrid {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    const addButton = screen.getByText('+ Add Row');
    await user.click(addButton);

    expect(onChange).toHaveBeenCalled();
  });

  it('renders delete button for each row', () => {
    const field = createMockField<EditableGridField>({ displayName: 'Grid', numColumns: 2, columns: ['A', 'B'] });
    renderWithProvider(<EditableGrid {...baseFieldProps} field={field} value={[['X', 'Y']]} />);

    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('deletes row when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<EditableGridField>({ displayName: 'Grid', numColumns: 2, columns: ['A', 'B'] });
    renderWithProvider(
      <EditableGrid {...baseFieldProps} field={field} value={[['X', 'Y']]} onChange={onChange} />
    );

    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);

    expect(onChange).toHaveBeenCalled();
  });

  it('calls onChange when cell value is edited', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<EditableGridField>({ displayName: 'Grid', numColumns: 2, columns: ['A', 'B'] });
    renderWithProvider(
      <EditableGrid {...baseFieldProps} field={field} value={[['', '']]} onChange={onChange} />
    );

    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'Hello');

    expect(onChange).toHaveBeenCalled();
  });

  it('validates required field with empty grid', () => {
    const onChange = vi.fn();
    const field = createMockField<EditableGridField>({ displayName: 'Required Grid', numColumns: 2, columns: ['A', 'B'], required: true });
    renderWithProvider(
      <EditableGrid {...baseFieldProps} field={field} value={[]} onChange={onChange} />
    );

    // Should validate on mount and report error
    expect(onChange).toHaveBeenCalled();
  });

  it('validates minRows constraint', async () => {
    const onChange = vi.fn();
    const field = createMockField<EditableGridField>({ displayName: 'Grid', numColumns: 2, columns: ['A', 'B'], minRows: 2 });
    renderWithProvider(
      <EditableGrid {...baseFieldProps} field={field} value={[['', '']]} onChange={onChange} />
    );

    // One row when minRows is 2 should error
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for minRows
  });

  it('validates maxRows constraint', async () => {
    const onChange = vi.fn();
    const field = createMockField<EditableGridField>({ displayName: 'Grid', numColumns: 2, columns: ['A', 'B'], maxRows: 2 });
    renderWithProvider(
      <EditableGrid {...baseFieldProps} field={field} value={[['', ''], ['', ''], ['', '']]} onChange={onChange} />
    );

    // Three rows when maxRows is 2 should error
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for maxRows
  });

  it('validates integer constraint when enabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<EditableGridField>({ displayName: 'Grid', numColumns: 2, columns: ['A', 'B'], integer: true });
    renderWithProvider(
      <EditableGrid {...baseFieldProps} field={field} value={[['5', '10']]} onChange={onChange} />
    );

    onChange.mockClear();
    const inputs = screen.getAllByRole('textbox');
    await user.clear(inputs[0]);
    await user.type(inputs[0], '12.5');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeTruthy(); // error for non-integer
  });

  it('accepts integer values when integer constraint enabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<EditableGridField>({ displayName: 'Grid', numColumns: 2, columns: ['A', 'B'], integer: true });
    renderWithProvider(
      <EditableGrid {...baseFieldProps} field={field} value={[['', '']]} onChange={onChange} />
    );

    onChange.mockClear();
    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], '42');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[1]).toBeNull(); // no error for valid integer
  });

  it('displays error message when validation fails', () => {
    const field = createMockField<EditableGridField>({ displayName: 'Required Grid', numColumns: 2, columns: ['A', 'B'], required: true });
    renderWithProvider(
      <EditableGrid {...baseFieldProps} field={field} value={[]} />
    );

    expect(screen.getByText('Value required')).toBeInTheDocument();
  });
});
