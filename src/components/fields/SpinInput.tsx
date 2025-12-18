// components/SpinInput.tsx
import * as React from "react";
import type { ChangeEvent } from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import { validateFieldValue } from "../../core/validation";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

export type SpinInputProps = BaseInputProps<number, DefinitionPropertyField>;

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
  const inputRef = React.useRef<HTMLInputElement | null>(null);

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

  const validateCb = React.useCallback(
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

  const prevErrorRef = React.useRef<string | null>(null);
  const onErrorRef = React.useRef<SpinInputProps["onError"] | undefined>(onError);
  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  React.useEffect(() => {
    const value1 = isNaN(value) ? "" : String(value);
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.value = value1;
    }
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
      const err = field.required ? t("Value required") : null;
      onChange?.(NaN, err);
      return;
    }

    if (!validIntRegex.test(trimmedInput)) {
      const err = t("Must be a valid integer");
      onChange?.(NaN, err);
      return;
    }

    const parsedValue = parseIntValue(trimmedInput);
    const err = validateCb(trimmedInput, parsedValue);

    onChange?.(parsedValue, err);
  };

  const handleStepChange = (delta: number) => {
    const currentValue = isNaN(value)
      ? Math.round(Number(field.defaultValue ?? minVal))
      : value;
    let newValue = currentValue + delta;

    // Clamp within min/max
    newValue = clampValue(newValue);

    const err = validateCb(String(newValue), newValue);
    if (inputRef.current) inputRef.current.value = String(newValue);
    onChange?.(newValue, err);
  };

  const error = deriveError(String(value ?? ""));

  return (
    <StandardFieldLayout field={field} error={error}>
      <div style={{ display: "flex", alignItems: "center", gap: "4px", width: "100%" }}>
        <input
          id={field.name}
          type="text"
          defaultValue={String(value ?? "")}
          ref={inputRef}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              handleStepChange(step);
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              handleStepChange(-step);
            } else if (e.key === 'PageUp') {
              e.preventDefault();
              handleStepChange(step * 10);
            } else if (e.key === 'PageDown') {
              e.preventDefault();
              handleStepChange(-step * 10);
            }
          }}
          style={{ flex: 1 }}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.name}-error` : undefined}
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
