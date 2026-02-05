import * as React from "react";
import type { DefinitionPropertyField, FieldValueType, ErrorType } from "../../core/reactaFormTypes";
import { getComponent } from "../../core/registries/componentRegistry";
import type { ButtonInputProps } from "../fields/Button";

export interface FieldRendererProps {
  field: DefinitionPropertyField;
  valuesMap: Record<string, FieldValueType>;
  handleChange: (fieldName: string, value: FieldValueType) => void;
  handleError?: (fieldName: string, error: ErrorType) => void;
  errorsMap?: Record<string, string>;
}

/**
 * Memoized component for rendering a single field with error handling
 * and optimized re-render prevention
 */
export const FieldRenderer = React.memo<FieldRendererProps>(
  ({ field, valuesMap, handleChange, handleError, errorsMap }) => {
    const Component = getComponent(field.type) as JSX.ElementType | undefined;
    const value = valuesMap[field.name];
    const fieldError = errorsMap ? errorsMap[field.name] ?? null : undefined;

    const stableValue = React.useMemo(() => value, [value]);

    const onChange = React.useCallback(
      (v: FieldValueType) => handleChange(field.name, v),
      [handleChange, field.name]
    );

    const onError = React.useCallback(
      (err: ErrorType) => handleError?.(field.name, err),
      [handleError, field.name]
    );

    if (!Component) return null;

    // Button type needs special props - pass valuesMap, handleChange, handleError
    if (field.type === 'button') {
      const buttonProps: ButtonInputProps = {
        field,
        value: null,
        valuesMap,
        handleChange,
        handleError: handleError || (() => {}),
      };
      return <Component {...buttonProps} />;
    }

    return (
      <Component
        field={field}
        value={stableValue}
        onChange={onChange}
        onError={onError}
        error={fieldError}
      />
    );
  },
  (prevProps, nextProps) =>
    prevProps.field === nextProps.field &&
    prevProps.valuesMap[prevProps.field.name] === nextProps.valuesMap[nextProps.field.name] &&
    prevProps.handleChange === nextProps.handleChange &&
    prevProps.handleError === nextProps.handleError &&
    prevProps.errorsMap?.[prevProps.field.name] === nextProps.errorsMap?.[nextProps.field.name]
);

FieldRenderer.displayName = "FieldRenderer";
