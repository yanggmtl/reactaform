import type { DefinitionPropertyField, FieldValidationHandler, FieldValueType, FormValidationHandler, TranslationFunction } from "../core/reactaFormTypes";
import BaseRegistry from "../core/baseRegistry";
export type BuiltinFieldValidationHandler = (
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction,
) => string | null;

// Enhanced registry that supports categorized field validators
class CategoryRegistry<T> extends BaseRegistry<Record<string, T>> {
  registerInCategory(category: string, name: string, value: T): void {
    if (!this.get(category)) {
      this.register(category, {});
    }
    const categoryMap = this.get(category)!;
    categoryMap[name] = value;
  }

  getFromCategory(category: string, name: string): T | undefined {
    return this.get(category)?.[name];
  }

  listFromCategory(category: string): string[] {
    return Object.keys(this.get(category) || {});
  }

  listCategories(): string[] {
    return this.list();
  }
}

const formValidationRegistry = new BaseRegistry<FormValidationHandler>();
const fieldValidationRegistry = new CategoryRegistry<FieldValidationHandler>();
const builtinFieldValidationRegistry = new BaseRegistry<BuiltinFieldValidationHandler>();

export function registerFormValidationHandler(
  name: string,
  fn: FormValidationHandler
): void {
  formValidationRegistry.register(name, fn);
}

export function registerFieldValidationHandler(
  category: string,
  name: string,
  fn: FieldValidationHandler
): void {
  fieldValidationRegistry.registerInCategory(category, name, fn);
}

export function registerBuiltinFieldValidationHandler(
  name: string,
  fn: BuiltinFieldValidationHandler
): void {
  builtinFieldValidationRegistry.register(name, fn);
}

export function getFieldValidationHandler(category: string, name: string): FieldValidationHandler | null {
  return fieldValidationRegistry.getFromCategory(category, name) || null;
}

export function getFormValidationHandler(name: string): FormValidationHandler | null {
  return formValidationRegistry.get(name) || null;
}

export function getBuiltinFieldValidationHandler(name: string): BuiltinFieldValidationHandler | null {
  return builtinFieldValidationRegistry.get(name) || null;
}

export function listFieldValidationHandlers(category?: string): string[] {
  if (category) {
    return fieldValidationRegistry.listFromCategory(category);
  }
  return fieldValidationRegistry.listCategories();
}

export function listFormValidationHandlers(): string[] {
  return formValidationRegistry.list();
}

export default {
  registerFormValidationHandler,
  registerFieldValidationHandler,
  getFieldValidationHandler,
  getFormValidationHandler,
  listFieldValidationHandlers,
  listFormValidationHandlers,
};
