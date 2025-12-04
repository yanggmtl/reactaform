// components/IntegerInput.tsx
import React, { useEffect, useRef, useCallback } from "react";
import type { ChangeEvent } from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import { validateFieldValue } from "../../core/validation";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

/**
 * IntegerInput component
 *
 * This component renders a controlled input field specifically for integer values.
 * It handles validation for required input, integer format, and optional min/max constraints,
 * with inclusive or exclusive boundaries. The component supports inline validation error
 * display and integrates with the Reacta form context for localization, styling, and field metadata.
 *
 * Props:
 * - field: The metadata describing the input field, including validation rules and display info.
 * - value: The current integer value to display.
 * - onChange: Callback invoked when the input changes, providing the parsed integer value and any validation error.
 * - parse: Function to parse string input into an integer.
 * - validNumberRegex: Regex pattern to validate the integer input format.
 * - typeName: Descriptive string for the value type (e.g., "integer") used in validation messages.
 *
 * Features:
 * - Validates input against integer format and required presence.
 * - Enforces min and max constraints with inclusive/exclusive options.
 * - Displays error messages inline below the input.
 * - Supports tooltips for additional user guidance.
 */
export type IntegerInputProps = BaseInputProps<string | number, DefinitionPropertyField>;

function isValidInteger(input: string) {
  // Regex to validate integer input (optional leading + or -)
  const validIntegerRegex = /^[-+]?\d*$/;
  return validIntegerRegex.test(input);
}

const IntegerInput: React.FC<IntegerInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Memoize parse function
  const parseInteger = useCallback((s: string) => {
    const n = parseInt(s, 10);
    return Number.isNaN(n) ? null : n;
  }, []);

  // Validate the current input value against the field constraints
  const validateCb = React.useCallback(
    (input: string): string | null => {
      if (input.trim() === "") {
        return field.required ? t("Value required") : null;
      }

      if (!isValidInteger(input)) {
        return t("Must be a valid integer");
      }

      const parsedValue = parseInteger(input);
      if (parsedValue === null) return t("Must be a valid integer");

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

      // Validate step increments for integer fields. If a step is provided and
      // is an integer, require the parsed value to be a multiple of the step.
      if (field.step !== undefined) {
        const stepVal = Number(field.step);
        if (!Number.isInteger(stepVal)) {
          // Non-integer step is invalid for IntegerInput
          return t("Invalid step value");
        }
        if (parsedValue % stepVal !== 0) {
          return t("Must be a multiple of {{1}}", stepVal);
        }
      }

      const err = validateFieldValue(definitionName, field, parsedValue, t);
      return err ?? null;
    },
    [field, definitionName, t, parseInteger]
  );

  const prevErrorRef = useRef<string | null>(null);
  const onErrorRef = useRef<IntegerInputProps["onError"] | undefined>(onError);

  // Keep a stable ref to the latest onError to avoid adding it to the effect deps
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    const input = String(value ?? "");
    const err = validateCb(input);

    // Report error changes to parent via optional onError callback.
    // We intentionally do NOT call onChange from this sync effect to avoid
    // creating an update loop; onChange should only be invoked from user
    // interactions (handleChange). We also avoid setting local UI state here
    // to satisfy the `react-hooks/set-state-in-effect` lint rule.
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
    // sync DOM value when prop changes (avoid clobbering while focused)
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.value = input;
    }
  }, [value, field, validateCb, t]);

  // Handle user input change in the text box
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const err = validateCb(input);
    onChange?.(input, err);
  };

  return (
    <StandardFieldLayout field={field} error={validateCb(String(value ?? ""))}>
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
      />
    </StandardFieldLayout>
  );
};

export default IntegerInput;
