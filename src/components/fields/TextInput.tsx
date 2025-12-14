import React, { useEffect, useMemo } from "react";
import type { ChangeEvent } from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import { validateFieldValue } from "../../core/validation";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

// ------------------ Types ------------------

type TextInputProps = BaseInputProps<string, DefinitionPropertyField>;

// ------------------ Component ------------------

const TextInput: React.FC<TextInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const prevErrorRef = React.useRef<string | null>(null);
  const onErrorRef = React.useRef<TextInputProps["onError"] | undefined>(
    onError
  );
  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Memoize regex pattern compilation
  const patternRegex = useMemo(
    () => field.pattern ? new RegExp(field.pattern) : null,
    [field.pattern]
  );

  const validate = React.useCallback(
    (val: string): string | null => {
      if (val.trim() === "") {
        return field.required ? t("Value required") : null;
      }
      if (field.minLength !== undefined && val.length < field.minLength) {
        return t("Must be at least {{1}} characters", field.minLength);
      }
      if (field.maxLength !== undefined && val.length > field.maxLength) {
        return t("Must be at most {{1}} characters", field.maxLength);
      }
      if (patternRegex && !patternRegex.test(val)) {
        return field.patternErrorMessage ? t(field.patternErrorMessage) : t("Input does not match pattern: {{1}}", field.pattern);
      }
      return validateFieldValue(definitionName, field, val, t);
    },
    [field, definitionName, t, patternRegex]
  );

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value;
    const err = validate(newValue);
    onChange?.(newValue, err);
  };

  useEffect(() => {
    // Validate on initial mount or when value changes; notify parent via onErrorRef
    const err = validate(value);
    if (inputRef.current && inputRef.current.value !== String(value ?? "")) {
      inputRef.current.value = String(value ?? "");
    }
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
    return undefined;
  }, [value, validate]);

  return (
    <StandardFieldLayout field={field} error={validate(String(value ?? ""))}>
      <input
        id={field.name}
        aria-invalid={!!validate(String(value ?? ""))}
        aria-describedby={validate(String(value ?? "")) ? `${field.name}-error` : undefined}
        type="text"
        defaultValue={String(value ?? "")}
        ref={inputRef}
        onChange={handleChange}
        className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
      />
    </StandardFieldLayout>
  );
};

export default TextInput;
