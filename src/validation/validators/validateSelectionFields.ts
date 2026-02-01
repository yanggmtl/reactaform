import { DefinitionPropertyField, FieldValueType, TranslationFunction } from "../../core/reactaFormTypes";

export function validateDropdownField(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | null {
  const inputStr = String(input);
  if (inputStr === "" || inputStr === null || inputStr === undefined) {
    return field.required ? t("Value required") : null;
  }
  
  if (!field.options?.some((opt) => String(opt.value) === inputStr)) {
    return t("Invalid option selected");
  }

  return null;
}

export function validateMultiSelectionField(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | null {
  const inputStr = String(input ?? "");
  const trimedString = inputStr.trim();
  if (trimedString === "") {
    return field.required ? t("Value required") : null;
  }

  // Check if trimedstring is an array and validate each entry
  const selections = trimedString.split(",").map((s) => s.trim()).filter((s) => s !== "");
  if (selections.length === 0) {
    return field.required ? t("Value required") : null;
  }
  
  for (const selection of selections) {
    if (!field.options?.some((opt) => String(opt.value) === selection)) {
      return t("Invalid option selected");
    }
  }

  return null;
}
