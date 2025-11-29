// components/SpinInput.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import type { ChangeEvent } from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import { validateFieldValue } from "../../core/validation";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

export interface SpinField extends DefinitionPropertyField {
  defaultValue: number;
  min?: number; // will default to 0
  max?: number; // will default to 100
  step?: number; // will default to 1
}

export type SpinInputProps = BaseInputProps<number, SpinField>;

// add optional onError for sync error reporting

const validIntRegex = /^[-+]?\d+$/;
const parseIntValue = (s: string) => Number.parseInt(s, 10);

const SpinInput: React.FC<SpinInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();
  const [inputValue, setInputValue] = useState<string>("");

  const deriveError = (s: string): string | null => {
    const trimmed = s.trim();
    if (trimmed === "") {
      return field.required ? t("Value required") : null;
    }
    if (!validIntRegex.test(trimmed)) {
      return t("Must be a valid integer");
    }
    const parsedValue = parseIntValue(trimmed);
    return validateCb(trimmed, parsedValue);
  };

  // Use default min=0 and max=100 if undefined
  const minVal = field.min ?? 0;
  const maxVal = field.max ?? 100;
  const step = Math.max(1, Math.round(field.step ?? 1)); // ensure step >= 1

  const validateCb = useCallback(
    (/*val*/ _: string, parsedValue: number): string | null => {
      if (isNaN(parsedValue)) {
        return t("Must be a valid integer");
      }

      if (!Number.isInteger(parsedValue)) {
        return t("Must be an integer");
      }

      if (parsedValue < minVal) {
        return t("Must be �?{{1}}", minVal);
      }

      if (parsedValue > maxVal) {
        return t("Must be �?{{1}}", maxVal);
      }

      const err = validateFieldValue(definitionName, field, parsedValue, t);
      return err ?? null;
    },
    [definitionName, field, t, minVal, maxVal]
  );

  const clampValue = (val: number) => {
    let clamped = val;
    clamped = Math.max(clamped, minVal);
    clamped = Math.min(clamped, maxVal);
    return Math.round(clamped);
  };

  const prevErrorRef = useRef<string | null>(null);
  const onErrorRef = useRef<SpinInputProps["onError"] | undefined>(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    const value1 = isNaN(value) ? "" : String(value);
    // sync input value from external prop when it changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputValue(value1);
    const err = validateCb(value1, value);
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
  }, [value, validateCb]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    const trimmedInput = newVal.trim();

    if (trimmedInput === "") {
      setInputValue(newVal);
      const err = field.required ? t("Value required") : null;
      onChange?.(NaN, err);
      return;
    }

    if (!validIntRegex.test(trimmedInput)) {
      const err = t("Must be a valid integer");
      setInputValue(newVal);
      onChange?.(NaN, err);
      return;
    }

    const parsedValue = parseIntValue(trimmedInput);
    const err = validateCb(trimmedInput, parsedValue);

    setInputValue(newVal);
    onChange?.(parsedValue, err);
  };

  const handleStepChange = (delta: number) => {
    const currentValue = isNaN(value)
      ? Math.round(field.defaultValue ?? minVal)
      : value;
    let newValue = currentValue + delta;

    // Clamp within min/max
    newValue = clampValue(newValue);

    const err = validateCb(String(newValue), newValue);
    setInputValue(String(newValue));
    onChange?.(newValue, err);
  };

  const error = deriveError(inputValue);

  return (
    <StandardFieldLayout field={field} error={error}>
      <div style={{ display: "flex", alignItems: "center", gap: "4px", width: "100%" }}>
        <input
          id={field.name}
          type="text"
          value={inputValue}
          onChange={handleChange}
          style={{ flex: 1 }}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "2.4em",
            border: "1px solid #ccc",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <button
            type="button"
            onClick={() => handleStepChange(step)}
            style={{
              flex: 1,
              fontSize: 10,
              padding: 0,
              margin: 0,
              lineHeight: 1,
              width: 20,
              border: "none",
              background: "#f0f0f0",
              cursor: "pointer",
            }}
            aria-label={t("Increment")}
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => handleStepChange(-step)}
            style={{
              flex: 1,
              fontSize: 10,
              padding: 0,
              margin: 0,
              lineHeight: 1,
              width: 20,
              border: "none",
              background: "#f0f0f0",
              cursor: "pointer",
            }}
            aria-label={t("Decrement")}
          >
            ▼
          </button>
        </div>
      </div>
    </StandardFieldLayout>
  );
};

export default SpinInput;
