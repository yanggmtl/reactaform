// components/IntegerArrayInput.tsx
import * as React from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import { validateField } from "../../validation/validation";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

// Base field type for number arrays
// Props for the generic number array input
export type IntegerArrayInputProps = BaseInputProps<string | number[], DefinitionPropertyField>;


/**
 * IntegerArrayInput
 */
const IntegerArrayInput: React.FC<IntegerArrayInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();
  const delimiter = ",";
  const [inputValue, setInputValue] = React.useState<string>(
    Array.isArray(value) ? value.join(delimiter + " ") : String(value ?? "")
  );
  const validate = React.useCallback(
    (input: string): string | null => {
      return validateField(definitionName, field, input, t);
    },
    [definitionName, field, t]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const err = validate(newValue);
    setInputValue(newValue);
    onChange?.(newValue, err);
  };

  const prevErrorRef = React.useRef<string | null>(null);
  const onErrorRef = React.useRef<IntegerArrayInputProps["onError"] | undefined>(
    onError
  );
  
  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // synchronize validation when external value or field metadata change
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    const input = Array.isArray(value) ? value.join(delimiter + " ") : String(value ?? "");
    const err = validate(input);
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      setError(err);
      onErrorRef.current?.(err ?? null);
    }
  }, [value, field.required, validate, t]);

  return (
    <StandardFieldLayout field={field} error={error}>
      <input
        id={field.name}
        type="text"
        value={inputValue}
        onChange={handleChange}
        className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
        style={{ flex: 1 }}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.name}-error` : undefined}
      />
    </StandardFieldLayout>
  );
};

export default IntegerArrayInput;
