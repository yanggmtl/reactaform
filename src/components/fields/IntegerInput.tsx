// components/IntegerInput.tsx
import * as React from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import { validateFieldValue } from "../../core/validation";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

/**
 * IntegerInput component
 *
 * Props:
 * - field: The metadata describing the input field, including validation rules and display info.
 * - value: The current integer value to display.
 * - onChange: Callback invoked when the input changes, providing the parsed integer value and any validation error.
 *
 * Features:
 * - Validates input against integer format and required presence.
 * - Enforces min and max constraints with inclusive/exclusive options.
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
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Validate the current input value against the field constraints
  const validateCb = React.useCallback(
    (input: string): string | null => {
      if (input.trim() === "") {
        return field.required ? t("Value required") : null;
      }

      // Check integer format. This is needed because parseInt will parse partial strings.
      if (!isValidInteger(input)) {
        return t("Must be a valid integer");
      }

      const parsedValue = parseInt(input, 10);
      if (Number.isNaN(parsedValue)) return t("Must be a valid integer");

      // Check min constraints
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

      // Check max constraints
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
    [field, definitionName, t]
  );

  const prevErrorRef = React.useRef<string | null>(null);
  const onErrorRef = React.useRef<IntegerInputProps["onError"] | undefined>(onError);

  // Keep a stable ref to the latest onError to avoid adding it to the effect deps
  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  React.useEffect(() => {
    const input = String(value ?? "");
    const err = validateCb(input);

    // Report error changes to parent via optional onError callback.
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const err = validateCb(input);
    onChange?.(input, err);
  };

  const error = validateCb(String(value ?? ""));

  return (
    <StandardFieldLayout field={field} error={error}>
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
        aria-invalid={!!error}
        aria-describedby={error ? `${field.name}-error` : undefined}
      />
    </StandardFieldLayout>
  );
};

export default IntegerInput;
