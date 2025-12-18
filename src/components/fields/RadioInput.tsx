import * as React from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from "../../core/reactaFormTypes";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";
import { validateFieldValue } from "../../core/validation";

export type RadioInputProps = BaseInputProps<string, DefinitionPropertyField>;

/**
 * RadioInput
 *
 * Renders radio button options for selecting a single value.
 * - Supports horizontal and vertical layouts
 * - Validates that the selected value is in the options list
 * - Auto-corrects to first option if invalid value provided
 */
const RadioInput: React.FC<RadioInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();
  const layout =
    field.layout?.toLowerCase() === "horizontal" ? "row" : "column";

  const groupRef = React.useRef<HTMLDivElement | null>(null);
  const onErrorRef = React.useRef<RadioInputProps["onError"] | undefined>(onError);

  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const validate = React.useCallback(
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

  React.useEffect(() => {
    const safeVal = value != null ? String(value) : "";
    const err = validate(safeVal);
    onErrorRef.current?.(err ?? null);
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
    const val = e.target.value;
    const err = validate(val);
    onErrorRef.current?.(err ?? null);
    onChange?.(val, err);
  };

  return (
    <StandardFieldLayout field={field} error={validate(String(value ?? ""))}>
      <div
        className={CSS_CLASSES.input}
        role="radiogroup"
        aria-labelledby={`${field.name}-label`}
        aria-invalid={!!validate(String(value ?? ""))}
        style={{
          display: "flex",
          flexDirection: layout,
          flexWrap: layout === "row" ? "wrap" : "nowrap",
          gap: layout === "row" ? "12px" : "4px",
          alignItems: layout === "row" ? "center" : "stretch",
          width: "100%",
          padding: layout === "row" ? "8px" : undefined,
          boxSizing: "border-box",
        }}
        ref={groupRef}
      >
        {(field.options ?? []).map((opt) => (
          <label
            key={String(opt.value)}
            className={combineClasses(CSS_CLASSES.label)}
            style={{
              display: layout === "column" ? "flex" : "inline-flex",
              gap: "8px",
              alignItems: "center",
              whiteSpace: "nowrap",
              marginBottom: layout === "column" ? 6 : 0,
              cursor: "pointer",
              width: layout === "column" ? "100%" : undefined,
              justifyContent: "flex-start",
            }}
          >
            <input
              type="radio"
              name={field.name}
              value={String(opt.value)}
              defaultChecked={String(value ?? "") === String(opt.value)}
              onChange={handleChange}
              style={{ width: "1.1em", height: "1.1em" }}
            />
            <span
              style={{
                userSelect: "none",
                textAlign: layout === "column" ? "left" : undefined,
                flex: layout === "column" ? 1 : undefined,
                fontWeight: 400 // Use normal font weight for option labels
              }}
            >
              {t(opt.label)}
            </span>
          </label>
        ))}
      </div>
    </StandardFieldLayout>
  );
};

export default RadioInput;
