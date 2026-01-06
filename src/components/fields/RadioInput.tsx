import * as React from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from "../../core/reactaFormTypes";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";
import { validateField } from "../../core/validation";

type RadioField = DefinitionPropertyField & {
  options: NonNullable<DefinitionPropertyField["options"]>;
};

export type RadioInputProps = BaseInputProps<string, RadioField>;

const RadioInput: React.FC<RadioInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();

  const layout: "row" | "column" =
    field.layout?.toLowerCase() === "horizontal" ? "row" : "column";

  const groupRef = React.useRef<HTMLDivElement | null>(null);
  const onErrorRef = React.useRef(onError);

  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const validate = React.useCallback(
    (input: string) => validateField(definitionName, field, input, t),
    [definitionName, field, t]
  );

  const [error, setError] = React.useState<string | null>(null);
  const prevErrorRef = React.useRef<string | null>(null);

  const updateError = React.useCallback(
    (next: string | null) => {
      if (next !== prevErrorRef.current) {
        prevErrorRef.current = next;
        setError(next);
        onErrorRef.current?.(next);
      }
    },
    []
  );

  /**
   * Validate & normalize incoming value
   */
  React.useEffect(() => {
    const safeValue = value != null ? String(value) : "";
    const err = validate(safeValue);

    if (err && field.options.length > 0) {
      const firstValue = String(field.options[0].value);
      onChange?.(firstValue, null);

      // Sync DOM radios if needed
      groupRef.current
        ?.querySelectorAll<HTMLInputElement>("input[type=radio]")
        .forEach((input) => {
          input.checked = input.value === firstValue;
        });
    }

    updateError(err);
  }, [value, field.options, validate, onChange, updateError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    const err = validate(nextValue);

    updateError(err);
    onChange?.(nextValue, err);
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: layout,
    flexWrap: layout === "row" ? "wrap" : "nowrap",
    gap: layout === "row" ? "12px" : "4px",
    alignItems: layout === "row" ? "center" : "stretch",
    width: "100%",
    padding: layout === "row" ? "8px" : undefined,
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: layout === "column" ? "flex" : "inline-flex",
    gap: "8px",
    alignItems: "center",
    whiteSpace: "nowrap",
    marginBottom: layout === "column" ? 6 : 0,
    cursor: "pointer",
    width: layout === "column" ? "100%" : undefined,
    justifyContent: "flex-start",
  };

  return (
    <StandardFieldLayout field={field} error={error}>
      <div
        ref={groupRef}
        className={CSS_CLASSES.input}
        role="radiogroup"
        aria-labelledby={`${field.name}-label`}
        aria-invalid={!!error}
        style={containerStyle}
      >
        {field.options.map((opt) => {
          const optValue = String(opt.value);
          return (
            <label
              key={optValue}
              className={combineClasses(CSS_CLASSES.label)}
              style={labelStyle}
            >
              <input
                type="radio"
                name={field.name}
                value={optValue}
                checked={String(value ?? "") === optValue}
                onChange={handleChange}
                style={{ width: "1.1em", height: "1.1em" }}
              />
              <span
                style={{
                  userSelect: "none",
                  textAlign: layout === "column" ? "left" : undefined,
                  flex: layout === "column" ? 1 : undefined,
                  fontWeight: 400,
                }}
              >
                {t(opt.label)}
              </span>
            </label>
          );
        })}
      </div>
    </StandardFieldLayout>
  );
};

export default RadioInput;
