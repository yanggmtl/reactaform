import type {
  ReactaDefinition,
  FieldValidationHandler,
  FormValidationHandler,
  FieldValueType,
  DefinitionPropertyField,
  TranslationFunction,
} from "./reactaFormTypes";
import { getFieldValidationHandler, getFormValidationHandler } from "./registries/validationHandlerRegistry";

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
  if (field && typeof field.validationHandlerName === "string") {
    const cacheKey = `${definitionName}:${field.validationHandlerName}`;
    
    // Check cache first
    if (!fieldHandlerCache.has(cacheKey)) {
      const validationHandler = getFieldValidationHandler(definitionName, field.validationHandlerName);
      fieldHandlerCache.set(cacheKey, validationHandler);
    }
    
    const validationHandler = fieldHandlerCache.get(cacheKey);
    if (validationHandler) {
      try {
        const res = validationHandler(value, t);
        // If handler returned a Promise, we can't await here (API is sync),
        // so treat as no error. Consumers that need async validation
        // should register form-level async validators or handle async logic
        // inside their components and call `onError` appropriately.
        if (isThenable(res)) {
          return null;
        }
        return (res as string | undefined) || null;
      } catch (err) {
        // If validation throws, surface as error string
        return String(err instanceof Error ? err.message : err);
      }
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
  if (definition && typeof (definition as ReactaDefinition).validationHandlerName === "string") {
    const handlerName = (definition as ReactaDefinition).validationHandlerName as string;
    
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
