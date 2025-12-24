import type {
  ReactaDefinition,
  FieldValidationHandler,
  FormValidationHandler,
  FieldValueType,
  DefinitionPropertyField,
  TranslationFunction,
} from "./reactaFormTypes";
import {
  getFieldValidationHandler,
  getFormValidationHandler,
} from "./registries/validationHandlerRegistry";

function isThenable<T = unknown>(v: unknown): v is PromiseLike<T> {
  return (
    (typeof v === "object" || typeof v === "function") &&
    v !== null &&
    typeof (v as PromiseLike<T>).then === "function"
  );
}

// Cache for validation handlers to avoid repeated lookups
const fieldHandlerCache = new Map<string, FieldValidationHandler | null>();
const formHandlerCache = new Map<string, FormValidationHandler | null>();

// Validate a single field value using its validation handler
// Returns first error string or null if valid
export function validateFieldValue(
  definitionName: string,
  field: DefinitionPropertyField,
  value: FieldValueType | unknown,
  t: TranslationFunction
): string | null {
  if (!field) {
    return null;
  }

  let category: string | null = null;
  let key: string | null = null;
  if (typeof field.validationHandlerName === "string") {
    category = definitionName;
    key = field.validationHandlerName;
  } else if (Array.isArray(field.validationHandlerName)) {
    const [cat, k] = field.validationHandlerName;
    if (k) {
      category = cat;
      key = k;
    } else if (cat) {
      category = definitionName;
      key = cat;
    }
  }

  if (category === null || key === null) {
    return null;
  }

  const cacheKey = `${category}:${key}`;

  // Check cache first
  if (!fieldHandlerCache.has(cacheKey)) {
    // Lookup by category and handler name (not the cacheKey which includes the category)
    const validationHandler = getFieldValidationHandler(
      category,
      key
    );
    fieldHandlerCache.set(cacheKey, validationHandler);
  }

  const validationHandler = fieldHandlerCache.get(cacheKey);
  if (validationHandler) {
    try {
      const res = validationHandler(field.name, value, t);
      return res || null;
    } catch (err) {
      // If validation throws, surface as error string
      return String(err instanceof Error ? err.message : err);
    }
  }
  return null;
}

// Validate entire form values using form-level validation handler
// Returns array of error strings or null if valid
export async function validateFormValues(
  definition: ReactaDefinition | null,
  valuesMap: Record<string, FieldValueType | unknown>,
  t: (key: string) => string
): Promise<string[] | null> {
  if (
    definition &&
    typeof (definition as ReactaDefinition).validationHandlerName === "string"
  ) {
    const handlerName = (definition as ReactaDefinition)
      .validationHandlerName as string;

    // Check cache first
    if (!formHandlerCache.has(handlerName)) {
      const validationHandler = getFormValidationHandler(handlerName);
      formHandlerCache.set(handlerName, validationHandler);
    }

    const validationHandler = formHandlerCache.get(handlerName);
    if (validationHandler) {
      try {
        const res = validationHandler(valuesMap, t);
        if (isThenable(res)) {
          return (await res) || null;
        }
        return (res as string[] | undefined) || null;
      } catch (err) {
        return [String(err instanceof Error ? err.message : err)];
      }
    }
  }
  return null;
}

// Clear cache (useful for testing or dynamic handler updates)
export function clearValidationCache(): void {
  fieldHandlerCache.clear();
  formHandlerCache.clear();
}

export default {
  validateFieldValue,
  validateFormValues,
  clearValidationCache,
};
