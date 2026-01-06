import * as React from "react";
import type { DefinitionPropertyField, BaseInputProps } from "../../core/reactaFormTypes";
import useReactaFormContext from "../../hooks/useReactaFormContext";
// Ensure built-in validators are registered when this component is imported in tests
import '../../validation';
import { StandardFieldLayout } from "../LayoutComponents";
import { validateField } from "../../validation/validation";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";
import { useUncontrolledValidatedInput } from "../../hooks/useUncontrolledValidatedInput";

export type EmailInputProps = BaseInputProps<string, DefinitionPropertyField>;

export const EmailInput: React.FC<EmailInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { definitionName, t } = useReactaFormContext();

  const validate = React.useCallback(
    (input: string): string | null => {
      return validateField(definitionName, field, input, t) ?? null;
    },
    [field, definitionName, t]
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
        type="email"
        defaultValue={String(value ?? "")}
        ref={inputRef}
        onChange={handleChange}
        className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.name}-error` : undefined}
      />
    </StandardFieldLayout>
  );
};

export default EmailInput;
