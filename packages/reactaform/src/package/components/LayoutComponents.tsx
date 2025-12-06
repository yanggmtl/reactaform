import React, { memo, useMemo } from "react";
import useReactaFormContext from "../hooks/useReactaFormContext";
import { CSS_CLASSES } from "../utils/cssClasses";
import Tooltip from "./Tooltip";
import type { DefinitionPropertyField } from "../core/reactaFormTypes";

/**
 * ColumnFieldLayout - Vertical layout wrapper for form fields
 * 
 * This component provides a column-based layout pattern:
 * - Label on top (left-aligned or center-aligned based on labelLayout)
 * - Value/input area below
 * - Optional tooltip support
 * - Error display area
 * 
 * Usage:
 * <ColumnFieldLayout field={field} error={error}>
 *   <textarea ... />
 * </ColumnFieldLayout>
 */
export const ColumnFieldLayout = memo(({
  field,
  error,
  children,
}: {
  field: DefinitionPropertyField;
  error?: string | null;
  children: React.ReactNode;
}) => {
  const { t } = useReactaFormContext();
  
  // Determine label alignment based on labelLayout
  const labelAlignment = field?.labelLayout === 'column-center' ? 'center' : 'left';

  return (
    <div
      className={`${CSS_CLASSES.field} column-layout`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--reactaform-field-gap, 8px)",
        '--label-align': labelAlignment,
      } as React.CSSProperties & { '--label-align': string }}
    >
      <div style={{ textAlign: labelAlignment, width: "100%" }}>
        <label
          className={CSS_CLASSES.label}
          htmlFor={field.name}
          style={{
            textAlign: labelAlignment as 'left' | 'center',
            width: '100%',
            minWidth: 'unset',
            display: 'block',
          }}
        >
          {t(field.displayName)}
        </label>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--reactaform-field-gap, 8px)",
          width: "100%",
        }}
      >
        <div style={{ flex: 1, minWidth: 0, maxWidth: "100%" }}>
          <div style={{ width: "100%" }}>{children}</div>
        </div>
        {field.tooltip && <Tooltip content={field.tooltip} />}
      </div>
      {error && <ErrorDiv>{error}</ErrorDiv>}
    </div>
  );
});

ColumnFieldLayout.displayName = 'ColumnFieldLayout';

/**
 * RowFieldLayout - Horizontal layout wrapper for form fields
 * 
 * This component provides the traditional two-column layout pattern:
 * - Label on the left using CSS_CLASSES.label
 * - Value/input area on the right
 * - Optional tooltip support
 * - Error display area
 * 
 * Usage:
 * <RowFieldLayout field={field} error={error}>
 *   <input ... />
 * </RowFieldLayout>
 */
export const RowFieldLayout = memo(({
  field,
  error,
  children,
  rightAlign = false,
}: {
  field: DefinitionPropertyField;
  error?: string | null;
  children: React.ReactNode;
  rightAlign?: boolean; // For checkbox, switch, etc.
}) => {
  const { t } = useReactaFormContext();

  const valueColumnStyle = useMemo<React.CSSProperties>(() => ({
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  }), []);

  const valueRowStyle = useMemo<React.CSSProperties>(() => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '3px',
  }), []);

  return (
    <div className={`${CSS_CLASSES.field} row-layout`}>
      <label
        className={CSS_CLASSES.label}
        htmlFor={field.name}
        style={{ textAlign: 'left' as const, justifyContent: 'flex-start' }}
      >
        {t(field.displayName)}
      </label>
      <div style={valueColumnStyle}>
        <div style={valueRowStyle}>
          {rightAlign ? (
            <div
              style={{
                display: "flex",
                flex: 1,
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "var(--reactaform-field-gap, 8px)",
              }}
            >
              {children}
            </div>
          ) : (
            children
          )}
          {field.tooltip && <Tooltip content={field.tooltip} />}
        </div>
        {error && <ErrorDiv>{error}</ErrorDiv>}
      </div>
    </div>
  );
});

RowFieldLayout.displayName = 'RowFieldLayout';

/**
 * StandardFieldLayout - Smart layout wrapper that delegates to appropriate layout component
 * 
 * This component automatically chooses between row and column layouts based on field.labelLayout:
 * - Uses ColumnFieldLayout when field.labelLayout === 'column'
 * - Uses RowFieldLayout for default/row layout
 * - Maintains consistent API for all field components
 * 
 * Usage:
 * <StandardFieldLayout field={field} error={error}>
 *   <input ... />
 * </StandardFieldLayout>
 */
export const StandardFieldLayout = ({
  field,
  error,
  children,
  rightAlign = false,
}: {
  field: DefinitionPropertyField;
  error?: string | null;
  children: React.ReactNode;
  rightAlign?: boolean; // For checkbox, switch, etc.
}) => {
  // Use column layout if explicitly specified
  if (field?.labelLayout === 'column-left' || field?.labelLayout === 'column-center') {
    return (
      <ColumnFieldLayout field={field} error={error}>
        {children}
      </ColumnFieldLayout>
    );
  }

  // Default to row layout
  return (
    <RowFieldLayout field={field} error={error} rightAlign={rightAlign}>
      {children}
    </RowFieldLayout>
  );
};

export const ErrorDiv = memo(({ children }: { children: React.ReactNode }) => {
  const style = useMemo<React.CSSProperties>(() => ({
    color: 'var(--reactaform-error-color)',
    fontSize: '13px',
    marginTop: '4px',
    fontWeight: 'var(--reactaform-font-weight)',
    display: "flex",
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  }), []);

  return <div style={style}>{children}</div>;
});

ErrorDiv.displayName = 'ErrorDiv';

/**
 * InstanceName - display and edit an instance name in a compact grid row
 *
 * Props:
 * - `name`: current instance name
 * - `onChange`: callback invoked with new name when edited
 */
export const InstanceName = memo(({ name, onChange }: { name: string; onChange: (n: string) => void }) => {
  const { t } = useReactaFormContext();

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, alignItems: 'center' }}>
        <label
          htmlFor="instance-name-input"
          style={{
            margin: 0,
            fontSize: '0.95em',
            fontWeight: 500,
            color: 'var(--reactaform-text-color, #333)'
          }}
        >
          {t('Instance Name')}
        </label>
        <input
          id="instance-name-input"
          type="text"
          value={name}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: 'var(--reactaform-input-padding, 8px 12px)',
            fontSize: 'var(--reactaform-input-font-size, 14px)',
            border: '1px solid var(--reactaform-input-border, #ddd)',
            borderRadius: 'var(--reactaform-border-radius, 4px)',
            backgroundColor: 'var(--reactaform-input-bg, #fff)',
            color: 'var(--reactaform-text-color, #333)',
            boxSizing: 'border-box'
          }}
          placeholder={t('Enter instance name')}
        />
      </div>
      <div style={{ height: '1px', backgroundColor: 'var(--reactaform-separator, #e6e6e6)', marginTop: 12, marginBottom: 12 }} />
    </div>
  );
});

InstanceName.displayName = 'InstanceName';
