import React, { useEffect, useState, useCallback } from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from "../../core/reactaFormTypes";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { validateFieldValue } from "../../core/validation";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

export type DropdownInputProps = BaseInputProps<
  string,
  DefinitionPropertyField
>;

export type DropdownField = DefinitionPropertyField;

/**
 * DropdownInput
 *
 * Renders a select dropdown for selecting a single value from options.
 * - Validates that the selected value is in the options list
 * - Auto-corrects to first option if invalid value provided
 * - Supports disabled state
 * - Uses custom styling from fieldStyle.optionInput
 */
const DropdownInput: React.FC<DropdownInputProps> = ({
  field,
  value,
  onChange,
}) => {
  const { t, definitionName } = useReactaFormContext();
  const isDisabled = field.disabled ?? false;

  const [inputValue, setInputValue] = useState<string>(value != null ? String(value) : "");

  const validate = useCallback(
    (val: string): string | null => {
      if (val === "" || val === null || val === undefined) {
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
    // If incoming value is invalid and there is at least one option, pick the first option
    const err = validate(safeVal);
    if (err && field.options && field.options.length > 0) {
      const first = String(field.options[0].value);
      setInputValue(first);
      // notify parent that we normalized the value
      onChange?.(first, null);
    } else {
      setInputValue(safeVal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, validate]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isDisabled) return;
    const val = e.target.value;
    const err = validate(val);
    if (!err) {
      setInputValue(val);
    }
    onChange?.(val, err);
  };

  return (
    <StandardFieldLayout field={field} error={validate(inputValue)}>
      <select
        value={inputValue}
        onChange={handleChange}
        disabled={isDisabled}
        className={combineClasses(
          CSS_CLASSES.input,
          CSS_CLASSES.inputSelect
        )}
      >
        {(field.options ?? []).map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {t(opt.label)}
          </option>
        ))}
      </select>
    </StandardFieldLayout>
  );
};

export default DropdownInput;
