import * as React from "react";
import { StandardFieldLayout } from "../layout/LayoutComponents";
import type { BaseInputProps, DefinitionPropertyField } from "../../core/reactaFormTypes";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { useFieldValidator } from "../../hooks/useFieldValidator";
import { isDarkTheme } from "../../styles/themeUtils";

export type FileInputProps = BaseInputProps<File | File[] | null, DefinitionPropertyField>;

const FileInput: React.FC<FileInputProps> = ({ field, value, onChange, onError, error: externalError }) => {
  const { t, theme } = useReactaFormContext();
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const onErrorRef = React.useRef<FileInputProps["onError"] | undefined>(onError);
  const prevErrorRef = React.useRef<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const isDarkMode = isDarkTheme(theme);

  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const isDuplicateFile = (file: File, fileList: File[]) => {
    return fileList.some(
      (existing) =>
        existing.name === file.name &&
        existing.size === file.size &&
        existing.lastModified === file.lastModified
    );
  };

  const validate = useFieldValidator(field, externalError);

  React.useEffect(() => {
    const err = validate(value ?? []);
    // Call onChange for initial validation so consumers/tests receive the
    // current validation state on mount. This mirrors previous behavior and
    // keeps test expectations stable.
    onChange?.(value);
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      setError(err);
      onErrorRef.current?.(err ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, validate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.files;
    let selected: File | File[] | null = null;

    if (input && input.length > 0) {
      const newFiles = Array.from(input);
      if (field.multiple) {
        // Merge with existing files when multiple is true
        const existingFiles = Array.isArray(value) ? value : [];
        const uniqueNewFiles = newFiles.filter(f => !isDuplicateFile(f, existingFiles));
        selected = [...existingFiles, ...uniqueNewFiles];
      } else {
        selected = newFiles[0];
      }
    }
    const err = validate(selected ?? []);
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      setError(err);
      onErrorRef.current?.(err ?? null);
    }
    onChange?.(selected);
    
    // Reset input value to allow selecting the same file again if needed
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
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
        const uniqueNewFiles = newFiles.filter(f => !isDuplicateFile(f, existingFiles));
        selected = [...existingFiles, ...uniqueNewFiles];
      } else {
        selected = newFiles[0];
      }
      
      const err = validate(selected);
      if (err !== prevErrorRef.current) {
        prevErrorRef.current = err;
        setError(err);
        onErrorRef.current?.(err ?? null);
      }
      onChange?.(selected);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleRemoveFile = (index?: number) => {
    if (Array.isArray(value) && typeof index === 'number') {
      const newFiles = value.filter((_, i) => i !== index);
      const selected = newFiles.length > 0 ? newFiles : null;
      const err = validate(selected ?? []);
      if (err !== prevErrorRef.current) {
        prevErrorRef.current = err;
        setError(err);
        onErrorRef.current?.(err ?? null);
      }
      onChange?.(selected);
    } else {
      const err = validate([]);
      if (err !== prevErrorRef.current) {
        prevErrorRef.current = err;
        setError(err);
        onErrorRef.current?.(err ?? null);
      }
      onChange?.(null);
    }
  };

  const renderFileList = () => {
    const files = Array.isArray(value) ? value : value ? [value] : [];
    
    if (files.length === 0) return null;

    return (
      <div style={{
        marginTop: '8px',
        marginLeft: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            style={{ 
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              value={file.name}
              disabled
              readOnly
              title={file.name}
              className="reactaform-input"
              style={{
                flex: 1,
                cursor: 'default',
                opacity: 0.8,
                minWidth: 0
              }}
            />
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

  const [isHovering, setIsHovering] = React.useState<boolean>(false);

  return (
    <StandardFieldLayout field={field} error={error}>
      <div style={{ width: '100%' }}>
        <div
          className="reactaform-input"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          style={{
            position: 'relative',
            borderStyle: 'dashed',
            borderColor: isDragging
                ? 'var(--reactaform-color-primary, #2563eb)'
                : isHovering
                  ? 'var(--reactaform-border-hover, #4A4A4A)'
                  : error
                    ? 'var(--reactaform-color-error, #ef4444)'
                    : undefined,
            borderWidth: '1px',
            borderRadius: 'var(--reactaform-border-radius, 4px)',
            padding: '8px 12px',
            textAlign: 'center',
            backgroundColor: isDragging 
              ? `var(--reactaform-bg-hover, ${isDarkMode ? '#070707' : '#eff6ff'})` 
              : undefined,
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
            gap: '8px',
            userSelect: 'none',
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
        </div>
        
        {renderFileList()}
      </div>
    </StandardFieldLayout>
  );
};

FileInput.displayName = "FileInput";
export default React.memo(FileInput);
