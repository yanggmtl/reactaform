import * as React from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";
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
  const validate = useFieldValidator(field);

  const { inputRef, error: hookError, handleChange } = useUncontrolledValidatedInput({
     value,
     onChange,
     onError,
     validate,
   });
 
   const error = externalError ?? hookError;
 
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
