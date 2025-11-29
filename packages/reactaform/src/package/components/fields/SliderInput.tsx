/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useRef } from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { validateFieldValue } from "../../core/validation";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

// Extend field type with min/max
export type SliderField = DefinitionPropertyField & {
  min: number;
  max: number;
};

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
 * - field: SliderField (extends DefinitionPropertyField)
 *   - Required: min, max
 *   - Optional: tooltip
 * - value: current numeric value
 * - onChange: callback triggered with new value and optional error string
 */

type SliderInputProps = BaseInputProps<string | number, SliderField>;

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

  // State for the raw string in the text input
  const [inputValue, setInputValue] = useState<string>(String(value ?? ""));
  const isDisabled = field.disabled ?? false;

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
      if (numValue < field.min) {
        return t("Value should be at least {{1}}", field.min);
      }

      if (numValue > field.max) {
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

  // Whenever prop `value` changes externally, update text input and report errors
  useEffect(() => {
    const input = String(value);
    const err = validate(input);
    setInputValue(input);
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
  }, [value, validate]);

  // Clean fallback values
  const min = field.min ?? 0;
  const max = field.max ?? 100;

  // Safe numeric value for slider (in case text input is invalid)
  const sliderValue = !isNaN(Number(inputValue)) ? Number(inputValue) : min;

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const input = e.target.value;
    const err = validate(input);
    setInputValue(input);
    onChange?.(input, err);
  };

  return (
    <StandardFieldLayout field={field} error={validate(inputValue)}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
        <input
          type="range"
          value={sliderValue}
          onChange={handleValueChange}
          disabled={isDisabled}
          min={min}
          max={max}
          style={{
            padding: "0px, 0px", // Remove padding to make Chrome browser works fine.
            flex: 1,
          }}
          className={CSS_CLASSES.rangeInput}
        />
        <input
          type="text"
          value={inputValue}
          onChange={handleValueChange}
          required
          disabled={isDisabled}
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
