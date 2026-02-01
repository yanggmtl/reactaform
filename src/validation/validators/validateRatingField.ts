import { DefinitionPropertyField, FieldValueType, TranslationFunction } from "../../core/reactaFormTypes";

export function validateRatingField(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | null {
  const inputStr = String(input ?? "").trim();
  if (inputStr === "") {
    return field.required ? t("Value required") : null;
  }

  let parsedValue = input;
  if (typeof input !== "number") {
    parsedValue = parseFloat(inputStr);
  }

  if (Number.isNaN(parsedValue) || (parsedValue as number) <= 0) {
    return t("Invalid value");
  }

  // Check max constraints
  if (field.max !== undefined && (parsedValue as number) > field.max) {
    return t("Must be ≤ {{1}}", field.max);
  }

  return null;
}
