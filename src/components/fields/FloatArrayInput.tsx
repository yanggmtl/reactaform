// components/FloatArrayInput.tsx
import React, { useState, useEffect, useRef } from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { DefinitionPropertyField, BaseInputProps } from "../../core/reactaFormTypes";
import { validateFieldValue } from "../../core/validation";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

// Props for the generic number array input
export type FloatArrayInputProps = BaseInputProps<string | number[], DefinitionPropertyField>;

const validFloatRegex = /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?$/;
function isValidFloatArray(input: string) {
  return input
    .split(",")
    .map((item) => item.trim())
    .every((val) => validFloatRegex.test(val));
}

/**
 * FloatArrayInput component
 *
 * A controlled input component for editing an array of floating-point numbers represented as
 * a delimiter-separated string. It supports:
 * - Parsing and validating each float value.
 * - Required field validation.
 * - Min/max validation for the number of values.
 * - Lower and upper limit constraints (inclusive or exclusive) per value.
 * - Inline error display.
 * - Tooltip support for field help.
 * - Integration with Reacta form context for localization, styles, and validation.
 *
 * Props:
 * - field: Metadata describing the input field, including validation rules and display info.
 * - value: The float array.
 * - onChange: Callback invoked when input changes, returning the parsed float array and validation error.
 */

const parseArray = (text: string): number[] => {
  if (!text || text.trim() === "") return [];
  return text
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .map(Number);
};

const FloatArrayInput: React.FC<FloatArrayInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();
  const [inputValue, setInputValue] = useState<string>(
    Array.isArray(value) ? value.join(", ") : String(value ?? "")
  );
  const validate = React.useCallback(
    (inputValue: string): string | null => {
      if (inputValue.trim() === "") {
        return field.required ? t("Value required") : null;
      }

      if (!isValidFloatArray(inputValue)) {
        return t("Each value must be a valid float");
      }

      const numbers = parseArray(inputValue);
      if (field.minCount !== undefined && numbers.length < field.minCount) {
        return t("Minimum number of values: {{1}}", field.minCount);
      }

      if (field.maxCount !== undefined && numbers.length > field.maxCount) {
        return t("Maximum number of values: {{1}}", field.maxCount);
      }

      for (const num of numbers) {
        if (field.min !== undefined) {
          const belowLimit = field.minInclusive
            ? num < field.min
            : num <= field.min;
          if (belowLimit) {
            return t(
              "Each value must be {{1}} {{2}}",
              field.minInclusive ? "≥" : ">",
              field.min
            );
          }
        }

        if (field.max !== undefined) {
          const aboveLimit = field.maxInclusive
            ? num > field.max
            : num >= field.max;
          if (aboveLimit) {
            return t(
              "Each value must be {{1}} {{2}}",
              field.maxInclusive ? "≤" : "<",
              field.max
            );
          }
        }
      }

      const err = validateFieldValue(definitionName, field, numbers, t);
      return err ?? null;
    },
    [definitionName, field, t]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    const err = validate(input);

    setInputValue(input);
    onChange?.(input, err);
  };

  const prevErrorRef = useRef<string | null>(null);
  const onErrorRef = useRef<FloatArrayInputProps["onError"] | undefined>(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // synchronize validation when external value or field metadata change
  useEffect(() => {
    const input = Array.isArray(value) ? value.join(", ") : String(value ?? "");
    const err = validate(input);
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
  }, [value, field.required, validate, t]);

  return (
    <StandardFieldLayout field={field} error={validate(inputValue)}>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
        style={{ flex: 1 }}
      />
    </StandardFieldLayout>
  );
};

export default FloatArrayInput;
