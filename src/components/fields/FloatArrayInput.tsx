// components/FloatArrayInput.tsx
import * as React from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type {
  DefinitionPropertyField,
  BaseInputProps,
} from "../../core/reactaFormTypes";
import { validateField } from "../../core/validation";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

// Props for the generic number array input
export type FloatArrayInputProps = BaseInputProps<
  string | number[],
  DefinitionPropertyField
>;

/**
 * FloatArrayInput component
 */

const FloatArrayInput: React.FC<FloatArrayInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();
  const [inputValue, setInputValue] = React.useState<string>(
    Array.isArray(value) ? value.join(", ") : String(value ?? "")
  );
  const validate = React.useCallback(
    (input: string): string | null => {
      return validateField(definitionName, field, input, t);
    },
    [definitionName, field, t]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    const err = validate(input);

    setInputValue(input);
    onChange?.(input, err);
  };

  const prevErrorRef = React.useRef<string | null>(null);
  const onErrorRef = React.useRef<FloatArrayInputProps["onError"] | undefined>(
    onError
  );
  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const [error, setError] = React.useState<string | null>(null);

  // synchronize validation when external value or field metadata change
  React.useEffect(() => {
    const input = Array.isArray(value) ? value.join(", ") : String(value ?? "");
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

export default FloatArrayInput;
