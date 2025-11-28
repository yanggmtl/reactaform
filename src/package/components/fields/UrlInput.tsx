/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { ChangeEvent } from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import { validateFieldValue } from "../../core/validation";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

/**
 * UrlInput component
 *
 * This component provides a controlled input field for URL values.
 * It validates required fields, URL format, and integrates with Reacta form context.
 *
 * Props:
 * - field: Field metadata (name, displayName, tooltip, validation rules).
 * - value: Current URL string.
 * - onChange: Callback called with (value, error).
 *
 * Features:
 * - Validates using a robust URL regex and `URL` constructor fallback.
 * - Supports tooltip, localization, and inline validation errors.
 */
export interface UrlField extends DefinitionPropertyField {
  defaultValue: string;
}

export type UrlInputProps = BaseInputProps<string, UrlField>;

// Simple URL validation (accepts http(s), ftp, file, etc.)
const urlRegex =
  /^(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|]$/i;

// Alternative: also validate via URL constructor for stricter checks
const isValidUrl = (s: string): boolean => {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
};

const UrlInput: React.FC<UrlInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();
  const [inputValue, setInputValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const isDisabled = field.disabled ?? false;

  // Validation logic
  const validateCb = useCallback(
    (input: string): string | null => {
      const trimmed = input.trim();

      if (trimmed === "") {
        return field.required ? t("Value required") : null;
      }

      if (!urlRegex.test(trimmed) && !isValidUrl(trimmed)) {
        return t("Must be a valid URL");
      }

      const err = validateFieldValue(definitionName, field, trimmed, t);
      return err || null;
    },
    [definitionName, field, t]
  );

  // Handle user typing
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const newVal = e.target.value;
    setInputValue(newVal);

    const err = validateCb(newVal);
    setError(err);
    onChange?.(newVal.trim(), err);
  };

  // Sync value changes from parent
  const prevErrorRef = useRef<string | null>(null);
  const onErrorRef = useRef<UrlInputProps["onError"] | undefined>(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    setInputValue(value ?? "");
    const err = validateCb(value ?? "");
    setError(err);
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
  }, [value, validateCb]);

  return (
    <StandardFieldLayout field={field} error={error}>
      <input
        id={field.name}
        type="url"
        value={inputValue}
        onChange={handleChange}
        disabled={isDisabled}
        style={{ alignItems: "left" }}
        className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
        placeholder="https://example.com"
      />
    </StandardFieldLayout>
  );
};

export default UrlInput;
