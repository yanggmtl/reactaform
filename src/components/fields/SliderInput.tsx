import React, { useEffect, useRef } from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { BaseInputProps, DefinitionPropertyField } from "../../core/reactaFormTypes";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { validateFieldValue } from "../../core/validation";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

/**
 * SliderInput component
 *
 * A reusable UI component that displays a range slider with a linked numeric input.
 * Designed for numeric fields defined in a JSON schema, this component supports:
 * - Validation (min/max, required, and custom rules)
 * - Real-time synchronization between slider and text input
 * - Tooltip display on hover
 * - Integration with ReactaForm context (for styling, translation, and validation)
 *
 * Props:
 * - field: DefinitionPropertyField
 *   - Required: min, max
 *   - Optional: tooltip
 * - value: current numeric value
 * - onChange: callback triggered with new value and optional error string
 */

type SliderInputProps = BaseInputProps<string | number, DefinitionPropertyField>;

const validFloatRegex = /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?$/;
function isValidFloat(input: string) {
  return validFloatRegex.test(input);
}

const SliderInput: React.FC<SliderInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const rangeRef = useRef<HTMLInputElement | null>(null);

  const validate = React.useCallback(
    (input: string): string | null => {
      let err: string | null = null;

      if (input.trim() === "") {
        return t("Value required");
      }

      if (!isValidFloat(input)) {
        return t("Invalid number");
      }

      const numValue = Number(input);
      if (typeof field.min === 'number' && numValue < field.min) {
        return t("Value should be at least {{1}}", field.min);
      }

      if (typeof field.max === 'number' && numValue > field.max) {
        return t("Value should be at most {{1}}", field.max);
      }

      if (!err) {
        err = validateFieldValue(definitionName, field, numValue, t);
      }
      return err;
    },
    [definitionName, field, t]
  );

  const prevErrorRef = useRef<string | null>(null);
  const onErrorRef = useRef<SliderInputProps["onError"] | undefined>(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    const input = String(value);
    const err = validate(input);
    if (rangeRef.current && document.activeElement !== rangeRef.current) {
      rangeRef.current.value = !isNaN(Number(input)) ? String(Number(input)) : String(field.min ?? 0);
    }
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.value = input;
    }
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
  }, [value, validate, field.min]);

  // Clean fallback values
  const min = field.min ?? 0;
  const max = field.max ?? 100;

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const err = validate(input);
    onChange?.(input, err);
  };

  return (
    <StandardFieldLayout field={field} error={validate(String(value ?? ""))}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
        <input
          ref={rangeRef}
          type="range"
          defaultValue={!isNaN(Number(value)) ? String(Number(value)) : String(min)}
          onChange={handleValueChange}
          min={min}
          max={max}
          style={{
            padding: "0px, 0px", // Remove padding to make Chrome browser works fine.
            flex: 1,
          }}
          className={CSS_CLASSES.rangeInput}
        />
        <input
          ref={inputRef}
          type="text"
          defaultValue={String(value ?? "")}
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
        />
      </div>
    </StandardFieldLayout>
  );
};

export default SliderInput;
