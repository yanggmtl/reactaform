import { DefinitionPropertyField, FieldValueType, TranslationFunction } from "../core/reactaFormTypes";
import { validateFloatField } from "./validateFloatField";

export function validateUnitValueField(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | null {
  const inputArr = Array.isArray(input) ? input : [];
  const value = inputArr[0];
  const unit = inputArr[1] ? String(inputArr[1]).trim() : "";
  const inputValueStr = String(value ?? "").trim();

  if (inputValueStr === "" || unit === "") return field.required ? t("Value required") : null;

  return validateFloatField(field, value, t);
}
