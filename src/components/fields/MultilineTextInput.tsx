import * as React from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import { validateField } from "../../validation/validation";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";
import { useUncontrolledValidatedInput } from "../../hooks/useUncontrolledValidatedInput";

type TextInputProps = BaseInputProps<string, DefinitionPropertyField>;

const MultilineTextInput: React.FC<TextInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();

  const validate = React.useCallback(
    (val: string): string | null => {
      return validateField(definitionName, field, val, t);
    },
    [field, definitionName, t]
  );

  // Use shared uncontrolled + validated input hook (textarea variant)
  const { inputRef, error, handleChange } = useUncontrolledValidatedInput<HTMLTextAreaElement>({
    value,
    onChange,
    onError,
    validate,
  });

  return (
    <StandardFieldLayout field={field} error={error}>
      <textarea
        id={field.name}
        defaultValue={String(value ?? "")}
        ref={inputRef}
        onChange={handleChange}
        style={{
          resize: "vertical" as const,
          minHeight: field.minHeight ?? "80px",
          width: "100%",
          boxSizing: "border-box" as const,
        }}
        className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.name}-error` : undefined}
      />
    </StandardFieldLayout>
  );
};

export default MultilineTextInput;
