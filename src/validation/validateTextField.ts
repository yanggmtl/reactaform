import { DefinitionPropertyField, FieldValueType, TranslationFunction } from "../core/reactaFormTypes";
import { registerBuiltinFieldValidationHandler } from "../core/registries/validationHandlerRegistry";
import validateFieldPattern from "./validateFieldPattern";

export function validateTextField(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | null {
  const inputStr = String(input);
  if (inputStr.trim() === "") {
    return field.required ? t("Value required") : null;
  }

  if (field.minLength !== undefined && inputStr.length < field.minLength) {
    return t("Must be at least {{1}} characters", field.minLength);
  }
  if (field.maxLength !== undefined && inputStr.length > field.maxLength) {
    return t("Must be at most {{1}} characters", field.maxLength);
  }
  
  return validateFieldPattern(field, input, t, "Invalid text format");
}

registerBuiltinFieldValidationHandler("text", validateTextField);
registerBuiltinFieldValidationHandler("string", validateTextField);
registerBuiltinFieldValidationHandler("multiline", validateTextField);
registerBuiltinFieldValidationHandler("password", validateTextField);