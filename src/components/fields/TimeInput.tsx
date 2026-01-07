import * as React from "react";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import { StandardFieldLayout } from "../LayoutComponents";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";
import { useUncontrolledValidatedInput } from "../../hooks/useUncontrolledValidatedInput";
import { useFieldValidator } from "../../hooks/useFieldValidator";

type TimeInputProps = BaseInputProps<string, DefinitionPropertyField>;

const TimeInput: React.FC<TimeInputProps> = ({
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
        type="time"
        ref ={inputRef}
        // IMPORTANT:
        // This input is intentionally UNCONTROLLED for typing performance.
        // - `defaultValue` is only used on mount.
        defaultValue={value}
        step={field.includeSeconds ? 1 : 60}
        onChange={handleChange}
        min={typeof field.min === 'string' ? field.min : undefined}
        max={typeof field.max === 'string' ? field.max : undefined}
        className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.name}-error` : undefined}
      />
    </StandardFieldLayout>
  );
};

export default TimeInput;
