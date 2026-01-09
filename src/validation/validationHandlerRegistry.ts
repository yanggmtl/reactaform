import type { 
  FieldCustomValidationHandler,
  FieldTypeValidationHandler,
  FormValidationHandler } from "../core/reactaFormTypes";
import BaseRegistry from "../core/baseRegistry";

const BUILTIN_TYPES = [
  "text",
  "multiline",
  "int",
  "float",
  "stepper",
  "checkbox",
  "select",
  "color",
  "rating",
  "file",
  "url",
  "email",
  "phone",
  "date",
  "time",
  "unit",
  "dropdown",
  "multi-selection",
  "int-array",
  "float-array",
]

export function isBuiltinType(typeName: string): boolean {
  return BUILTIN_TYPES.includes(typeName);
}

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
const fieldCustomValidationRegistry = new CategoryRegistry<FieldCustomValidationHandler>();

// Used for define new type field validation handlers
const fieldTypeValidationRegistry = new BaseRegistry<FieldTypeValidationHandler>();

export function registerFormValidationHandler(
  name: string,
  fn: FormValidationHandler
): void {
  formValidationRegistry.register(name, fn);
}

export function registerFieldCustomValidationHandler(
  category: string,
  name: string,
  fn: FieldCustomValidationHandler
): void {
  fieldCustomValidationRegistry.registerInCategory(category, name, fn);
}

export function registerFieldTypeValidationHandler(
  name: string,
  fn: FieldTypeValidationHandler
): void {
  if (isBuiltinType(name)) {
    console.warn(
      `[ReactaForm] Can't override builtin type field validation handler for type "${name}".`
    );
    return;
  }
  fieldTypeValidationRegistry.register(name, fn);
}

export function registerBuiltinFieldTypeValidationHandler(
  name: string,
  fn: FieldTypeValidationHandler
): void {
  fieldTypeValidationRegistry.register(name, fn);
}

export function getFieldCustomValidationHandler(category: string, name: string): FieldCustomValidationHandler | null {
  return fieldCustomValidationRegistry.getFromCategory(category, name) || null;
}

export function getFormValidationHandler(name: string): FormValidationHandler | null {
  return formValidationRegistry.get(name) || null;
} 

export function getFieldTypeValidationHandler(name: string): FieldTypeValidationHandler | null {
  return fieldTypeValidationRegistry.get(name) || null;
}

export function listFieldCustomValidationHandlers(category?: string): string[] {
  if (category) {
    return fieldCustomValidationRegistry.listFromCategory(category);
  }
  return fieldCustomValidationRegistry.listCategories();
}

export function listFormValidationHandlers(): string[] {
  return formValidationRegistry.list();
}

export default {
  registerFormValidationHandler,
  registerFieldCustomValidationHandler,
  registerFieldTypeValidationHandler,
  getFieldCustomValidationHandler,
  getFormValidationHandler,
  listFieldCustomValidationHandlers,
  listFormValidationHandlers,
};
