import React, { useState, useEffect, useRef } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { BaseInputProps, DefinitionPropertyField } from "../../core/reactaFormTypes";
import { validateFieldValue } from "../../core/validation";
import useReactaFormContext from "../../hooks/useReactaFormContext";

export type FileInputProps = BaseInputProps<File | File[] | null, DefinitionPropertyField>;

const FileInput: React.FC<FileInputProps> = ({ field, value, onChange, onError }) => {
  const { t, definitionName } = useReactaFormContext();
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const onErrorRef = useRef<FileInputProps["onError"] | undefined>(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const validate = React.useCallback(
    (input: File | File[] | null): string | null => {
      if (
        field.required &&
        (!input || (Array.isArray(input) && input.length === 0))
      ) {
        return t("Value required");
      }

      const err = validateFieldValue(definitionName, field, input, t);
      return err ?? null;
    },
    [field, definitionName, t]
  );

  const error = React.useMemo(() => validate(value), [value, validate]);

  useEffect(() => {
    const err = validate(value);
    // Call onChange for initial validation so consumers/tests receive the
    // current validation state on mount. This mirrors previous behavior and
    // keeps test expectations stable.
    onChange?.(value, err);
    onErrorRef.current?.(err ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, validate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.files;
    let selected: File | File[] | null = null;

    if (input && input.length > 0) {
      const newFiles = Array.from(input);
      if (field.multiple) {
        // Merge with existing files when multiple is true
        const existingFiles = Array.isArray(value) ? value : [];
        selected = [...existingFiles, ...newFiles];
      } else {
        selected = newFiles[0];
      }
    }
    const err = validate(selected);
    onChange?.(selected, err);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const newFiles = Array.from(droppedFiles);
      let selected: File | File[] | null = null;
      
      if (field.multiple) {
        // Merge with existing files when multiple is true
        const existingFiles = Array.isArray(value) ? value : [];
        selected = [...existingFiles, ...newFiles];
      } else {
        selected = newFiles[0];
      }
      
      const err = validate(selected);
      onChange?.(selected, err);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleRemoveFile = (index?: number) => {
    if (Array.isArray(value) && typeof index === 'number') {
      const newFiles = value.filter((_, i) => i !== index);
      const selected = newFiles.length > 0 ? newFiles : null;
      const err = validate(selected);
      onChange?.(selected, err);
    } else {
      const err = validate(null);
      onChange?.(null, err);
    }
  };

  const renderFileList = () => {
    const files = Array.isArray(value) ? value : value ? [value] : [];
    
    if (files.length === 0) return null;

    return (
      <div style={{
        marginTop: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              backgroundColor: 'var(--reactaform-input-bg, #fff)',
              border: '1px solid var(--reactaform-border-color, #d1d5db)',
              borderRadius: '4px',
              fontSize: '0.875rem',
              gap: '8px'
            }}
          >
            <div style={{ 
              flex: 1, 
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {file.name}
            </div>
            <button
              type="button"
              onClick={() => handleRemoveFile(Array.isArray(value) ? index : undefined)}
              aria-label={t("Remove file")}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--reactaform-color-error, #ef4444)',
                cursor: 'pointer',
                padding: '2px 6px',
                fontSize: '1.125rem',
                lineHeight: 1,
                borderRadius: '4px',
                transition: 'background-color 0.2s',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--reactaform-bg-hover, #fee)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <StandardFieldLayout field={field} error={error}>
      <div style={{ width: '100%' }}>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            position: 'relative',
            border: `1px dashed ${
              isDragging 
                ? 'var(--reactaform-color-primary, #2563eb)' 
                : error 
                  ? 'var(--reactaform-color-error, #ef4444)'
                  : 'var(--reactaform-border-color, #d1d5db)'
            }`,
            borderRadius: 'var(--reactaform-border-radius, 4px)',
            padding: '8px 12px',
            textAlign: 'center',
            backgroundColor: isDragging 
              ? 'var(--reactaform-bg-hover, #f0f9ff)' 
              : 'var(--reactaform-input-bg, #fff)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            minHeight: 'var(--reactaform-input-height, 34px)',
            width: '100%',
            maxWidth: '100%',
            alignSelf: 'stretch',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ' ) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          role="button"
          aria-label={field.multiple ? t("Choose Files or Drag & Drop") : t("Choose File or Drag & Drop")}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.name}-error` : undefined}
        >
          <input
            id={field.name}
            ref={inputRef}
            type="file"
            accept={field.accept}
            multiple={field.multiple}
            style={{
              display: 'none'
            }}
            onChange={handleChange}
          />
          
          <div style={{ 
            fontSize: '1.25rem',
            opacity: 0.6,
            lineHeight: 1,
            flexShrink: 0
          }}>
            📁
          </div>
          
          <div style={{ 
            fontSize: '0.875rem',
            fontWeight: 400,
            color: 'var(--reactaform-text-color, #111827)',
            flex: 1,
            textAlign: 'left'
          }}>
            {isDragging 
              ? t("Drop files here") 
              : field.multiple 
                ? t("Choose Files or Drag & Drop") 
                : t("Choose File or Drag & Drop")
            }
          </div>
          
          {field.accept && (
            <div style={{ 
              fontSize: '0.75rem',
              color: 'var(--reactaform-text-muted, #6b7280)',
              whiteSpace: 'nowrap',
              opacity: isDragging ? 0 : 1,
              transition: 'opacity 0.15s ease',
              pointerEvents: isDragging ? 'none' : 'auto'
            }}>
              {field.accept}
            </div>
          )}
        </div>
        
        {renderFileList()}
      </div>
    </StandardFieldLayout>
  );
};

export default FileInput;
