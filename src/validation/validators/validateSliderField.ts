import { DefinitionPropertyField, FieldValueType, TranslationFunction } from "../../core/reactaFormTypes";

export function validateSliderField(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | undefined {
  const inputStr = String(input);
  if (inputStr.trim() === "") {
    return field.required ? t("Value required") : undefined;
  }

  const parsedValue = Number(inputStr);
  if (Number.isNaN(parsedValue)) return t("Must be a valid float");

  const min = field.min ?? 0;
  const max = field.max ?? 100;

  if (parsedValue < min) {
    return t("Must be ≥ {{1}}", min);
  }

  if (parsedValue > max) {
    return t("Must be ≤ {{1}}", max);
  }

  return undefined;
}
