// components/FloatInput.tsx
import React, { useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import { validateFieldValue } from "../../core/validation";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

/**
 * FloatInput component
 *
 * This component provides a controlled input field specifically for floating-point numbers.
 * It supports validation for required values, numeric format (including decimals and scientific notation),
 * and optional minimum and maximum constraints with inclusive/exclusive boundaries.
 *
 * Props:
 * - field: The metadata defining this input's configuration and validation rules.
 * - value: The current numeric value to display.
 * - onChange: Callback to notify parent of changes, passing the parsed number and any validation error.
 *
 * Features:
 * - Validates input against a regex allowing floating-point formats.
 * - Shows validation errors inline.
 * - Supports tooltip display for additional field information.
 * - Integrates with Reacta form context for localization and styling.
 */
export type FloatInputProps = BaseInputProps<string | number, DefinitionPropertyField>;

// Regex to validate floating-point input (optional leading +/-, digits, optional decimal, optional exponent)
const validFloatRegex = /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?$/;

// Parse string input to float (returns null for invalid parses)
const parseFloatValue = (s: string) => {
  const n = Number.parseFloat(s);
  return Number.isNaN(n) ? null : n;
};

const FloatInput: React.FC<FloatInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Validate the current input value against the field constraints
  const validate = React.useCallback(
    (input: string): string | null => {
      if (input.trim() === "") {
        return field.required ? t("Value required") : null;
      }

      if (!validFloatRegex.test(input)) {
        return t("Must be a valid float");
      }

      const parsedValue = parseFloatValue(input);
      if (parsedValue === null) return t("Must be a valid float");

      if (field.min !== undefined) {
        const tooLow = field.minInclusive
          ? parsedValue < field.min
          : parsedValue <= field.min;
        if (tooLow) {
          return t(
            "Must be {{1}} {{2}}",
            field.minInclusive ? "≥" : ">",
            field.min
          );
        }
      }

      if (field.max !== undefined) {
        const tooHigh = field.maxInclusive
          ? parsedValue > field.max
          : parsedValue >= field.max;
        if (tooHigh) {
          return t(
            "Must be {{1}} {{2}}",
            field.maxInclusive ? "≤" : "<",
            field.max
          );
        }
      }

      const err = validateFieldValue(definitionName, field, parsedValue, t);
      return err ?? null;
    },
    [field, definitionName, t]
  );

  const prevErrorRef = useRef<string | null>(null);
  const onErrorRef = useRef<FloatInputProps["onError"] | undefined>(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    const input = String(value ?? "");
    const err = validate(input);
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.value = input;
    }
  }, [value, field, validate, t]);

  // Handle user input change in the text box
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const err = validate(input);
    onChange?.(input, err);
  };

  return (
    <StandardFieldLayout field={field} error={validate(String(value ?? ""))}>
      <input
        id={field.name}
        type="text"
        defaultValue={String(value ?? "")}
        ref={inputRef}
        onChange={handleChange}
        className={combineClasses(
          CSS_CLASSES.input,
          CSS_CLASSES.inputNumber
        )}
        aria-invalid={!!validate(String(value ?? ""))}
        aria-describedby={validate(String(value ?? "")) ? `${field.name}-error` : undefined}
      />
    </StandardFieldLayout>
  );
};

export default FloatInput;
