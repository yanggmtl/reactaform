/* eslint-disable react-hooks/static-components -- This module performs dynamic
   component lookup (type -> component). Different component references may
   be produced at render time intentionally; we memoize wrapper components
   (`FieldWrapper`, `FieldGroup`) to avoid unnecessary re-renders. See file
   comment below for full rationale. */

/*
  File-level rationale: this module performs dynamic component lookup for
  field types (type -> component). The `react-hooks/static-components`
  rule can flag these patterns because a different component reference
  may be produced at render time; in our architecture that's intentional
  and we explicitly memoize wrappers (`FieldWrapper`, `FieldGroup`) to
  prevent unnecessary re-renders. Keep the rule disabled for this file
  with this documented reasoning.
*/

import React from "react";
import useReactaFormContext from "../hooks/useReactaFormContext";
import type { DefinitionPropertyField, FieldValueType, ErrorType } from "../core/reactaFormTypes";
import { getComponent } from "../core/registries";
import { groupConsecutiveFields } from "../utils/groupingHelpers";
import type { JSX } from "react/jsx-runtime";

// Memoized field wrapper to prevent unnecessary re-renders
const FieldWrapper = React.memo<{
  field: DefinitionPropertyField;
  value: FieldValueType;
  handleChange: (fieldName: string, value: FieldValueType, error: ErrorType) => void;
  handleError?: (fieldName: string, error: ErrorType) => void;
}>(({ field, value, handleChange, handleError }) => {
  // Dynamic component lookup: this creates a component reference during render
  // intentionally because fields are dynamic (type -> component). The wrapper
  // is memoized to avoid unnecessary re-renders.
  const Component = getComponent(field.type);

  const onChange = React.useCallback(
    (v: FieldValueType, err: ErrorType) => handleChange(field.name, v, err),
    [handleChange, field.name]
  );

  const onError = React.useCallback(
    (err: ErrorType) => handleError?.(field.name, err),
    [handleError, field.name]
  );

  if (!Component) return null;

  return (
    <Component
      field={field}
      value={value}
      onChange={onChange}
      onError={onError}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if field, value, or handler references changed
  return (
    prevProps.field === nextProps.field &&
    prevProps.value === nextProps.value &&
    prevProps.handleChange === nextProps.handleChange &&
    prevProps.handleError === nextProps.handleError
  );
});

FieldWrapper.displayName = 'FieldWrapper';

const renderField = (
  field: DefinitionPropertyField,
  valuesMap: Record<string, FieldValueType>,
  handleChange: (fieldName: string, value: FieldValueType, error: ErrorType) => void,
  handleError?: (fieldName: string, error: ErrorType) => void
) => {
  return (
    <FieldWrapper
      key={field.name}
      field={field}
      value={valuesMap[field.name]}
      handleChange={handleChange}
      handleError={handleError}
    />
  );
};

// Render fields based on visibility and loaded count without grouping
export const renderFields = (
  fields: DefinitionPropertyField[],
  valuesMap: Record<string, FieldValueType>,
  handleChange: (fieldName: string, value: FieldValueType, error: ErrorType) => void,
  visibility: Record<string, boolean>,
  loadedCount: number,
  handleError?: (fieldName: string, error: ErrorType) => void
) => {
  return fields.slice(0, loadedCount).map((field) => {
    if (!visibility[field.name]) return null;
    return (
      <div key={field.name}>
        {renderField(field, valuesMap, handleChange, handleError)}
      </div>
    );
  });
};

// Memoized group component
const FieldGroup = React.memo<{
  groupName: string;
  isOpen: boolean;
  fields: DefinitionPropertyField[];
  valuesMap: Record<string, FieldValueType>;
  handleChange: (fieldName: string, value: FieldValueType, error: ErrorType) => void;
  handleError: (fieldName: string, error: ErrorType) => void;
  toggleGroup: (groupName: string) => void;
  t: (key: string) => string;
}>(({ groupName, isOpen, fields, valuesMap, handleChange, handleError, toggleGroup, t }) => {
  const onToggle = React.useCallback(() => toggleGroup(groupName), [toggleGroup, groupName]);

  // Use form/field style from context so styles are scoped per ReactaForm instance
  const { formStyle, fieldStyle } = useReactaFormContext();
  const fieldsetStyle = React.useMemo<React.CSSProperties>(() => ({
    border: "1px solid var(--reactaform-border-color, #bbb)",
    padding: "var(--reactaform-fieldset-padding, 0.5em)",
    borderRadius: "var(--reactaform-border-radius, 4px)",
    marginBottom: "var(--reactaform-space, 8px)",
    // allow per-form overrides if provider exposes them
    ...((formStyle as Record<string, unknown> | undefined)?.fieldset as React.CSSProperties || {}),
    ...((fieldStyle as Record<string, unknown> | undefined)?.fieldset as React.CSSProperties || {}),
  }), [formStyle, fieldStyle]);

  const legendStyle = React.useMemo<React.CSSProperties>(() => ({
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 var(--reactaform-space, 8px)",
    color: "var(--reactaform-text-color, inherit)",
    ...((formStyle as Record<string, unknown> | undefined)?.legend as React.CSSProperties || {}),
    ...((fieldStyle as Record<string, unknown> | undefined)?.legend as React.CSSProperties || {}),
  }), [formStyle, fieldStyle]);

  return (
    <fieldset style={fieldsetStyle}>
      <legend onClick={onToggle} style={legendStyle}>
        <span>{t(groupName)}</span>
        <span>{isOpen ? "▼" : "▶"}</span>
      </legend>
      {isOpen && fields.map((f) => <div key={f.name}>{renderField(f, valuesMap, handleChange, handleError)}</div>)}
    </fieldset>
  );
});

FieldGroup.displayName = 'FieldGroup';

// Render fields with grouping support
export const renderFieldsWithGroups = (
  groupState: Record<string, boolean>,
  fields: DefinitionPropertyField[],
  valuesMap: Record<string, FieldValueType>,
  t: (key: string) => string,
  handleChange: (fieldName: string, value: FieldValueType, error: ErrorType) => void,
  handleError: (fieldName: string, error: ErrorType) => void,
  visibility: Record<string, boolean>,
  loadedCount: number,
  toggleGroup: (groupName: string) => void
) => {
  const fieldsToRender = fields.slice(0, loadedCount).filter((f) => visibility[f.name]);
  const groupResult = groupConsecutiveFields(fieldsToRender);
  const groups = groupResult.groups;
  const output = [] as JSX.Element[];
  
  groups.forEach((group) => {
    if (group.name) {
      const isOpen = groupState[group.name] ?? true;
      output.push(
        <FieldGroup
          key={group.name}
          groupName={group.name}
          isOpen={isOpen}
          fields={group.fields}
          valuesMap={valuesMap}
          handleChange={handleChange}
          handleError={handleError}
          toggleGroup={toggleGroup}
          t={t}
        />
      );
    } else {
      group.fields.forEach((f) => output.push(<div key={f.name}>{renderField(f, valuesMap, handleChange, handleError)}</div>));
    }
  });

  return output;
};
