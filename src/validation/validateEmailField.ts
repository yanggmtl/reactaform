
import { DefinitionPropertyField, FieldValueType, TranslationFunction } from "../core/reactaFormTypes";
import { registerBuiltinFieldValidationHandler } from "../core/registries/validationHandlerRegistry";
import validateFieldPattern from "./validateFieldPattern";

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateEmailField(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | null {
  const inputStr = String(input ?? "").trim();
  if (inputStr === "")
    return field.required ? t("Value required") : null;

  if (!isValidEmail(inputStr)) return t("Must be valid email format");

  return field.pattern ? validateFieldPattern(field, input, t, t("Email does not match pattern: {{1}}", field.pattern)) : null;
}

registerBuiltinFieldValidationHandler("email", validateEmailField);