import React, { useEffect, useRef, useCallback } from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from "../../core/reactaFormTypes";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { validateFieldValue } from "../../core/validation";

export type RadioField = DefinitionPropertyField & {
  layout?: "horizontal" | "vertical";
};

export type RadioInputProps = BaseInputProps<string, RadioField>;

/**
 * RadioInput
 *
 * Renders radio button options for selecting a single value.
 * - Supports horizontal and vertical layouts
 * - Validates that the selected value is in the options list
 * - Auto-corrects to first option if invalid value provided
 * - Supports disabled state
 */
const RadioInput: React.FC<RadioInputProps> = ({ field, value, onChange }) => {
  const { t, definitionName } = useReactaFormContext();
  const layout =
    field.layout?.toLowerCase() === "horizontal" ? "row" : "column";
  const isDisabled = field.disabled ?? false;

  const groupRef = useRef<HTMLDivElement | null>(null);

  const validate = useCallback(
    (val: string): string | null => {
      if ((val === "" || val === null || val === undefined)) {
        return t("Value required");
      }
      // If options are not provided, we can't validate here; treat as valid.
      if (!field.options || field.options.length === 0) return null;
      if (!field.options.some((opt) => opt.value === val)) {
        return t("Invalid option selected");
      }
      const err = validateFieldValue(definitionName, field, val, t);
      return err ?? null;
    },
    [field, t, definitionName]
  );

  useEffect(() => {
    const safeVal = value != null ? String(value) : "";
    const err = validate(safeVal);
    if (groupRef.current) {
      const inputs = Array.from(
        groupRef.current.querySelectorAll<HTMLInputElement>("input[type=radio]")
      );
      // If normalization required, set first option checked; otherwise set checked by value
      if (err && field.options && field.options.length > 0) {
        const first = String(field.options[0].value);
        inputs.forEach((inp) => (inp.checked = inp.value === first));
        onChange?.(first, null);
      } else {
        inputs.forEach((inp) => (inp.checked = inp.value === safeVal));
      }
    }
  }, [value, validate, onChange, field.options]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const val = e.target.value;
    const err = validate(val);
    onChange?.(val, err);
  };

  return (
    <StandardFieldLayout field={field} error={validate(String(value ?? ""))}>
      <div
        style={{
          display: "flex",
          flexDirection: layout,
          flexWrap: layout === "row" ? "wrap" : "nowrap",
          gap: layout === "row" ? "12px" : "4px",
          alignItems: layout === "row" ? "center" : "flex-start",
          width: "100%",
        }}
        ref={groupRef}
      >
        {(field.options ?? []).map((opt) => (
          <label
            key={String(opt.value)}
            style={{
              display: "flex",
              gap: "6px",
              alignItems: "center",
              whiteSpace: "nowrap",
            }}
          >
            <input
              type="radio"
              name={field.name}
              value={String(opt.value)}
              defaultChecked={String(value ?? "") === String(opt.value)}
              onChange={handleChange}
              disabled={isDisabled}
            />
            {t(opt.label)}
          </label>
        ))}
      </div>
    </StandardFieldLayout>
  );
};

export default RadioInput;
