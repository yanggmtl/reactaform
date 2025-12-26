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
  if (!field || !field.validationHandlerName) {
    return null;
  }

  let category: string;
  let key: string;
  
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
    } else {
      return null;
    }
  } else {
    return null;
  }

  const cacheKey = `${category}:${key}`;

  // Check cache first
  let validationHandler = fieldHandlerCache.get(cacheKey);
  if (validationHandler === undefined) {
    // Lookup by category and handler name
    validationHandler = getFieldValidationHandler(category, key) || null;
    fieldHandlerCache.set(cacheKey, validationHandler);
  }

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
  if (!definition || typeof definition.validationHandlerName !== "string") {
    return null;
  }

  const handlerName = definition.validationHandlerName;

  // Check cache first
  let validationHandler = formHandlerCache.get(handlerName);
  if (validationHandler === undefined) {
    validationHandler = getFormValidationHandler(handlerName) || null;
    formHandlerCache.set(handlerName, validationHandler);
  }

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
