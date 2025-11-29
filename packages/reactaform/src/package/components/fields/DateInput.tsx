import React, { useEffect, useRef } from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";

// Concrete field type for DateInput — includes optional min/max date strings
export type DateField = DefinitionPropertyField & {
  minDate?: string;
  maxDate?: string;
};
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { validateFieldValue } from "../../core/validation";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

type DateInputProps = BaseInputProps<string, DateField>;

/**
 * Safely parse a date string into a Date object.
 * Returns null if invalid or empty.
 */
const parseDate = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Safely format a value for the HTML date input.
 * Returns empty string if the value is not a valid date format.
 */
const formatDateForInput = (dateValue?: string): string => {
  if (!dateValue) return "";

  // Check if it's already in yyyy-MM-dd format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (dateRegex.test(dateValue)) {
    // Verify it's actually a valid date
    const parsed = parseDate(dateValue);
    return parsed ? dateValue : "";
  }

  // Try to parse and format other date strings
  const parsed = parseDate(dateValue);
  if (parsed) {
    // Format as yyyy-MM-dd
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return "";
};

/**
 * DateInput Component
 * -------------------
 * Controlled date input for ReactaForm.
 */
const DateInput: React.FC<DateInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();
  const { name, required } = field;

  const prevErrorRef = useRef<string | null>(null);
  const onErrorRef = useRef<DateInputProps["onError"] | undefined>(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  /**
   * Validate the current value.
   */
  const validate = (dateValue: string): string | null => {
    if (!dateValue || dateValue.trim() === "") {
      return required ? t("Value is required") : null;
    }

    if (dateValue) {
      const parsed = parseDate(dateValue);
      if (!parsed) return t("Invalid date format");
      // enforce min/max if configured on the field
      if (field.minDate) {
        const minParsed = parseDate(field.minDate);
        if (minParsed && parsed.getTime() < minParsed.getTime()) {
          return t("Date must be on or after {{1}}", field.minDate);
        }
      }

      if (field.maxDate) {
        const maxParsed = parseDate(field.maxDate);
        if (maxParsed && parsed.getTime() > maxParsed.getTime()) {
          return t("Date must be on or before {{1}}", field.maxDate);
        }
      }
    }

    // run any field-level validation handler
    const err = validateFieldValue(definitionName, field, dateValue, t);
    return err ?? null;
  };

  /**
   * Handle user input change.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    const err = validate(newDate);
    onChange?.(newDate, err);
  };

  /**
   * Revalidate when external value or field rules change.
   */
  useEffect(() => {
    // Re-validate when external value or required constraint changes.
    const err = validate(value);
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, required]);

  return (
    <StandardFieldLayout field={field} error={validate(value)}>
      <input
        id={name}
        type="date"
        value={formatDateForInput(value)}
        onChange={handleChange}
        className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
        {...(field.minDate ? { min: field.minDate } : {})}
        {...(field.maxDate ? { max: field.maxDate } : {})}
        aria-invalid={!!validate(value)}
        aria-describedby={validate(value) ? `${name}-error` : undefined}
      />
    </StandardFieldLayout>
  );
};

export default DateInput;
