/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import { validateFieldValue } from "../../core/validation";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

// ------------------ Types ------------------

export type TextField = DefinitionPropertyField & {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minHeight?: string;
};

type TextInputProps = BaseInputProps<string, TextField>;

// ------------------ Component ------------------

const MultilineTextInput: React.FC<TextInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();
  const isDisabled = field.disabled ?? false;
  const height = field.minHeight ?? "80px";
  const [textValue, setTextValue] = useState(value);
  const [error, setError] = useState<string | null>(null);

  const prevErrorRef = React.useRef<string | null>(null);
  const onErrorRef = React.useRef<TextInputProps["onError"] | undefined>(
    onError
  );
  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const getValidationError = React.useCallback(
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
    if (isDisabled) return;
    const newValue = e.target.value;
    const err = getValidationError(newValue);

    setTextValue(newValue);
    setError(err);
    onChange?.(newValue, err);
  };

  useEffect(() => {
    // Validate on initial mount or when value changes
    const err = getValidationError(value);
    setError(err);
    setTextValue(value);
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
  }, [value, getValidationError]);

  const commonProps = {
    value: textValue,
    onChange: handleChange,
    disabled: isDisabled,
    style: { 
      resize: "vertical" as const, 
      minHeight: height,
      width: "100%",
      boxSizing: "border-box" as const 
    },
    className: combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput),
  };

  return (
    <StandardFieldLayout field={field} error={error}>
      <textarea {...commonProps} />
    </StandardFieldLayout>
  );
};

export default MultilineTextInput;
