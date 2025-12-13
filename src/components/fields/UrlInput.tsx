import React, { useEffect, useCallback, useRef } from "react";
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
export type UrlInputProps = BaseInputProps<string, DefinitionPropertyField>;

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
  // uncontrolled input: DOM holds transient user edits; use a ref
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Validation logic
  const validateCb = useCallback(
    (input: string): string | null => {
      const trimmed = input.trim();

      if (trimmed === "") {
        return field.required ? t("Value required") : null;
      }

      if (!urlRegex.test(trimmed) && !isValidUrl(trimmed)) {
        // Allow relative URLs when field.allowRelative is true. Use the URL
        // constructor with a base to validate relative paths safely.
        const allowRelative = field.allowRelative === true;
        let valid = false;
        if (urlRegex.test(trimmed) || isValidUrl(trimmed)) {
          valid = true;
        } else if (allowRelative) {
          try {
            new URL(trimmed, "http://example.com");
            valid = true;
          } catch {
            valid = false;
          }
        }

        if (!valid) return t("Must be a valid URL");
      }

      const err = validateFieldValue(definitionName, field, trimmed, t);
      return err ?? null;
    },
    [definitionName, field, t]
  );

  // Handle user typing
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;

    const err = validateCb(newVal);
    onChange?.(newVal.trim(), err);
  };

  // Sync value changes from parent
  const prevErrorRef = useRef<string | null>(null);
  const onErrorRef = useRef<UrlInputProps["onError"] | undefined>(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    const v = value ?? "";
    const err = validateCb(v);
    if (inputRef.current && inputRef.current.value !== String(v)) {
      inputRef.current.value = String(v);
    }
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
    return undefined;
  }, [value, validateCb]);

  return (
    <StandardFieldLayout field={field} error={validateCb(String(value ?? ""))}>
      <input
        id={field.name}
        type="url"
        defaultValue={String(value ?? "")}
        ref={inputRef}
        onChange={handleChange}
        style={{ alignItems: "left" }}
        className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
        placeholder="https://example.com"
      />
    </StandardFieldLayout>
  );
};

export default UrlInput;
