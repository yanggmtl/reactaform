import { DefinitionPropertyField, FieldValueType, TranslationFunction } from "../core/reactaFormTypes";
import { registerBuiltinFieldValidationHandler } from "./validationHandlerRegistry";
import validateFieldPattern from "./validateFieldPattern";

export function validatePhoneField(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | null {
  const inputStr = String(input ?? "").trim();
  if (inputStr === "") return field.required ? t("Value required") : null;

  return field.pattern ? validateFieldPattern(field, inputStr, t, "Invalid phone number format") : null;
}

registerBuiltinFieldValidationHandler("phone", validatePhoneField);
