/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useState, useRef } from "react";
import type { ChangeEvent } from "react";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { StandardFieldLayout } from "../LayoutComponents";
import { validateFieldValue } from "../../core/validation";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

export interface EmailInputField extends DefinitionPropertyField {
  pattern?: string;
}

export type EmailInputProps = BaseInputProps<string, EmailInputField>;

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const EmailInput: React.FC<EmailInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { definitionName, t } = useReactaFormContext();
  const isDisabled = field.disabled ?? false;
  const [inputValue, setInputValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const validateCb = React.useCallback(
    (input: string): string | null => {
      const trimmedInput = input.trim();
      if (trimmedInput === "")
        return field.required ? t("Value required") : null;

      if (!isValidEmail(trimmedInput)) return t("Must be valid email format");

      if (field.pattern && !new RegExp(field.pattern).test(trimmedInput)) {
        return t(`Email does not match pattern: {{%1}}`, {
          "%1": `${field.pattern}`,
        });
      }

      const err = validateFieldValue(definitionName, field, input, t);

      return err ? err : null;
    },
    [field, definitionName, t]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const input = e.target.value;
    const err = validateCb(input);
    setInputValue(input);
    setError(err);
    // pass the fresh value (not the stale state) to the parent
    onChange?.(input, err);
  };

  const prevErrorRef = useRef<string | null>(null);
  const onErrorRef = useRef<EmailInputProps["onError"] | undefined>(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    const newVal = value ?? "";
    const err = validateCb(newVal);
    setInputValue(newVal);
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
        type="email"
        value={inputValue}
        onChange={handleChange}
        disabled={isDisabled}
        className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
      />
    </StandardFieldLayout>
  );
};

export default EmailInput;
