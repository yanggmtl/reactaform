import React, { useEffect, useRef } from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from "../../core/reactaFormTypes";
import { validateFieldValue } from "../../core/validation";
import useReactaFormContext from "../../hooks/useReactaFormContext";

type CheckboxInputProps = BaseInputProps<boolean, DefinitionPropertyField>;

/**
 * CheckboxInput
 * Renders a simple checkbox input for boolean values.
 */
export const CheckboxInput: React.FC<CheckboxInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { definitionName, t } = useReactaFormContext();
  const onErrorRef = useRef<CheckboxInputProps["onError"] | undefined>(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    const err = validateFieldValue(definitionName, field, value ?? false, t);
    onErrorRef.current?.(err ?? null);
  }, [value, field, definitionName, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    onChange?.(checked, null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Space' || e.key === 'Enter') {
      e.preventDefault();
      onChange?.(!value, null);
    }
  };

  const inputId = field.name;

  return (
    <StandardFieldLayout field={field} rightAlign={true}>
      <input
        id={inputId}
        data-testid="boolean-checkbox"
        type="checkbox"
        checked={!!value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        aria-checked={!!value}
        style={{
          cursor: "pointer",
          margin: "8px 0 8px 0",
          width: "1.2em",
          height: "1.2em",
          verticalAlign: "middle",
          color: "#FFFFFF",
          accentColor: "#0000FF",
          opacity: undefined,
        }}
      />
    </StandardFieldLayout>
  );
};

export default CheckboxInput;
