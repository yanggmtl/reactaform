import * as React from "react";
import useReactaFormContext from "../hooks/useReactaFormContext";
import type { DefinitionPropertyField, FieldValueType, ErrorType } from "../core/reactaFormTypes";
import { getComponent } from "../core/componentRegistry";
import { groupConsecutiveFields } from "../utils/groupingHelpers";

// Memoized field wrapper to prevent unnecessary re-renders
const FieldWrapper = React.memo<{
  field: DefinitionPropertyField;
  value: FieldValueType;
  handleChange: (fieldName: string, value: FieldValueType, error: ErrorType) => void;
  handleError?: (fieldName: string, error: ErrorType) => void;
}>(({ field, value, handleChange, handleError }) => {
  const Component = getComponent(field.type) as JSX.ElementType | undefined;

  const stableValue = React.useMemo(() => value, [value]);

  const onChange = React.useCallback(
    (v: FieldValueType, err: ErrorType) => handleChange(field.name, v, err),
    [handleChange, field.name]
  );

  const onError = React.useCallback(
    (err: ErrorType) => handleError?.(field.name, err),
    [handleError, field.name]
  );

  if (!Component) return null;

  return <Component field={field} value={stableValue} onChange={onChange} onError={onError} />;
}, (prevProps, nextProps) => (
  prevProps.field === nextProps.field &&
  prevProps.value === nextProps.value &&
  prevProps.handleChange === nextProps.handleChange &&
  prevProps.handleError === nextProps.handleError
));

FieldWrapper.displayName = 'FieldWrapper';

// Render a single field
const renderField = (
  field: DefinitionPropertyField,
  valuesMap: Record<string, FieldValueType>,
  handleChange: (fieldName: string, value: FieldValueType, error: ErrorType) => void,
  handleError?: (fieldName: string, error: ErrorType) => void
) => (
  <React.Fragment key={field.name}>
    <FieldWrapper
      field={field}
      value={valuesMap[field.name]}
      handleChange={handleChange}
      handleError={handleError}
    />
  </React.Fragment>
);

// Render fields without grouping
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
    return renderField(field, valuesMap, handleChange, handleError);
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
  const { formStyle, fieldStyle } = useReactaFormContext();

  const fieldsetStyle = React.useMemo<React.CSSProperties>(() => ({
    border: "1px solid var(--reactaform-border-color, #bbb)",
    padding: "var(--reactaform-fieldset-padding, 0.5em)",
    borderRadius: "var(--reactaform-border-radius, 4px)",
    marginBottom: "var(--reactaform-space, 8px)",
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
      {isOpen && fields.map((f) => renderField(f, valuesMap, handleChange, handleError))}
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
  const output: JSX.Element[] = [];

  groupResult.groups.forEach((group) => {
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
      group.fields.forEach((f) => output.push(renderField(f, valuesMap, handleChange, handleError)));
    }
  });

  return output;
};
