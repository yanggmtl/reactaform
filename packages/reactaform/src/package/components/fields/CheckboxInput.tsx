import React from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from "../../core/reactaFormTypes";

export type CheckboxField = DefinitionPropertyField & {
  defaultValue?: boolean;
};
import useReactaFormContext from "../../hooks/useReactaFormContext";

// Props expected by CheckboxInput component
type CheckboxInputProps = BaseInputProps<boolean, CheckboxField>;

/**
 * CheckboxInput
 *
 * Renders a simple checkbox input for boolean values.
 * - Displays label from field.displayName with localization support.
 * - Calls onChange when toggled.
 * - Shows tooltip if provided.
 */
export const CheckboxInput: React.FC<CheckboxInputProps> = ({
  field,
  value,
  onChange,
  onError,
  disabled: propDisabled,
}) => {
  const { darkMode, t } = useReactaFormContext();

  const isDisabled = field.disabled ?? propDisabled ?? false;

  const [error, setError] = React.useState<string | null>(null);

  const validate = React.useCallback((checked: boolean) => {
    if (field.required && !checked) return t('Value required');
    return null;
  }, [field, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (field.readOnly || isDisabled) return;
    const checked = e.target.checked;
    const err = validate(checked);
    setError(err);
    onChange?.(checked, err);
  };

  React.useEffect(() => {
    const err = validate(!!value);
    setError(err);
    onError?.(err ?? null);
  }, [value, field, onError, validate]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Space' || e.key === 'Enter') {
      e.preventDefault();
      if (field.readOnly || isDisabled) return;
      onChange?.(!value, validate(!value));
    }
  };

  const inputId = field.name;

  return (
    <StandardFieldLayout field={field} rightAlign={true} error={error}>
      <input
        id={inputId}
        data-testid="boolean-checkbox"
        type="checkbox"
        checked={!!value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        aria-checked={!!value}
        aria-readonly={!!field.readOnly}
        aria-disabled={!!isDisabled}
        disabled={!!isDisabled}
        style={{
          cursor: field.readOnly || field.disabled ? "not-allowed" : "pointer",
          margin: "8px 0 8px 0",
          width: "1.2em",
          height: "1.2em",
          verticalAlign: "middle",
          accentColor: darkMode ? "#10b981" : "#22c55e",
          opacity: field.disabled ? 0.6 : undefined,
        }}
      />
    </StandardFieldLayout>
  );
};

export default CheckboxInput;
