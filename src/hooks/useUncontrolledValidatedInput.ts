import * as React from "react";

export type UseUncontrolledValidatedInputProps = {
  value?: string;
  onChange?: (value: string, error: string | null) => void;
  onError?: (error: string | null) => void;
  validate: (value: string) => string | null; // validation always receives string
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
>({ value, onChange, onError, validate, }: UseUncontrolledValidatedInputProps) {
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
    const strValue = String(value ?? "");
    const isFocused = document.activeElement === inputRef.current;

    if (!isFocused) {
      const err = validate(strValue);
      if (err !== prevErrorRef.current) {
        prevErrorRef.current = err;
        onErrorRef.current?.(err ?? null);
        setError(err);
      }

          if (inputRef.current && ((inputRef.current as HTMLInputElement | HTMLTextAreaElement).value) !== strValue) {
            (inputRef.current as HTMLInputElement | HTMLTextAreaElement).value = strValue;
      }
    }
  }, [value, validate]);

  // Handle user input
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<T>) => {
          const strValue = (e.target as HTMLInputElement | HTMLTextAreaElement).value;
      const err = validate(strValue);

      if (err !== prevErrorRef.current) {
        prevErrorRef.current = err;
        setError(err);
        onErrorRef.current?.(err ?? null);
      }

      onChange?.(strValue, err);
    },
    [onChange, validate]
  );

  return { inputRef, error, handleChange };
}
