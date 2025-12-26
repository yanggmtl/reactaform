import * as React from "react";
import type { ChangeEvent } from "react";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { validateFieldValue } from "../../core/validation";
import { StandardFieldLayout } from "../LayoutComponents";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

export type PhoneInputProps = BaseInputProps<string, DefinitionPropertyField>;

export const PhoneInput: React.FC<PhoneInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t } = useReactaFormContext();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const { definitionName } = useReactaFormContext();

  const validateCb = React.useCallback(
    (val: string): string | null => {
      const raw = String(val ?? "").trim();
      if (raw === "") {
        return field.required ? t("Value required") : null;
      }
      if (field.pattern) {
        try {
          const re = new RegExp(field.pattern);
          if (!re.test(raw))
            return field.patternErrorMessage ? t(field.patternErrorMessage) : t(
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

  const prevErrorRef = React.useRef<string | null>(null);
  const onErrorRef = React.useRef<PhoneInputProps["onError"] | undefined>(onError);
  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  React.useEffect(() => {
    const v = String(value ?? "");
    const err = validateCb(v);
    if (inputRef.current && inputRef.current.value !== String(v)) {
      inputRef.current.value = String(v);
    }
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
    return undefined;
  }, [value, validateCb]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    const trimmedInput = newVal.trim();

    let err = null;
    if (trimmedInput === "") {
      err = field.required ? t("Value required") : null;
      // update local state and notify parent with the new (empty) value and error
      onChange?.(newVal, err);
      return;
    }

    if (!err) {
      err = validateCb(newVal);
    }

    // pass the fresh value to the parent (avoid stale state)
    onChange?.(newVal, err);
  };

  const error = React.useMemo(
    () => validateCb(String(value ?? "")),
    [value, validateCb]
  );

  return (
    <StandardFieldLayout field={field} error={error}>
      <input
        id={field.name}
        type="tel"
        defaultValue={String(value ?? "")}
        ref={inputRef}
        onChange={handleChange}
        className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.name}-error` : undefined}
      />
    </StandardFieldLayout>
  );
};

export default PhoneInput;
