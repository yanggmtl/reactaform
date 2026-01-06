// components/IntegerInput.tsx
import * as React from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import { validateField } from "../../validation/validation";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";
import { useUncontrolledValidatedInput } from "../../hooks/useUncontrolledValidatedInput";

export type IntegerInputProps = BaseInputProps<string, DefinitionPropertyField>;

const IntegerInput: React.FC<IntegerInputProps> = ({ field, value, onChange, onError }) => {
  const { t, definitionName } = useReactaFormContext();

  // Define validation logic
  const validate = React.useCallback(
    (val: string) => validateField(definitionName, field, val, t) ?? null,
    [definitionName, field, t]
  );

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
        type="text"
        // Uncontrolled input for typing performance
        defaultValue={String(value ?? "")}
        ref={inputRef}
        onChange={handleChange}
        className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.inputNumber)}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.name}-error` : undefined}
      />
    </StandardFieldLayout>
  );
};

IntegerInput.displayName = "IntegerInput";
export default React.memo(IntegerInput);
