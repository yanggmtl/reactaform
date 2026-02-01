import * as React from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from "../../core/reactaFormTypes";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES } from "../../utils/cssClasses";
import { useFieldValidator } from "../../hooks/useFieldValidator";

type CheckboxInputProps = BaseInputProps<boolean, DefinitionPropertyField>;

const CheckboxInput: React.FC<CheckboxInputProps> = ({
  field,
  value = false,
  onChange,
  onError,
  error: externalError,
}) => {
  const { t,  } = useReactaFormContext();
  const validate = useFieldValidator(field, externalError);

  const error = validate(value);

  // Notify parent when validation result changes
  React.useEffect(() => {
    if (externalError) return;
    onError?.(error);
  }, [error, externalError, onError]);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    },
    [onChange]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Accept multiple possible space key representations across envs
      const isSpace = e.key === " " || e.key === "Space" || e.key === "Spacebar" || e.code === "Space";
      if (isSpace || e.key === "Enter") {
        e.preventDefault();
        onChange?.(!value);
      }
    },
    [onChange, value]
  );

  const inputId = field.name;

  return (
    <StandardFieldLayout field={field} rightAlign={false} error={error}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <label
          className={CSS_CLASSES.label}
          htmlFor={inputId}
          style={{ textAlign: "left", justifyContent: "flex-start" }}
        >
          {t(field.displayName)}
        </label>

        <input
          id={inputId}
          data-testid="boolean-checkbox"
          type="checkbox"
          checked={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-checked={value}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.name}-error` : undefined}
          style={{
            cursor: "pointer",
            margin: "8px 0",
            width: "1.2em",
            height: "1.2em",
            verticalAlign: "middle",
            accentColor: "#0000FF",
          }}
        />
      </div>
    </StandardFieldLayout>
  );
};

CheckboxInput.displayName = "CheckboxInput";
export default React.memo(CheckboxInput);
