/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useRef, useEffect, useCallback } from "react";
import "../../core/EditableGrid.css"; // optional styling
import type { BaseInputProps, DefinitionPropertyField } from "../../core/reactaFormTypes";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES } from "../../utils/cssClasses";
import { ErrorDiv } from "../../components/LayoutComponents";

export type EditableGridField = DefinitionPropertyField & {
  integer?: boolean; // whether cells must be integers
  numColumns: number;
  columns: string[];
  minRows?: number;
  maxRows?: number;
};

export type EditableGridProps = BaseInputProps<string | string[][], EditableGridField>;

function EditableGrid({ field, value, onChange, onError}: EditableGridProps) {
  const { t } = useReactaFormContext();
  const {numColumns, columns} = field;
  const columnNames = columns ?? Array.from({ length: numColumns }, (_, i) => `Col ${i + 1}`);

  const [rows, setRows] = useState<{ id: number; values: string[] }[]>(() => [{ id: Date.now(), values: Array(columnNames.length).fill("") }]);
  const [error, setError] = useState<string | null>(null);
  const [focusedRowId, setFocusedRowId] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const makeRow = useCallback(() => ({ id: Date.now() + Math.floor(Math.random()*1000), values: Array(columnNames.length).fill("") }), [columnNames.length]);

  // Add a new row at the end
  const addRow = useCallback(() => setRows(prev => [...prev, makeRow()]), [makeRow]);

  // Insert a new row before a given id
  const insertRowBefore = useCallback((id: number) => {
    setRows(prev => {
      const idx = prev.findIndex(r => r.id === id);
      if (idx === -1) return prev;
      return [...prev.slice(0, idx), makeRow(), ...prev.slice(idx)];
    });
  }, [makeRow]);

  // Insert a new row after a given id
  const insertRowAfter = useCallback((id: number) => {
    setRows(prev => {
      const idx = prev.findIndex(r => r.id === id);
      if (idx === -1) return prev;
      return [...prev.slice(0, idx + 1), makeRow(), ...prev.slice(idx + 1)];
    });
  }, [makeRow]);

  // Delete a row
  const deleteRow = useCallback((id: number) => setRows(prev => prev.filter(row => row.id !== id)), []);

  // Update cell value
  const updateCell = useCallback((rowId: number, colIndex: number, newValue: string) => {
    setRows(prev => prev.map(row =>
      row.id === rowId
        ? { ...row, values: row.values.map((v, i) => (i === colIndex ? newValue : v)) }
        : row
    ));
  }, []);

  // parse serialized value into rows
  const parseSerialized = (text: string | string[][] | undefined): string[][] => {
    if (!text) return [];
    if (Array.isArray(text)) return text;
    const trimmed = String(text).trim();
    if (trimmed === "") return [];
    return trimmed.split(";").map(r => r.split(",").map(c => c.trim()));
  };

  const serializeRows = (rowsArr: string[][]) => rowsArr.map(r => r.join(",")).join(";");

  const integerRegex = /^-?\d+$/;

  const prevErrorRef = useRef<string | null>(null);
  const onErrorRef = useRef<EditableGridProps["onError"] | undefined>(onError);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  function validateCb(rowsArr: string[][]): string | null {
    if (field.required && (!rowsArr || rowsArr.length === 0 || rowsArr.every(r => r.every(c => c === "")))) {
      return t("Value required");
    }

    if ((field as any).minRows !== undefined && rowsArr.length < (field as any).minRows) {
      return t("Minimum number of rows: {{1}}", (field as any).minRows);
    }
    if ((field as any).maxRows !== undefined && rowsArr.length > (field as any).maxRows) {
      return t("Maximum number of rows: {{1}}", (field as any).maxRows);
    }

    if ((field as any).integer) {
      for (const r of rowsArr) {
        for (const c of r) {
          if (c !== "" && !integerRegex.test(c)) return t("Must be a valid integer");
        }
      }
    }

    return null;
  }

  // sync external value -> internal rows and validation
  useEffect(() => {
    const parsed = parseSerialized(value);
    const norm = parsed.length > 0 ? parsed : [Array(columnNames.length).fill("")];
    setRows(norm.map(r => ({ id: Date.now() + Math.random(), values: [...r, ...Array(Math.max(0, columnNames.length - r.length)).fill("")] })));
    const err = validateCb(norm);
    setError(err);
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, field.required]);

  // notify external on change when rows change
  useEffect(() => {
    const rowsArr = rows.map(r => r.values);
    const ser = serializeRows(rowsArr);
    const err = validateCb(rowsArr);
    setError(err);
    onChange?.(ser, err);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  return (
    <div className={`${CSS_CLASSES.field} editable-grid`}>
      {/* Header row: label on left, add button on right */}
      <div className="editable-grid-header">
        <div className="editable-grid-label">{t(field.displayName)}</div>
        <div className="editable-grid-header-actions">
          <button
            className="insert-btn"
            disabled={focusedRowId === null}
            onClick={() => { if (focusedRowId !== null) insertRowBefore(focusedRowId); }}
          >Insert Before</button>
          <button
            className="insert-btn"
            disabled={focusedRowId === null}
            onClick={() => { if (focusedRowId !== null) insertRowAfter(focusedRowId); }}
          >Insert After</button>
          <button className="add-btn" onClick={addRow}>+ Add Row</button>
        </div>
      </div>

      {/* Table occupies full width below header */}
      <div className="editable-grid-table">
        <table>
          <thead>
            <tr>
              {columnNames.map((col) => (
                <th key={col}>{col}</th>
              ))}
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {row.values.map((value, colIndex) => (
                  <td key={`${row.id}-${colIndex}`}>
                    <input
                      type="text"
                      value={value}
                      onFocus={() => setFocusedRowId(row.id)}
                      onBlur={() => {
                        // Defer clearing focusedRowId so that focus transitions within the grid
                        setTimeout(() => {
                          if (!gridRef.current) return;
                          const active = document.activeElement as HTMLElement | null;
                          if (!active || !gridRef.current.contains(active)) {
                            setFocusedRowId(null);
                          }
                        }, 0);
                      }}
                      onChange={(e) => updateCell(row.id, colIndex, e.target.value)}
                      placeholder={`Enter ${columnNames[colIndex]}`}
                    />
                  </td>
                ))}
                <td className="action-cell">
                  <div className="action-buttons">
                    <button className="delete-btn" onClick={() => deleteRow(row.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <ErrorDiv>{error}</ErrorDiv>}
    </div>
  );
}

export default EditableGrid;

