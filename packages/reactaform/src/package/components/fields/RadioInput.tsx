import React, { useEffect, useState, useCallback } from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from "../../core/reactaFormTypes";
import useReactaFormContext from "../../hooks/useReactaFormContext";

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
  const { t } = useReactaFormContext();
  const layout =
    field.layout?.toLowerCase() === "horizontal" ? "row" : "column";
  const isDisabled = field.disabled ?? false;

  const [inputValue, setInputValue] = useState<string>(
    value != null ? String(value) : ""
  );
  const [error, setError] = useState<string | null>(null);

  const validateCb = useCallback(
    (val: string): string | null => {
      if ((val === "" || val === null || val === undefined)) {
        return t("Value required");
      }
      // If options are not provided, we can't validate here; treat as valid.
      if (!field.options || field.options.length === 0) return null;
      if (!field.options.some((opt) => opt.value === val)) {
        return t("Invalid option selected");
      }
      return null;
    },
    [field, t]
  );

  useEffect(() => {
    const safeVal = value != null ? String(value) : "";
    // If incoming value is invalid and there is at least one option, pick the first option
    const err = validateCb(safeVal);
    if (err && field.options && field.options.length > 0) {
      const first = String(field.options[0].value);
      setInputValue(first);
      setError(null);
      // notify parent that we normalized the value
      onChange?.(first, null);
    } else {
      setInputValue(safeVal);
      setError(err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, validateCb]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const val = e.target.value;
    const err = validateCb(val);
    if (!err) {
      setInputValue(val);
    }
    setError(err);
    onChange?.(val, err);
  };

  return (
    <StandardFieldLayout field={field} error={error}>
      <div
        style={{
          display: "flex",
          flexDirection: layout,
          flexWrap: layout === "row" ? "wrap" : "nowrap",
          gap: layout === "row" ? "12px" : "4px",
          alignItems: layout === "row" ? "center" : "flex-start",
          width: "100%",
        }}
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
              checked={String(inputValue) === String(opt.value)}
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
