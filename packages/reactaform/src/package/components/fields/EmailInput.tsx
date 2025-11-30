import React, { useEffect, useRef } from "react";
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
  const inputRef = useRef<HTMLInputElement | null>(null);

  const validate = React.useCallback(
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
      return err ?? null;
    },
    [field, definitionName, t]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const input = e.target.value;
    const err = validate(input);
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
    const err = validate(newVal);
    if (inputRef.current && inputRef.current.value !== String(newVal)) {
      inputRef.current.value = String(newVal);
    }
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
  }, [value, validate]);

  return (
    <StandardFieldLayout field={field} error={validate(String(value ?? ""))}>
      <input
        id={field.name}
        type="email"
        defaultValue={String(value ?? "")}
        ref={inputRef}
        onChange={handleChange}
        disabled={isDisabled}
        className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
      />
    </StandardFieldLayout>
  );
};

export default EmailInput;
