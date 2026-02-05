import type { FieldValueType, ErrorType, TranslationFunction } from "../reactaFormTypes";
import BaseRegistry from "./baseRegistry";

/**
 * Button Handler function type
 * Button handlers can access all form values, change any field value, and report errors
 * 
 * @param valuesMap - All form values (read-only)
 * @param handleChange - Function to update any field's value
 * @param handleError - Function to report errors for any field
 * @param t - Translation function
 * @returns void or Promise<void>
 */
export type ButtonHandler = (
  valuesMap: Record<string, FieldValueType>,
  handleChange: (fieldName: string, value: FieldValueType) => void,
  handleError: (fieldName: string, error: ErrorType) => void,
  t: TranslationFunction,
) => void | Promise<void>;

const registry = new BaseRegistry<ButtonHandler>();

/**
 * Register a button handler function
 * @param handlerName - The name to register the handler under (referenced in definition's action property)
 * @param fn - The button handler function
 */
export function registerButtonHandler(handlerName: string, fn: ButtonHandler): void {
  registry.register(handlerName, fn);
}

/**
 * Get a registered button handler by name
 * @param handlerName - The name of the handler to retrieve
 * @returns The button handler function or undefined if not found
 */
export function getButtonHandler(handlerName: string): ButtonHandler | undefined {
  return registry.get(handlerName);
}

/**
 * Check if a button handler is registered
 * @param handlerName - The name of the handler to check
 * @returns true if the handler is registered, false otherwise
 */
export function hasButtonHandler(handlerName: string): boolean {
  return registry.has(handlerName);
}

/**
 * Unregister a button handler
 * @param handlerName - The name of the handler to unregister
 * @returns true if the handler was found and removed, false otherwise
 */
export function unregisterButtonHandler(handlerName: string): boolean {
  return registry.unregister(handlerName);
}

/**
 * List all registered button handler names
 * @returns Array of registered handler names
 */
export function listButtonHandlers(): string[] {
  return registry.list();
}

export default registry;
