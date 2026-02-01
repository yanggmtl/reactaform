import * as React from "react";
import { StandardFieldLayout } from "../layout/LayoutComponents";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import { CSS_CLASSES, combineClasses } from "../../core/cssClasses";
import { useUncontrolledValidatedInput } from "../../hooks/useUncontrolledValidatedInput";
import { useFieldValidator } from "../../hooks/useFieldValidator";

/**
 * UrlInput component
 */
export type UrlInputProps = BaseInputProps<string, DefinitionPropertyField>;

const UrlInput: React.FC<UrlInputProps> = ({
  field,
  value,
  onChange,
  onError,
  error: externalError,
}) => {
  const validate = useFieldValidator(field, externalError);

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

UrlInput.displayName = "UrlInput";
export default React.memo(UrlInput);
