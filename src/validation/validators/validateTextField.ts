import { DefinitionPropertyField, FieldValueType, TranslationFunction } from "../../core/reactaFormTypes";
import validateFieldPattern from "./validateFieldPattern";

export function validateTextField(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | null {
  // In Text and multiline fields, spaces are allowed and don't trim them
  const inputStr = String(input);
  if (inputStr === "") {
    if (field.minLength !== undefined || field.maxLength !== undefined) {
      return field.required ? t("Value required when minLength or maxLength is set") : null;
    }
    return field.required ? t("Value required") : null;
  }

  const min = Math.max(field.minLength ?? 0, 0);
  if (inputStr.length < min) {
    return t("Must be at least {{1}} characters", min);
  }
  if (field.maxLength !== undefined && inputStr.length > field.maxLength) {
    return t("Must be at most {{1}} characters", field.maxLength);
  }
  
  return validateFieldPattern(field, input, t, "Invalid text format");
}
