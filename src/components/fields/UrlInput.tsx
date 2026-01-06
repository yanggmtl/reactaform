import * as React from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import { validateField } from "../../core/validation";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";
import { useUncontrolledValidatedInput } from "../../hooks/useUncontrolledValidatedInput";

/**
 * UrlInput component
 *
 * This component provides a controlled input field for URL values.
 * It validates required fields, URL format, and integrates with Reacta form context.
 *
 * Props:
 * - field: Field metadata (name, displayName, tooltip, validation rules).
 * - value: Current URL string.
 * - onChange: Callback called with (value, error).
 *
 * Features:
 * - Validates using a robust URL regex and `URL` constructor fallback.
 * - Supports tooltip, localization, and inline validation errors.
 */
export type UrlInputProps = BaseInputProps<string, DefinitionPropertyField>;

const UrlInput: React.FC<UrlInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();

  // Validation logic
  const validate = React.useCallback(
    (input: string): string | null => {
      return validateField(definitionName, field, input, t);
    },
    [definitionName, field, t]
  );

  // Use shared uncontrolled + validated input hook
  const { inputRef, error, handleChange } = useUncontrolledValidatedInput({
    value,
    onChange,
    onError,
    validate,
  });

  return (
    <StandardFieldLayout field={field} error={error}>
      <input
        id={field.name}
        type="url"
        // IMPORTANT:
        // This input is intentionally UNCONTROLLED for typing performance.
        // - `defaultValue` is only used on mount.
        defaultValue={String(value ?? "")}
        ref={inputRef}
        onChange={handleChange}
        className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
        placeholder="https://example.com"
        aria-invalid={!!error}
        aria-describedby={error ? `${field.name}-error` : undefined}
      />
    </StandardFieldLayout>
  );
};

export default UrlInput;
