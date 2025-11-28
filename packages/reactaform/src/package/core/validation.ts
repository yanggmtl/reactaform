import type {
  ReactaDefinition,
  FieldValidationHandler,
  FormValidationHandler,
  FieldValueType,
  DefinitionPropertyField,
} from "./reactaFormTypes";
import { getFieldValidationHandler, getFormValidationHandler } from "./registries/validationHandlerRegistry";

// Cache for validation handlers to avoid repeated lookups
const fieldHandlerCache = new Map<string, FieldValidationHandler | null>();
const formHandlerCache = new Map<string, FormValidationHandler | null>();

// Validate a single field value using its validation handler
// Returns first error string or null if valid
export function validateFieldValue(
  definitionName: string,
  field: Partial<DefinitionPropertyField>,
  value: FieldValueType | unknown,
  t: (key: string) => string
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
      return validationHandler(value, t) || null;
    }
  }
  return null;
}

// Validate entire form values using form-level validation handler
// Returns array of error strings or null if valid
export function validateFormValues(
  definition: ReactaDefinition | null,
  valuesMap: Record<string, FieldValueType | unknown>,
  t: (key: string) => string
): string[] | null {
  if (definition && typeof (definition as ReactaDefinition).validationHandlerName === "string") {
    const handlerName = (definition as ReactaDefinition).validationHandlerName as string;
    
    // Check cache first
    if (!formHandlerCache.has(handlerName)) {
      const validationHandler = getFormValidationHandler(handlerName);
      formHandlerCache.set(handlerName, validationHandler);
    }
    
    const validationHandler = formHandlerCache.get(handlerName);
    if (validationHandler) {
      return validationHandler(valuesMap, t) || null;
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
