// components/SpinInput.tsx
import * as React from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import { validateField } from "../../validation/validation";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES } from "../../utils/cssClasses";
import { useUncontrolledValidatedInput } from "../../hooks/useUncontrolledValidatedInput";

export type NumericStepperInputProps = BaseInputProps<string | number, DefinitionPropertyField>;

const NumericStepperInput: React.FC<NumericStepperInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();

  const step = Math.max(1, Math.round(field.step ?? 1)); // ensure step >= 1

  const validate = React.useCallback(
    (input: string): string | null => {
      return validateField(definitionName, field, input, t) ?? null;
    },
    [definitionName, field, t]
  );

  // Use shared uncontrolled + validated input hook
  const { inputRef, error, handleChange } = useUncontrolledValidatedInput({
    value: String(value ?? ""),
    onChange,
    onError,
    validate,
  });

  return (
    <StandardFieldLayout field={field} error={error}>
      <input
        id={field.name}
        type="number"
        // IMPORTANT: Don't change this to `value={...}` unless you want a controlled input
        // See IntegerInput.tsx for details.
        defaultValue={String(value ?? "")}
        ref={inputRef}
        min={field.min ?? undefined}
        max={field.max ?? undefined}
        step={step}
        onChange={handleChange}
        style={{
          width: "100%",
          height: "100%"
        }}
        className={CSS_CLASSES.input}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.name}-error` : undefined}
      />
    </StandardFieldLayout>
  );
};

export default NumericStepperInput;
