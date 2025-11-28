/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useState } from "react";
import Tooltip from "../Tooltip";
import { StandardFieldLayout } from "../LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from "../../core/reactaFormTypes";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

export type DateTimeZoneField = DefinitionPropertyField & {
  // optional min/max in ISO date form (date part only): YYYY-MM-DD
  minDate?: string;
  maxDate?: string;
};

export type DateTimeZoneInputProps = BaseInputProps<string, DateTimeZoneField>;

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const formatOffset = (minutes: number) => {
  if (minutes === 0) return "Z";
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  const hrs = Math.floor(abs / 60);
  const mins = abs % 60;
  return `${sign}${pad(hrs)}:${pad(mins)}`;
};

// build timezone offset options from -12:00 to +14:00 stepping by 30 minutes
const buildOffsetOptions = () => {
  const options: { value: string; label: string }[] = [];
  for (let h = -12; h <= 14; h++) {
    for (const m of [0, 30]) {
      const total = h * 60 + m;
      // skip values beyond +14:00
      if (total > 14 * 60) continue;
      const val = formatOffset(total);
      options.push({ value: val, label: `UTC${val === "Z" ? "" : val}` });
      // don't duplicate the same hour twice for m=0 iteration when h=14
    }
  }
  // unique by value
  const uniq: { [k: string]: { value: string; label: string } } = {};
  options.forEach((o) => (uniq[o.value] = o));
  return Object.values(uniq);
};

const OFFSET_OPTIONS = buildOffsetOptions();

const parseValue = (val?: string) => {
  if (!val) return { date: "", time: "", tz: "Z" };
  // try to split YYYY-MM-DDTHH:MM and optional offset
  const m = val.match(
    /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(Z|[+-]\d{2}:\d{2})?$/
  );
  if (m) {
    return { date: m[1], time: m[2], tz: m[3] || "Z" };
  }
  // fallback: treat as date-only
  const dateOnly = val.match(/^(\d{4}-\d{2}-\d{2})$/);
  if (dateOnly) return { date: dateOnly[1], time: "00:00", tz: "Z" };
  return { date: "", time: "", tz: "Z" };
};

const DateTimeZoneInput: React.FC<DateTimeZoneInputProps> = ({
  field,
  value,
  onChange,
}) => {
  const { t } = useReactaFormContext();
  const [datePart, setDatePart] = useState<string>("");
  const [timePart, setTimePart] = useState<string>("00:00");
  const [tzPart, setTzPart] = useState<string>("Z");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parsed = parseValue(value);
    setDatePart(parsed.date);
    setTimePart(parsed.time || "00:00");
    setTzPart(parsed.tz || "Z");
  }, [value]);

  const validate = (d: string, tm: string) => {
    if (field.required && (!d || !tm)) return t("Value is required");
    // basic date bounds if present (compare date parts lexicographically is fine for YYYY-MM-DD)
    if (d) {
      if (field.minDate && d < field.minDate)
        return t("Date must be on or after {{1}}", field.minDate);
      if (field.maxDate && d > field.maxDate)
        return t("Date must be on or before {{1}}", field.maxDate);
    }
    return null;
  };

  const emitChange = (d: string, tm: string, tz: string) => {
    if (!d || !tm) {
      const err = validate(d, tm);
      setError(err);
      onChange?.("", err);
      return;
    }
    const combined = `${d}T${tm}${tz === "Z" ? "Z" : tz}`;
    const err = validate(d, tm);
    setError(err);
    onChange?.(combined, err);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = e.target.value;
    setDatePart(d);
    emitChange(d, timePart, tzPart);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tm = e.target.value;
    setTimePart(tm);
    emitChange(datePart, tm, tzPart);
  };

  const handleTzChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tz = e.target.value;
    setTzPart(tz);
    emitChange(datePart, timePart, tz);
  };

  return (
    <StandardFieldLayout field={field} error={error}>
      <div style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
        <input
          id={`${field.name}-date`}
          type="date"
          value={datePart}
          onChange={handleDateChange}
          style={{ flex: 1 }}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
          {...(field.minDate ? { min: field.minDate } : {})}
          {...(field.maxDate ? { max: field.maxDate } : {})}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.name}-error` : undefined}
        />

        <input
          id={`${field.name}-time`}
          type="time"
          value={timePart}
          onChange={handleTimeChange}
          style={{ flex: 1 }}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
          aria-invalid={!!error}
        />

        <select
          id={`${field.name}-tz`}
          value={tzPart}
          onChange={handleTzChange}
          style={{ width: 160 }}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.inputSelect)}
          aria-label={t("Timezone")}
        >
          {OFFSET_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {field.tooltip && <Tooltip content={field.tooltip} />}
      </div>
    </StandardFieldLayout>
  );
};

export default DateTimeZoneInput;
