import * as React from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { BaseInputProps, DefinitionPropertyField } from "../../core/reactaFormTypes";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";
import { useFieldValidator } from "../../hooks/useFieldValidator";

type SliderInputProps = BaseInputProps<string | number, DefinitionPropertyField>;

const SliderInput: React.FC<SliderInputProps> = ({ field, value, onChange, onError, error: externalError }) => {
  const validate = useFieldValidator(field, externalError);
  
  const min = field.min ?? 0;
  const max = field.max ?? 100;

  // Controlled state
  const [inputValue, setInputValue] = React.useState(() =>
    !isNaN(Number(value)) ? String(Number(value)) : String(min)
  );

  // Sync with props
  React.useEffect(() => {
    const newVal = !isNaN(Number(value)) ? String(Number(value)) : String(min);
    setInputValue(newVal);
  }, [value, min]);

  // Validation
  const error = React.useMemo(() => {
    return validate(inputValue) ?? null;
  }, [validate, inputValue]);

  // Notify parent of errors
  React.useEffect(() => {
    onError?.(error);
  }, [error, onError]);

  // Handle changes from both range and text inputs
  const handleValueChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      setInputValue(input);
      
      validate(input);
      onChange?.(input);
    },
    [validate, onChange]
  );

  const displayValue = !isNaN(Number(inputValue)) ? String(Number(inputValue)) : String(min);

  return (
    <StandardFieldLayout field={field} error={error}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
        <input
          id={`${field.name}-range`}
          type="range"
          value={displayValue}
          onChange={handleValueChange}
          min={min}
          max={max}
          step="1.0"
          style={{
            padding: 0,
            flex: 1,
          }}
          className={CSS_CLASSES.rangeInput}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.name}-error` : undefined}
        />
        <input
          id={field.name}
          type="text"
          value={inputValue}
          onChange={handleValueChange}
          required
          style={{
            width: "40px",
            minWidth: "40px",
            height: "2.3em",
            textAlign: "center",
            flexShrink: 0,
          }}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.name}-error` : undefined}
        />
      </div>
    </StandardFieldLayout>
  );
};

export default SliderInput;
