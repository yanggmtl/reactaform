import React, { useEffect, useMemo } from "react";
import type { ChangeEvent } from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import { validateFieldValue } from "../../core/validation";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

type PasswordInputProps = BaseInputProps<string, DefinitionPropertyField>;

const PasswordInput: React.FC<PasswordInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const prevErrorRef = React.useRef<string | null>(null);
  const onErrorRef = React.useRef<PasswordInputProps["onError"] | undefined>(
    onError
  );
  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const patternRegex = useMemo(
    () => (field.pattern ? new RegExp(field.pattern) : null),
    [field.pattern]
  );

  const validate = React.useCallback(
    (val: string): string | null => {
      if (val === "") return field.required ? t("Value required") : null;
      if (field.minLength !== undefined && val.length < field.minLength) {
        return t("Must be at least {{1}} characters", field.minLength);
      }
      if (field.maxLength !== undefined && val.length > field.maxLength) {
        return t("Must be at most {{1}} characters", field.maxLength);
      }
      if (patternRegex && !patternRegex.test(val)) {
        return t("Input does not match pattern: {{1}}", field.pattern);
      }
      return validateFieldValue(definitionName, field, val, t);
    },
    [field, definitionName, t, patternRegex]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    const err = validate(newVal);
    onChange?.(newVal, err);
  };

  useEffect(() => {
    const err = validate(value ?? "");
    if (inputRef.current && inputRef.current.value !== String(value ?? "")) {
      inputRef.current.value = String(value ?? "");
    }
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
    return undefined;
  }, [value, validate]);

  const [showPassword, setShowPassword] = React.useState(false);
  const toggleShow = () => setShowPassword((s) => !s);

  return (
    <StandardFieldLayout field={field} error={validate(String(value ?? ""))}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, width: '100%' }}>
        <input
          id={field.name}
          type={showPassword ? "text" : "password"}
          defaultValue={String(value ?? "")}
          ref={inputRef}
          onChange={handleChange}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
          style={{ flex: 1, minWidth: 0 }}
        />
        <button
          type="button"
          onClick={toggleShow}
          aria-label={showPassword ? t("Hide password") : t("Show password")}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
            lineHeight: 1,
            padding: "4px 6px",
            flexShrink: 0,
          }}
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      </div>
    </StandardFieldLayout>
  );
};

export default PasswordInput;
