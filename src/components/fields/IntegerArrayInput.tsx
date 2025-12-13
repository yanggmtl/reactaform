// components/IntegerArrayInput.tsx
import React, { useState, useEffect, useRef } from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import { validateFieldValue } from "../../core/validation";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

// Base field type for number arrays
// Props for the generic number array input
export type IntegerArrayInputProps = BaseInputProps<string | number[], DefinitionPropertyField>;

function isValidIntegerArray(input: string) {
  const integerRegex = /^-?\d+$/;
  return input
    .split(",")
    .map((item) => item.trim())
    .every((val) => integerRegex.test(val));
}

/**
 * IntegerArrayInput
 * - Parsing and validating each integer value.
 * - Min/max validation for the number of values.
 * - Min/Max limit constraints (inclusive or exclusive) per value.
 * - Inline error display.
 * - Tooltip support for field help.
 * - Integration with Reacta form context for localization, styles, and validation.
 *
 * Props:
 * - field: Metadata describing the input field, including validation rules and display info.
 * - value: The integer array.
 * - onChange: Callback invoked when input changes, returning the parsed integer array and validation error.
 */
const IntegerArrayInput: React.FC<IntegerArrayInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();
  const delimiter = ",";
  const [inputValue, setInputValue] = useState<string>(
    Array.isArray(value) ? value.join(delimiter + " ") : String(value ?? "")
  );
  const parseArray = (text: string): number[] => {
    if (!text || text.trim() === "") return [];
    return text
      .split(delimiter)
      .map((v) => v.trim())
      .filter(Boolean)
      .map((v) => Number(v));
  };

  const validate = React.useCallback(
    (input: string): string | null => {
      if (input.trim() === "") {
        return field.required ? t("Value required") : null;
      }

      if (!isValidIntegerArray(input)) {
        return t("Each value must be a valid integer");
      }

      const numbers = parseArray(input);

      if (field.minCount !== undefined && numbers.length < field.minCount) {
        return t("Minimum number of values: {{1}}", `${field.minCount}`);
      }

      if (field.maxCount !== undefined && numbers.length > field.maxCount) {
        return t("Maximum number of values: {{1}}", `${field.maxCount}`);
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
    const newValue = e.target.value;
    const err = validate(newValue);
    setInputValue(newValue);
    onChange?.(newValue, err);
  };

  const prevErrorRef = useRef<string | null>(null);
  const onErrorRef = useRef<IntegerArrayInputProps["onError"] | undefined>(
    onError
  );
  
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // synchronize validation when external value or field metadata change
  useEffect(() => {
    const input = Array.isArray(value) ? value.join(delimiter + " ") : String(value ?? "");
    const err = validate(input);
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
  }, [value, field.required, validate, t]);

  const error = validate(inputValue);

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
