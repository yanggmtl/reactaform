import { DefinitionPropertyField, FieldValueType, TranslationFunction } from "../core/reactaFormTypes";

const parseDateTime = (value?: string): number | null => {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : time;
};

const fieldCache = new WeakMap<
  DefinitionPropertyField,
  { minTime: number | null; maxTime: number | null }
>();

const getCachedLimits = (field: DefinitionPropertyField) => {
  let cached = fieldCache.get(field);
  if (!cached) {
    cached = {
      minTime: parseDateTime(field.minDate),
      maxTime: parseDateTime(field.maxDate),
    };
    fieldCache.set(field, cached);
  }
  return cached;
};

export function validateDateField(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | null {
  if (input == null || String(input).trim() === "") {
    return field.required ? t("Value required") : null;
  }

  const inputStr = String(input).trim();
  const inputTime = parseDateTime(inputStr);
  if (inputTime === null) {
    return t("Invalid date format");
  }

  const { minTime, maxTime } = getCachedLimits(field);

  if (minTime !== null && inputTime < minTime) {
    return t("Date must be on or after {{1}}", field.minDate);
  }

  if (maxTime !== null && inputTime > maxTime) {
    return t("Date must be on or before {{1}}", field.maxDate);
  }

  return null;
}