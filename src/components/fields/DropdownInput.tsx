import * as React from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from "../../core/reactaFormTypes";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { validateFieldValue } from "../../core/validation";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

type DropdownField = DefinitionPropertyField & {
  options: NonNullable<DefinitionPropertyField['options']>;
};

export type DropdownInputProps = BaseInputProps<
  string,
  DropdownField
>;

/**
 * DropdownInput
 *
 * Renders a select dropdown for selecting a single value from options.
 * - Validates that the selected value is in the options list
 * - Auto-corrects to first option if invalid value provided
 * - Uses custom styling from fieldStyle.optionInput
 */
const DropdownInput: React.FC<DropdownInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();

  const selectRef = React.useRef<HTMLSelectElement | null>(null);
  const onErrorRef = React.useRef<DropdownInputProps["onError"] | undefined>(onError);

  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const validate = React.useCallback(
    (val: string): string | null => {
      if (val === "" || val === null || val === undefined) {
        return t("Value required");
      }
      // Options are guaranteed to exist due to type constraint
      if (!field.options.some((opt) => opt.value === val)) {
        return t("Invalid option selected");
      }
      const err = validateFieldValue(definitionName, field, val, t);
      return err ?? null;
    },
    [field, t, definitionName]
  );

  React.useEffect(() => {
    const safeVal = value != null ? String(value) : "";
    // If incoming value is invalid and there is at least one option, pick the first option
    const err = validate(safeVal);
    if (err && field.options.length > 0) {
      const first = String(field.options[0].value);
      if (selectRef.current) selectRef.current.value = first;
      // notify parent that we normalized the value
      onChange?.(first, null);
      onErrorRef.current?.(null);
    } else {
      if (selectRef.current) selectRef.current.value = safeVal;
      onErrorRef.current?.(err ?? null);
    }
  }, [value, validate, onChange, field.options]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const err = validate(val);
    onChange?.(val, err);
  };

  return (
    <StandardFieldLayout field={field} error={validate(String(value ?? ""))}>
      <select
        id={field.name}
        aria-invalid={!!validate(String(value ?? ""))}
        aria-describedby={validate(String(value ?? "")) ? `${field.name}-error` : undefined}
        defaultValue={String(value ?? "")}
        ref={selectRef}
        onChange={handleChange}
        className={combineClasses(
          CSS_CLASSES.input,
          CSS_CLASSES.inputSelect
        )}
      >
        {field.options.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {t(opt.label)}
          </option>
        ))}
      </select>
    </StandardFieldLayout>
  );
};

export default DropdownInput;
