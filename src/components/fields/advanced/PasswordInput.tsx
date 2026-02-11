import * as React from "react";
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type { DefinitionPropertyField } from "../../../core/reactaFormTypes";
import type { BaseInputProps } from "../../../core/reactaFormTypes";
import { CSS_CLASSES, combineClasses } from "../../../styles/cssClasses";
import { useUncontrolledValidatedInput } from "../../../hooks/useUncontrolledValidatedInput";
import { useFieldValidator } from "../../../hooks/useFieldValidator";
import useReactaFormContext from "../../../hooks/useReactaFormContext";

type PasswordInputProps = BaseInputProps<string, DefinitionPropertyField>;

const PasswordInput: React.FC<PasswordInputProps> = ({
  field,
  value,
  onChange,
  onError,
  error: externalError,
}) => {
  const { t } = useReactaFormContext();
  const validate = useFieldValidator(field, externalError);

  // Use our shared uncontrolled + validated input hook
  const { inputRef, error, handleChange } = useUncontrolledValidatedInput({
    value,
    onChange,
    onError,
    validate,
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const toggleShow = () => setShowPassword((s) => !s);

  return (
    <StandardFieldLayout field={field} error={error}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, width: '100%' }}>
        <input
          id={field.name}
          type={showPassword ? "text" : "password"}
          defaultValue={String(value ?? "")}
          ref={inputRef}
          onChange={handleChange}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
          style={{ flex: 1, minWidth: 0 }}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.name}-error` : undefined}
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

PasswordInput.displayName = "PasswordInput";
export default React.memo(PasswordInput);
