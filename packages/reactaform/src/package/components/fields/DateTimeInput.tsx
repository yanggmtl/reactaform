import React, { useEffect, useState } from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from "../../core/reactaFormTypes";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { validateFieldValue } from "../../core/validation";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

// Define field shape
export type DateTimeField = DefinitionPropertyField & {
  // min/max expected as ISO date-time strings or date-only strings (YYYY-MM-DD)
  min?: string;
  max?: string;
};

export type DateTimeInputProps = BaseInputProps<string, DateTimeField>;

const DateTimeInput: React.FC<DateTimeInputProps> = ({
  field,
  value,
  onChange,
}) => {
  const { t, definitionName } = useReactaFormContext();
  const [datePart, setDatePart] = useState<string>(value ? value.split("T")[0] : "");
  const [timePart, setTimePart] = useState<string>(value ? value.split("T")[1] || "00:00" : "");

  // Split external value into date/time parts. Synchronize local parts from
  // `value` prop so inputs update when parent changes the value.
  useEffect(() => {
    if (value) {
      const [date, time] = value.split("T");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDatePart(date || "");
       
      setTimePart(time || "00:00");
    } else {
       
      setDatePart("");
       
      setTimePart("");
    }
    // re-validate on external prop change
  }, [value, field.min, field.max]);

  // Combine date/time into ISO-like string. If date exists but time is
  // empty, return `YYYY-MM-DDT` (trailing T) �?tests and consumers expect
  // this form so callers can distinguish an explicit empty time.
  const combine = (d: string, tm: string) => {
    if (!d) return "";
    return `${d}T${tm}`;
  };

  const parseToDate = (iso?: string) => {
    if (!iso) return null;
    const parsed = new Date(iso);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const validateParts = (isoValue: string) => {
    if (!isoValue) {
      return field.required ? t("Value is required") : null;
    }

    if (isoValue) {
      // allow a partial value that ends with 'T' (date with empty time)
      if (/^\d{4}-\d{2}-\d{2}T$/.test(isoValue)) return null;
      const parsed = parseToDate(isoValue);
      if (!parsed) return t("Invalid date/time");
      if (field.min) {
        const minParsed = parseToDate(field.min);
        if (minParsed && parsed.getTime() < minParsed.getTime()) {
          return t("Date/time must be on or after {{1}}", field.min);
        }
      }
      if (field.max) {
        const maxParsed = parseToDate(field.max);
        if (maxParsed && parsed.getTime() > maxParsed.getTime()) {
          return t("Date/time must be on or before {{1}}", field.max);
        }
      }
    }
    const err = validateFieldValue(definitionName, field, isoValue, t);
    return err ?? null;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDatePart(newDate);
    const combined = combine(newDate, timePart);
    const err = validateParts(combined);
    onChange?.(combined, err);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimePart(newTime);
    const combined = combine(datePart, newTime);
    const err = validateParts(combined);
    onChange?.(combined, err);
  };

  return (
    <StandardFieldLayout field={field} error={validateParts(combine(datePart, timePart))}>
      <div style={{ display: "flex", gap: "8px", width: "100%" }}>
        <input
          type="date"
          value={datePart}
          onChange={handleDateChange}
          // Use flexible sizing so the control fits the parent column. minWidth:0
          // ensures the control can shrink inside a flex container without forcing
          // overflow; flex: '1 1 0' allows equal sharing of available space.
          style={{ flex: 1, minWidth: 0 }}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
          aria-invalid={!!validateParts(combine(datePart, timePart))}
          aria-describedby={validateParts(combine(datePart, timePart)) ? `${field.name}-error` : undefined}
        />

        <input
          type="time"
          value={timePart}
          onChange={handleTimeChange}
          step={1}
          style={{ flex: 1, minWidth: 0 }}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
          aria-invalid={!!validateParts(combine(datePart, timePart))}
        />
      </div>
    </StandardFieldLayout>
  );
};

export default DateTimeInput;
