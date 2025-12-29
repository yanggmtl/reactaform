import * as React from "react";
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
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  // Memoize regex pattern compilation
  const patternRegex = React.useMemo(
    () => field.pattern ? new RegExp(field.pattern) : null,
    [field.pattern]
  );

  const validate = React.useCallback(
    (val: string): string | null => {
      const trimmed = val.trim();
      if (trimmed === "") {
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

  // Calculate error during render (derived state)
  const currentValue = String(value ?? "");
  const error = validate(currentValue);

  // Notify parent of error status changes
  // We use a ref to track the previous error to avoid infinite loops if onError triggers a re-render
  const prevErrorRef = React.useRef<string | null>(null);
  
  React.useEffect(() => {
    if (error !== prevErrorRef.current) {
      prevErrorRef.current = error;
      onError?.(error);
    }
  }, [error, onError]);

  // Sync with external value changes
  React.useEffect(() => {
    if (inputRef.current && inputRef.current.value !== currentValue) {
      inputRef.current.value = currentValue;
    }
  }, [currentValue]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // We validate immediately for the onChange callback, but the UI error state 
    // will be updated on the next render via the `error` variable above.
    const err = validate(newValue);
    onChange?.(newValue, err);
  };

  return (
    <StandardFieldLayout field={field} error={error}>
      <input
        id={field.name}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.name}-error` : undefined}
        type="text"
        defaultValue={currentValue}
        ref={inputRef}
        onChange={handleChange}
        className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
        placeholder={field.placeholder}
      />
    </StandardFieldLayout>
  );
};

export default TextInput;
