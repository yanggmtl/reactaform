import * as React from "react";
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type { DefinitionPropertyField } from "../../../core/reactaFormTypes";
import type { BaseInputProps } from "../../../core/reactaFormTypes";
import { CSS_CLASSES, combineClasses } from "../../../styles/cssClasses";
import { useUncontrolledValidatedInput } from "../../../hooks/useUncontrolledValidatedInput";
import { useFieldValidator } from "../../../hooks/useFieldValidator";

type TextInputProps = BaseInputProps<string, DefinitionPropertyField>;

const MultilineTextInput: React.FC<TextInputProps> = ({
  field,
  value,
  onChange,
  onError,
  error: externalError,
}) => {
  const validate = useFieldValidator(field, externalError);

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

MultilineTextInput.displayName = "MultilineTextInput";
export default React.memo(MultilineTextInput);
