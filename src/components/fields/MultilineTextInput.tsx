import React, { useEffect } from "react";
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

const MultilineTextInput: React.FC<TextInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();
  const height = field.minHeight ?? "80px";
  // Use an uncontrolled textarea so the DOM holds the user's transient
  // edits while we still notify parent via `onChange`. Keep a ref so
  // external prop updates can overwrite the DOM value when needed.
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);

  const prevErrorRef = React.useRef<string | null>(null);
  const onErrorRef = React.useRef<TextInputProps["onError"] | undefined>(
    onError
  );
  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

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
      return validateFieldValue(definitionName, field, val, t);
    },
    [field, definitionName, t]
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
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
    // If parent changed value externally, update the DOM value so the
    // uncontrolled textarea shows the latest value.
    if (inputRef.current && inputRef.current.value !== String(value ?? "")) {
      inputRef.current.value = String(value ?? "");
    }
  }, [value, validate]);

  const commonProps = {
    defaultValue: String(value ?? ""),
    ref: inputRef,
    onChange: handleChange,
    style: {
      resize: "vertical" as const,
      minHeight: height,
      width: "100%",
      boxSizing: "border-box" as const,
    },
    className: combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput),
  };

  return (
    <StandardFieldLayout field={field} error={validate(value)}>
      <textarea {...commonProps} />
    </StandardFieldLayout>
  );
};

export default MultilineTextInput;
