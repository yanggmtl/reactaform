/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { ChangeEvent } from "react";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { validateFieldValue } from "../../core/validation";
import { StandardFieldLayout } from "../LayoutComponents";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

export interface PhoneInputField extends DefinitionPropertyField {
  pattern?: string;
}

export type PhoneInputProps = BaseInputProps<string, PhoneInputField>;

export const PhoneInput: React.FC<PhoneInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t } = useReactaFormContext();
  const [inputValue, setInputValue] = useState<string>(String(value ?? ""));
  const [error, setError] = useState<string | null>(null);

  const { definitionName } = useReactaFormContext();
  const isDisabled = field.disabled ?? false;

  const validateCb = useCallback(
    (val: string): string | null => {
      const raw = String(val ?? "").trim();
      if (raw === "") {
        return field.required ? t("Value required") : null;
      }
      if (field.pattern) {
        try {
          const re = new RegExp(field.pattern);
          if (!re.test(raw))
            return t(
              "Phone number does not match pattern: {{1}}",
              `${field.pattern}`
            );
        } catch {
          // invalid pattern, ignore
        }
      }
      return validateFieldValue(definitionName, field, raw, t);
    },
    [definitionName, field, t]
  );

  const prevErrorRef = useRef<string | null>(null);
  const onErrorRef = useRef<PhoneInputProps["onError"] | undefined>(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    const v = String(value ?? "");
    const err = validateCb(v);
    setInputValue(v);
    setError(err);
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
    // Add lint disable to avoid infinite loop; we only want to run this
    // when the external `value` prop or validator changes.
  }, [value, validateCb]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const newVal = e.target.value;
    const trimmedInput = newVal.trim();

    let err = null;
    if (trimmedInput === "") {
      err = field.required ? t("Value required") : null;
      // update local state and notify parent with the new (empty) value and error
      setInputValue(newVal);
      setError(err);
      onChange?.(newVal, err);
      return;
    }

    if (
      !err &&
      field.pattern &&
      !new RegExp(field.pattern).test(trimmedInput)
    ) {
      err = t("Phone number does not match pattern: {{1}}", `${field.pattern}`);
    }

    setInputValue(newVal);
    setError(err);
    // pass the fresh value to the parent (avoid stale state)
    onChange?.(newVal, err);
  };

  return (
    <StandardFieldLayout field={field} error={error}>
      <input
        type="tel"
        value={inputValue}
        onChange={handleChange}
        disabled={isDisabled}
        className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
      />
    </StandardFieldLayout>
  );
};

export default PhoneInput;
