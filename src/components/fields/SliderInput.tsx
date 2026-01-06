import * as React from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { BaseInputProps, DefinitionPropertyField } from "../../core/reactaFormTypes";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { validateField } from "../../validation/validation";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

/**
 * SliderInput component
 */

type SliderInputProps = BaseInputProps<string | number, DefinitionPropertyField>;

const SliderInput: React.FC<SliderInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const rangeRef = React.useRef<HTMLInputElement | null>(null);

  const validate = React.useCallback(
    (input: string): string | null => {
      return validateField(definitionName, field, input, t) ?? null;
    },
    [definitionName, field, t]
  );

  const prevErrorRef = React.useRef<string | null>(null);
  const onErrorRef = React.useRef<SliderInputProps["onError"] | undefined>(onError);
  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  const [error, setError] = React.useState<string | null>(null);

  const [localValue, setLocalValue] = React.useState<string>(() =>
    !isNaN(Number(value as unknown)) ? String(Number(value as unknown)) : String(field.min ?? 0)
  );

  React.useEffect(() => {
    const input = String(value ?? "");
    const err = validate(input);

    // Sync validation state from external value
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      setError(err);
      onErrorRef.current?.(err ?? null);
    }

    // If neither control is focused, keep local display in sync with prop
    const active = document.activeElement;
    const isRangeFocused = active === rangeRef.current;
    const isInputFocused = active === inputRef.current;
    if (!isRangeFocused && !isInputFocused) {
      setLocalValue(!isNaN(Number(input)) ? String(Number(input)) : String(field.min ?? 0));
    }
  }, [value, validate, field.min]);

  // Clean fallback values
  const min = field.min ?? 0;
  const max = field.max ?? 100;

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // update local display immediately for smooth UI
    setLocalValue(input);

    const err = validate(input);
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      setError(err);
      onErrorRef.current?.(err ?? null);
    }
    onChange?.(input, err);
  };

  return (
    <StandardFieldLayout field={field} error={error}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
        <input
          ref={rangeRef}
          id={`${field.name}-range`}
          type="range"
          value={!isNaN(Number(localValue)) ? String(Number(localValue)) : String(min)}
          onChange={handleValueChange}
          min={min}
          max={max}
          step="1.0"
          style={{
            padding: 0, // Remove padding to make Chrome browser works fine.
            flex: 1,
          }}
          className={CSS_CLASSES.rangeInput}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.name}-error` : undefined}
        />
        <input
          id={field.name}
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleValueChange}
          required
          style={{
            width: "40px",
            minWidth: "40px",
            height: "2.3em",
            textAlign: "center",
            flexShrink: 0,
          }}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.name}-error` : undefined}
        />
      </div>
    </StandardFieldLayout>
  );
};

export default SliderInput;
