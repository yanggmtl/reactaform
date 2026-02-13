import * as React from "react";
import type { ValidationTrigger } from "./useFieldValidator";

export type UseUncontrolledValidatedInputProps = {
  value?: string | number;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onError?: (error: string | null) => void;
  validate: (value: string, trigger?: ValidationTrigger) => string | null; // validation always receives string
};

/**
 * Handles:
 * - Uncontrolled input
 * - Validation
 * - Error sync
 */
// Generic hook: supports both <input> and <textarea> elements
export function useUncontrolledValidatedInput<
  T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement
>({ value, disabled, onChange, onError, validate, }: UseUncontrolledValidatedInputProps) {
  const inputRef = React.useRef<T | null>(null);
  const prevErrorRef = React.useRef<string | null>(null);
  const onErrorRef = React.useRef(onError);
  const [error, setError] = React.useState<string | null>(null);

  // Keep stable ref to latest onError
  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Sync external value and validate when not focused
  React.useEffect(() => {
    if (disabled) {
      if (prevErrorRef.current !== null) {
        prevErrorRef.current = null;
        onErrorRef.current?.(null);
        setError(null);
      }
      return;
    }

    const strValue = String(value ?? "");
    const isFocused = document.activeElement === inputRef.current;

    if (!isFocused) {
      const err = validate(strValue, "sync");
      if (err !== prevErrorRef.current) {
        prevErrorRef.current = err;
        onErrorRef.current?.(err ?? null);
        setError(err);
      }

      if (inputRef.current && inputRef.current.value !== strValue) {
        inputRef.current.value = strValue;
      }
    }
  }, [value, validate, disabled]);

  // Handle user input
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<T>) => {
      if (disabled) {
        return;
      }

      const strValue = e.target.value;
      const err = validate(strValue, "change");

      if (err !== prevErrorRef.current) {
        prevErrorRef.current = err;
        setError(err);
        onErrorRef.current?.(err ?? null);
      }

      onChange?.(strValue);
    },
    [onChange, validate, disabled]
  );

  const handleBlur = React.useCallback(() => {
    if (disabled) {
      return;
    }

    const strValue = String(inputRef.current?.value ?? value ?? "");
    const err = validate(strValue, "blur");

    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      setError(err);
      onErrorRef.current?.(err ?? null);
    }
  }, [validate, value, disabled]);

  React.useEffect(() => {
    const element = inputRef.current;
    if (!element) return;

    element.addEventListener("blur", handleBlur);
    return () => {
      element.removeEventListener("blur", handleBlur);
    };
  }, [handleBlur]);

  return { inputRef, error, handleChange, handleBlur };
}
