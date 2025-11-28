/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { memo } from "react";
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
 * - Value/input area on the right using ValueColumnDiv/ValueRowDiv
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
  const { formStyle, fieldStyle } = useReactaFormContext();

  const valueColumnStyle = React.useMemo<React.CSSProperties>(() => ({
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    ...((formStyle as any)?.valueColumn || {}),
    ...((fieldStyle as any)?.valueColumn || {}),
  }), [formStyle, fieldStyle]);

  const valueRowStyle = React.useMemo<React.CSSProperties>(() => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '3px',
    ...((formStyle as any)?.valueRow || {}),
    ...((fieldStyle as any)?.valueRow || {}),
  }), [formStyle, fieldStyle]);

  const errorStyle = React.useMemo<React.CSSProperties>(() => ({
    color: "var(--reactaform-error-color)",
    fontSize: "12px",
    marginTop: "4px",
    fontWeight: "var(--reactaform-font-weight)" as unknown as number | string,
    ...((formStyle as any)?.error || {}),
    ...((fieldStyle as any)?.error || {}),
  }), [formStyle, fieldStyle]);

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
        {error && <div style={errorStyle as any}>{error}</div>}
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

const ValueColumnDiv = memo(({ children }: { children: React.ReactNode }) => {
  const { formStyle, fieldStyle } = useReactaFormContext();
  const style = React.useMemo<React.CSSProperties>(() => ({
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    ...((formStyle as any)?.valueColumn || {}),
    ...((fieldStyle as any)?.valueColumn || {}),
  }), [formStyle, fieldStyle]);

  return <div style={style}>{children}</div>;
});

ValueColumnDiv.displayName = 'ValueColumnDiv';

const ValueRowDiv = memo(({ children }: { children: React.ReactNode }) => {
  const { formStyle, fieldStyle } = useReactaFormContext();
  const style = React.useMemo<React.CSSProperties>(() => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '3px',
    ...((formStyle as any)?.valueRow || {}),
    ...((fieldStyle as any)?.valueRow || {}),
  }), [formStyle, fieldStyle]);

  return <div style={style}>{children}</div>;
});

ValueRowDiv.displayName = 'ValueRowDiv';

export const ErrorDiv = memo(({ children }: { children: React.ReactNode }) => {
  const { formStyle, fieldStyle } = useReactaFormContext();
  const style = React.useMemo<React.CSSProperties>(() => ({
    color: "var(--reactaform-error-color)",
    fontSize: "12px",
    marginTop: "4px",
    fontWeight: "var(--reactaform-font-weight)" as unknown as number | string,
    ...((formStyle as any)?.error || {}),
    ...((fieldStyle as any)?.error || {}),
  }), [formStyle, fieldStyle]);

  return <div style={style as any}>{children}</div>;
});

ErrorDiv.displayName = 'ErrorDiv';
