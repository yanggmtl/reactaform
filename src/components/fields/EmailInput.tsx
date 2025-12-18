import * as React from "react";
import type { DefinitionPropertyField, BaseInputProps } from "../../core/reactaFormTypes";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { StandardFieldLayout } from "../LayoutComponents";
import { validateFieldValue } from "../../core/validation";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

export type EmailInputProps = BaseInputProps<string, DefinitionPropertyField>;

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
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const validate = React.useCallback(
    (input: string): string | null => {
      const trimmedInput = input.trim();
      if (trimmedInput === "")
        return field.required ? t("Value required") : null;

      if (!isValidEmail(trimmedInput)) return t("Must be valid email format");

      if (field.pattern && !new RegExp(field.pattern).test(trimmedInput)) {
        if (field.patternErrorMessage) 
          return t(field.patternErrorMessage);
        return t(`Email does not match pattern: {{%1}}`, {
          "%1": `${field.pattern}`,
        });
      }

      const err = validateFieldValue(definitionName, field, input, t);
      return err ?? null;
    },
    [field, definitionName, t]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const err = validate(input);
    // pass the fresh value (not the stale state) to the parent
    onChange?.(input, err);
  };

  const prevErrorRef = React.useRef<string | null>(null);
  const onErrorRef = React.useRef<EmailInputProps["onError"] | undefined>(onError);
  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  React.useEffect(() => {
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
        className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
        aria-invalid={!!validate(String(value ?? ""))}
        aria-describedby={validate(String(value ?? "")) ? `${field.name}-error` : undefined}
      />
    </StandardFieldLayout>
  );
};

export default EmailInput;
