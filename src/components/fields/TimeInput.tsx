import type { ChangeEvent } from "react";
import * as React from "react";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import { StandardFieldLayout } from "../LayoutComponents";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { validateFieldValue } from "../../core/validation";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

type TimeInputProps = BaseInputProps<string, DefinitionPropertyField>;

const TimeInput: React.FC<TimeInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();
  const prevErrorRef = React.useRef<string | null>(null);
  const onErrorRef = React.useRef<TimeInputProps["onError"] | undefined>(onError);
  // Default to including seconds so the input supports HH:MM:SS by default
  const includeSeconds = field.includeSeconds ?? true;
  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const validate = React.useCallback((val: string): string | null => {
    if (!val || val.trim() === "") {
      return (field.required || field.min || field.max) ? t("Value required") : null;
    }
    // Time comparison: treat as HH:MM or HH:MM:SS; compare lexicographically when zero-padded
    const toSeconds = (s: string) => {
      const parts = s.split(":").map((p) => parseInt(p, 10));
      if (parts.some((n) => Number.isNaN(n))) return NaN;
      let seconds = 0;
      if (parts.length === 3) {
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        seconds = parts[0] * 3600 + parts[1] * 60;
      } else if (parts.length === 1) {
        seconds = parts[0] * 3600;
      } else {
        return NaN;
      }
      return seconds;
    };

    const sec = toSeconds(val);
    if (Number.isNaN(sec)) return t("Invalid time format");
    if (field.min && typeof field.min === 'string') {
      const minSec = toSeconds(field.min);
      if (!Number.isNaN(minSec) && sec < minSec)
        return t("Time must be on or after {{1}}", field.min);
    }
    if (field.max && typeof field.max === 'string') {
      const maxSec = toSeconds(field.max);
      if (!Number.isNaN(maxSec) && sec > maxSec)
        return t("Time must be on or before {{1}}", field.max);
    }
    const err = validateFieldValue(definitionName, field, val, t);
    return err ?? null;
  }, [field, definitionName, t]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    const err = validate(newVal);
    onChange?.(newVal, err);
  };

  React.useEffect(() => {
    const err = validate(value);
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
  }, [value, validate]);

  return (
    <StandardFieldLayout field={field} error={validate(value)}>
      <input
        id={field.name}
        type="time"
        value={value}
        step={includeSeconds ? 1 : 60}
        onChange={handleChange}
        min={typeof field.min === 'string' ? field.min : undefined}
        max={typeof field.max === 'string' ? field.max : undefined}
        className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
        aria-invalid={!!validate(value)}
        aria-describedby={validate(value) ? `${field.name}-error` : undefined}
      />
    </StandardFieldLayout>
  );
};

export default TimeInput;
