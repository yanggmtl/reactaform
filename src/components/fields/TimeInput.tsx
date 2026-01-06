import * as React from "react";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import { StandardFieldLayout } from "../LayoutComponents";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { validateField } from "../../validation/validation";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";
import { useUncontrolledValidatedInput } from "../../hooks/useUncontrolledValidatedInput";

type TimeInputProps = BaseInputProps<string, DefinitionPropertyField>;

const TimeInput: React.FC<TimeInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();

  const validate = React.useCallback((input: string): string | null => {
    return validateField(definitionName, field, input, t) ?? null;
  }, [field, definitionName, t]);

  // Use our shared uncontrolled + validated input hook
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
