import * as React from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { DefinitionPropertyField, BaseInputProps } from "../../core/reactaFormTypes";
import { validateField } from "../../validation/validation";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

export type SpinInputProps = BaseInputProps<number, DefinitionPropertyField>;

const validIntRegex = /^[-+]?\d+$/;

const SpinInput: React.FC<SpinInputProps> = ({ field, value, onChange, onError }) => {
  const { t, definitionName } = useReactaFormContext();

  // Controlled state
  const [inputValue, setInputValue] = React.useState(() => 
    !isNaN(value) && value !== null && value !== undefined ? String(value) : ""
  );

  // Sync with props
  React.useEffect(() => {
    const newVal = !isNaN(value) && value !== null && value !== undefined ? String(value) : "";
    setInputValue(newVal);
  }, [value]);

  // Constraints
  const minVal = field.min ?? 0;
  const maxVal = field.max ?? 100;
  const step = Math.max(1, Math.round(field.step ?? 1));

  const clampValue = React.useCallback((val: number) => {
    return Math.round(Math.max(minVal, Math.min(maxVal, val)));
  }, [minVal, maxVal]);

  // Validation
  const validate = React.useCallback(
    (input: string): string | null => {
      const trimmed = input.trim();
      if (trimmed === "") {
        return field.required ? t("Value required") : null;
      }
      if (!validIntRegex.test(trimmed)) {
        return t("Must be a valid integer");
      }
      const parsedValue = parseInt(trimmed, 10);
      if (isNaN(parsedValue)) {
        return t("Must be a valid integer");
      }
      if (!Number.isInteger(parsedValue)) {
        return t("Must be an integer");
      }
      if (parsedValue < minVal) {
        return t("Must be ≥ {{1}}", minVal);
      }
      if (parsedValue > maxVal) {
        return t("Must be ≤ {{1}}", maxVal);
      }
      return validateField(definitionName, field, parsedValue, t) ?? null;
    },
    [definitionName, field, t, minVal, maxVal]
  );

  const error = React.useMemo(() => validate(inputValue), [inputValue, validate]);

  // Notify parent of errors
  React.useEffect(() => {
    onError?.(error);
  }, [error, onError]);

  // Handlers
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = e.target.value;
      setInputValue(newVal);

      const trimmed = newVal.trim();
      if (trimmed === "") {
        onChange?.(NaN);
        return;
      }

      if (!validIntRegex.test(trimmed)) {
        onChange?.(NaN);
        return;
      }

      const parsedValue = parseInt(trimmed, 10);
      validate(newVal);
      onChange?.(parsedValue);
    },
    [validate, onChange]
  );

  const handleStepChange = React.useCallback(
    (delta: number) => {
      const currentValue = !isNaN(value) ? value : Math.round(Number(field.defaultValue ?? minVal));
      const newValue = clampValue(currentValue + delta);
      const newValueStr = String(newValue);
      
      setInputValue(newValueStr);
      validate(newValueStr);
      onChange?.(newValue);
    },
    [value, field.defaultValue, minVal, clampValue, validate, onChange]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handleStepChange(step);
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleStepChange(-step);
          break;
        case 'PageUp':
          e.preventDefault();
          handleStepChange(step * 10);
          break;
        case 'PageDown':
          e.preventDefault();
          handleStepChange(-step * 10);
          break;
      }
    },
    [step, handleStepChange]
  );

  return (
    <StandardFieldLayout field={field} error={error}>
      <div style={{ display: "flex", alignItems: "center", gap: "4px", width: "100%" }}>
        <input
          id={field.name}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
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
            border: "1px solid var(--reactaform-border-color, #ccc)",
            borderRadius: "var(--reactaform-border-radius, 2px)",
            overflow: "hidden",
          }}
        >
          <button
            type="button"
            onClick={() => handleStepChange(step)}
            style={{
              flex: 1,
              fontSize: "0.625rem",
              padding: 0,
              margin: 0,
              lineHeight: 1,
              width: "1.25rem",
              border: "none",
              background: "var(--reactaform-secondary-bg, #f0f0f0)",
              cursor: "pointer",
              color: "var(--reactaform-text-color, inherit)",
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
              fontSize: "0.625rem",
              padding: 0,
              margin: 0,
              lineHeight: 1,
              width: "1.25rem",
              border: "none",
              background: "var(--reactaform-secondary-bg, #f0f0f0)",
              cursor: "pointer",
              color: "var(--reactaform-text-color, inherit)",
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
