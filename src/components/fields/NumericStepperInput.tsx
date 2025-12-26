// components/SpinInput.tsx
import * as React from "react";
import type { ChangeEvent } from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import { validateFieldValue } from "../../core/validation";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES } from "../../utils/cssClasses";

export type NumericStepperInputProps = BaseInputProps<number, DefinitionPropertyField>;

const NumericStepperInput: React.FC<NumericStepperInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Use default min=0 and max=100 if undefined
  const minVal = field.min ?? undefined;
  const maxVal = field.max ?? undefined;
  const step = Math.max(1, Math.round(field.step ?? 1)); // ensure step >= 1

  const validateCb = React.useCallback(
    (value: number): string | null => {
      if (isNaN(value)) {
        return t("Must be a valid integer");
      }

      if (!Number.isInteger(value)) {
        return t("Must be an integer");
      }

      if (minVal !== undefined && value < minVal) {
        return t("Must be ≥ {{1}}", minVal);
      }

      if (maxVal !== undefined && value > maxVal) {
        return t("Must be ≤ {{1}}", maxVal);
      }

      const err = validateFieldValue(definitionName, field, value, t);
      return err ?? null;
    },
    [definitionName, field, t, minVal, maxVal]
  );

  const prevErrorRef = React.useRef<string | null>(null);
  const onErrorRef = React.useRef<NumericStepperInputProps["onError"] | undefined>(
    onError
  );
  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  React.useEffect(() => {
    const active = document.activeElement;
    if (active === inputRef.current) return;
    const str = String(value);
    const err = validateCb(value);
    if (inputRef.current) inputRef.current.value = str;
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
  }, [value, validateCb]);

  const validateFromString = (s: string): string | null => {
    const trimmed = s.trim();
    if (trimmed === "") return field.required ? t("Value required") : null;
    const n = Number(s);
    return validateCb(n);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value;
    const num = e.target.valueAsNumber;
    const err = validateFromString(newInput);
    onChange?.(num, err);
  };

  const error = validateFromString(String(value ?? ""));

  return (
    <StandardFieldLayout field={field} error={error}>
      <input
        ref={inputRef}
        id={field.name}
        type="number"
        defaultValue={String(value ?? "")}
        min={minVal}
        max={maxVal}
        step={step}
        onChange={handleChange}
        style={{ width: "100%", height: "100%" }}
        className={CSS_CLASSES.input}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.name}-error` : undefined}
      />
    </StandardFieldLayout>
  );
};

export default NumericStepperInput;
