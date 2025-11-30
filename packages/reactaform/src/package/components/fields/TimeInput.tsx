import type { ChangeEvent } from "react";
import React, { useEffect, useRef } from "react";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import { StandardFieldLayout } from "../LayoutComponents";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { validateFieldValue } from "../../core/validation";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

export type TimeField = DefinitionPropertyField & {
  Min?: string; // e.g. "08:00"
  Max?: string; // e.g. "17:00"
  // tooltip may already be on DefinitionPropertyField
};

type TimeInputProps = BaseInputProps<string, TimeField>;

const TimeInput: React.FC<TimeInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();
  const prevErrorRef = useRef<string | null>(null);
  const onErrorRef = useRef<TimeInputProps["onError"] | undefined>(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const validate = React.useCallback((val: string): string | null => {
    if (!val || val.trim() === "") {
      return (field.required ||field.Min || field.Max) ? t("Value required") : null;
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
    if (field.Min) {
      const minSec = toSeconds(field.Min);
      if (!Number.isNaN(minSec) && sec < minSec)
        return t("Time must be on or after {{1}}", field.Min);
    }
    if (field.Max) {
      const maxSec = toSeconds(field.Max);
      if (!Number.isNaN(maxSec) && sec > maxSec)
        return t("Time must be on or before {{1}}", field.Max);
    }
    const err = validateFieldValue(definitionName, field, val, t);
    return err ?? null;
  }, [field, definitionName, t]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    const err = validate(newVal);
    onChange?.(newVal, err);
  };

  useEffect(() => {
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
        step={1}
        onChange={handleChange}
        min={field.Min}
        max={field.Max}
        className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
      />
    </StandardFieldLayout>
  );
};

export default TimeInput;
