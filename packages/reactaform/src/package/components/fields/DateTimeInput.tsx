import React, { useEffect } from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from "../../core/reactaFormTypes";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { validateFieldValue } from "../../core/validation";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

export type DateTimeInputProps = BaseInputProps<string, DefinitionPropertyField>;

const DateTimeInput: React.FC<DateTimeInputProps> = ({
  field,
  value,
  onChange,
}) => {
  const { t, definitionName } = useReactaFormContext();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const timeRef = React.useRef<HTMLInputElement | null>(null);
  const prevErrorRef = React.useRef<string | null>(null);
  const onErrorRef = React.useRef<typeof onChange | undefined>(undefined);

  React.useEffect(() => {
    onErrorRef.current = onChange;
  }, [onChange]);

  const parseToDate = (iso?: string) => {
    if (!iso) return null;
    const parsed = new Date(iso);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const validateParts = React.useCallback((isoValue: string) => {
    if (!isoValue) {
      return field.required ? t("Value is required") : null;
    }

    if (isoValue) {
      // allow a partial value that ends with 'T' (date with empty time)
      if (/^\d{4}-\d{2}-\d{2}T$/.test(isoValue)) return null;
      const parsed = parseToDate(isoValue);
      if (!parsed) return t("Invalid date/time");
      if (field.min && typeof field.min === 'string') {
        const minParsed = parseToDate(field.min);
        if (minParsed && parsed.getTime() < minParsed.getTime()) {
          return t("Date/time must be on or after {{1}}", field.min);
        }
      }
      if (field.max && typeof field.max === 'string') {
        const maxParsed = parseToDate(field.max);
        if (maxParsed && parsed.getTime() > maxParsed.getTime()) {
          return t("Date/time must be on or before {{1}}", field.max);
        }
      }
    }
    const err = validateFieldValue(definitionName, field, isoValue, t);
    return err ?? null;
  }, [definitionName, field, t]);

  // Synchronize DOM inputs from external `value` prop when it changes.
  useEffect(() => {
    const active = document.activeElement;
    if (active === inputRef.current || active === timeRef.current) {
      return;
    }

    const val = value ?? "";
    const [date = "", time = ""] = val ? val.split("T") : ["", ""];

    if (inputRef.current) inputRef.current.value = date || "";
    if (timeRef.current) timeRef.current.value = date && !time ? "00:00" : time || "";

    const combined = date ? `${date}T${time || ""}` : "";
    const err = validateParts(combined);
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(combined, err);
    }
  }, [value, field.min, field.max, validateParts]);

  // Combine date/time into ISO-like string. If date exists but time is
  // empty, return `YYYY-MM-DDT` (trailing T) �?tests and consumers expect
  // this form so callers can distinguish an explicit empty time.
  const combine = (d: string, tm: string) => {
    if (!d) return "";
    return `${d}T${tm}`;
  };

  

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    const timePartVal = timeRef.current ? timeRef.current.value : "";
    const combined = combine(newDate, timePartVal);
    const err = validateParts(combined);
    onChange?.(combined, err);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    const datePartVal = inputRef.current ? inputRef.current.value : "";
    const combined = combine(datePartVal, newTime);
    const err = validateParts(combined);
    onChange?.(combined, err);
  };

  return (
    <StandardFieldLayout field={field} error={validateParts(value ?? "")}> 
      <div style={{ display: "flex", gap: "8px", width: "100%" }}>
        <input
          ref={inputRef}
          type="date"
          defaultValue={value ? value.split("T")[0] : ""}
          onChange={handleDateChange}
          // Use flexible sizing so the control fits the parent column. minWidth:0
          // ensures the control can shrink inside a flex container without forcing
          // overflow; flex: '1 1 0' allows equal sharing of available space.
          style={{ flex: 1, minWidth: 0 }}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
          aria-invalid={!!validateParts(value ?? "")}
          aria-describedby={validateParts(value ?? "") ? `${field.name}-error` : undefined}
        />

        <input
          ref={timeRef}
          type="time"
          defaultValue={value ? value.split("T")[1] || "00:00" : ""}
          onChange={handleTimeChange}
          step={1}
          style={{ flex: 1, minWidth: 0 }}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
          aria-invalid={!!validateParts(value ?? "")}
        />
      </div>
    </StandardFieldLayout>
  );
};

export default DateTimeInput;
