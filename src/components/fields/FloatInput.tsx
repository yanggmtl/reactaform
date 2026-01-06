// components/FloatInput.tsx
import * as React from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import { validateField } from "../../core/validation";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";
import { useUncontrolledValidatedInput } from "../../hooks/useUncontrolledValidatedInput";

/**
 * FloatInput component
 */
export type FloatInputProps = BaseInputProps<string, DefinitionPropertyField>;

const FloatInput: React.FC<FloatInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();

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
        type="text"
        ref={inputRef}
        // IMPORTANT:
        // This input is intentionally UNCONTROLLED for typing performance.
        // - `defaultValue` is only used on mount.
        // - Subsequent value updates are synced manually via `inputRef` in an effect.
        // Do NOT change this to `value={...}` unless you want a controlled input
        // (which will re-render on every keystroke).
        defaultValue={String(value ?? "")}
        onChange={handleChange}
        className={combineClasses(
          CSS_CLASSES.input,
          CSS_CLASSES.inputNumber
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.name}-error` : undefined}
      />
    </StandardFieldLayout>
  );
};

export default FloatInput;
