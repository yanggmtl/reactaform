# ReactaForm API Reference

A structured overview of the public API exported from the package root.  
See source root: `src/index.ts`.

---

## Table of Contents
1. [Types](#types)
2. [Components](#components)
3. [Context & Hooks & Debounce](#context--hooks--debounce)
4. [Layout Components](#layout-components)
5. [CSS Utilities](#css-utilities)
6. [Component Registry](#component-registry)
7. [Plugin System](#plugin-system)
8. [Translation](#translation)
9. [Validation API](#validation-api)
10. [Definition & Instance Model](#definition--instance-model)
11. [Handler Registries](#handler-registries)

---

## Types

### FieldValueType
```ts
export type FieldValueType =
  | boolean
  | number
  | string
  | number[]
  | string[]
  | [number, string]
  | File
  | File[];
```
Source: `src/core/reactaFormTypes.ts`

---

### DefinitionPropertyField
Defines a single field within a form definition.
```ts
export interface DefinitionPropertyField {
  name: string;
  displayName: string;
  type: string;
  defaultValue: FieldValueType;
  required?: boolean;
  parents?: Record<string, string[] | number[]>;
  children?: Record<string, string[]>;
  group?: string;
  tooltip?: string;
  validationHandlerName?: string | [string] | [string, string];
  ......
}
```
Check component schema files for the fields used by different type of components. [Built-in Components](./built-in-components.md)

---

### ReactaDefinition
```ts
export interface ReactaDefinition {
  name: string;                           // Definition name
  version: string;                        // Definition version
  displayName: string;                    // Display name for UI, need localized
  localization?: string;                  // Localization map name for this form
  properties: DefinitionPropertyField[];  // Properties array
  validationHandlerName?: string;         // Form validation handler name - should be registered
  submitHandlerName?: string;             // Form submission handler name - should be registered
}
```

---

### ReactaInstance
```ts
export interface ReactaInstance {
  name: string;                            // Instance name
  definition: string;                      // Correspodent definition name
  version: string;                         // Instance version
  values: Record<string, FieldValueType>;  // values map
}
```

---

### ReactaFormProps
```ts
export interface ReactaFormProps {
  definitionData: string | Record<string, unknown>; // Can be json string or json data
  language?: string;           // Language, "en", "fr", ...
  instance?: ReactaInstance;   // instance of definitionData
  className?: string;          // css class name
  darkMode?: boolean;          // Dark mode flag, true for dark mode, otherwise, it is normal light mode
  style?: React.CSSProperties; // Currently only height and width are processed.
                               // Additional styles can be customized using CSS variables
}
```

---

### Validator & Handler Types
```ts
// Callback handler for field validation
// Note: Don't use time consuming remote logic for validate field to avoid UI delay
// Return: undefined when success, otherwise return error message
export type FieldValidationHandler = (
  fieldName: string;                // Field name to validate
  value: FieldValueType | unknown,  // Input field value
  t: TranslationFunction            // Translation funtion for translate error message
) => string | undefined;           
```

```ts
// Callbak handler for form validation
// Used for validate relationship of fields, also can put time consuming field validation here
// Return: if success, return undefined, otherwise return error messages
export type FormValidationHandler = (
  valuesMap: Record<string, unknown>,
  t: TranslationFunction
) => string[] | undefined | Promise<string[] | undefined>;
```

```ts
// Callbak handler for form submission
// Support async operation and can transfer input data to server.
// Return: undefined when success, otherwise return error messages
export type FormSubmissionHandler = (
  definition: ReactaDefinition | Record<string, unknown>,
  instanceName: string | null,
  valuesMap: Record<string, unknown>,
  t: TranslationFunction
) => string[] | undefined | Promise<string[] | undefined>;
```

---

## Components

### ReactaForm (default)
Top level convenience component.
```ts

const ReactaForm: React.FC<ReactaFormProps>;
```
Renders provider + renderer automatically.

---

### ReactaFormRenderer
Lower‑level rendering engine.
```ts
export interface ReactaFormRendererProps {
  definition: ReactaDefinition;
  instance: ReactaInstance;
  chunkSize?: number;
  chunkDelay?: number;
}
```

---

### ReactaFormProvider
Context provider for translations, styling, language and dark mode.
```ts
export const ReactaFormProvider: React.FC<ReactaFormProviderProps>;
```

## Context & Hooks & Debounce


### Context types
```ts
export type ReactaFormContextType = {
  definitionName: string;               // Definition name
  language: string;                     // Form language
  darkMode: boolean;                    // Dark mode flag
  formStyle: { container?: React.CSSProperties; titleStyle?: React.CSSProperties }; // Form style
  fieldStyle: Record<string, unknown>;  // Field style
  t: TranslationFunction;               // Translation function
};
```
### useReactaFormContext
Returns form context.
```ts
// Declaration
const useReactaFormContext = (): ReactaFormContextType;

// Usage
const {definitionName, t} = useReactaFormContext();
```

### Debounce Utilities

Debounce logic is applied to input components to reduce display refreshes and improve performance.

#### DebouncedCallback type
```ts
export type DebouncedCallback = {
  callback: (...args: unknown[]) => void;
  cancel: () => void;
  flush: () => void;
};
```
#### useDebouncedCallback
```ts
export function useDebouncedCallback(
  callback: (...args: unknown[]) => unknown, // function to call
  wait = 300,                                // debounce delay in ms
  options?: { leading?: boolean }            // options.leading: if true, call on leading edge (optional)
): DebouncedCallback                         // Returns { callback, cancel, flush } where callback is debounced.
```

---

## Layout Components
- `StandardFieldLayout`
This layout is used for defining custom component value input element
Standard layout signature:
```ts
export const StandardFieldLayout: React.FC<{
  field: DefinitionPropertyField; // Field definition
  error?: string | null;          // Report error for display 
  children: React.ReactNode;      // Include inputs
  rightAlign?: boolean;           // Control input align left or right
}>;
```

---

## CSS Utilities

### CSS_CLASSES
Constant class registry.
```ts
export const CSS_CLASSES = {
  field: 'reactaform-field',
  label: 'reactaform-label',
  input: 'reactaform-input',
};
```

### combineClasses
Utility helper.
```ts
combineClasses(...classes): string;
```

---

## Component Registry
```ts
// Register component in ReactaForm
// This function is used for register custom component into ReactaForm
// Input: type: the type of component
//        component: React Component 
registerComponent(type: string, component: unknown): void;

// Get Component from type
// For example: getComponent("int"); will return IntegerInput component
getComponent(type: string): unknown;
```

---

## Translation
```ts
export type TranslationFunction = (
  text: string,          // Input translate text
  ...args: unknown[]     // Arguments can be applied 
) => string;             // Output is the translated text
```
###  Notes

`{{<index>}}` is used to insert arguments dynamically.

- `index` represents the **(index + 1)-th argument**
- Arguments are replaced in order

###  Example

```
Template Text
   Number {{1}} + Number {{2}} is equal to {{3}}

Arguments
   [2, 3, 5]

Result
   Number 2 + Number 3 is equal to 5
```

### Internationalization Example
| Language | Translation Template                          |
|----------|-----------------------------------------------|
| English  | Number {{1}} + Number {{2}} is equal to {{3}} |
| French   | Nombre {{1}} + Nombre {{2}} est égal à {{3}}  |

### Runtime Usage
| Language | Output                                                |
|----------|-------------------------------------------------------|
| English  | t(text, args) → **Number 2 + Number 3 is equal to 5** |
| French   | t(text, args) → **Nombre 2 + Nombre 3 est égal à 5**  |

---

## Plugin System
The Plugin System enables extensibility by allowing external packages or user code to contribute:

- Custom components

- Field and form validators

- Submission handlers

Plugins provide a single, cohesive way to register multiple extensions at once.

### ReactaFormPlugin
ReactaFormPlugin allows users to define custom components, validators, and submission handlers in a single plugin definition.
```ts
export interface ReactaFormPlugin {
  name: string;          // Unique plugin name
  version: string;       // Plugin version
  description?: string;  // Optional plugin description

  // Map of component type -> React component
  components?: Record<string, React.ComponentType<unknown>>;

  // Map of definition/category -> (validator name -> validator)
  fieldValidators?: Record<string, Record<string, FieldValidationHandler>>;

  // Map of validator name -> validator
  formValidators?: Record<string, FormValidationHandler>;

  // Map of handler name -> submission handler
  submissionHandlers?: Record<string, FormSubmissionHandler>;

  // Called when the plugin is registered
  setup?: () => void;

  // Called when the plugin is unregistered
  cleanup?: () => void;
}
```
### Plugin Management APIs
```ts
registerPlugin(plugin, options?);
unregisterPlugin(pluginName, removeRegistrations?);
getPlugin(name);
getAllPlugins();
hasPlugin(name);
registerComponents(record);
```

### API overview:

registerPlugin — Registers a plugin and all of its contributions

unregisterPlugin — Removes a plugin and optionally its registered items

getPlugin / getAllPlugins — Plugin introspection utilities

hasPlugin — Checks if a plugin is registered

registerComponents — Convenience helper for registering components only

---


## Definition & Instance Model
### Types
```ts
export interface ReactaDefinition {
  name: string;
  version: string;
  displayName: string;
  localization?: string;
  properties: DefinitionPropertyField[];
  validationHandlerName?: string;
  submitHandlerName?: string;
}

export interface ReactaInstance {
  name: string;
  definition: string;
  version: string;
  values: Record<string, FieldValueType>;
}

export interface LoadDefinitionOptions {
  validateSchema?: boolean;
}

export interface DefinitionLoadResult {
  success: boolean;
  definition?: ReactaDefinition;
  error?: string;
}

export interface InstanceLoadResult {
  success: boolean;
  instance?: ReactaInstance;
  error?: string;
}

```

### loadJsonDefinition
```ts
export async function loadJsonDefinition(
  jsonData: string,
  options: LoadDefinitionOptions = {}
): Promise<DefinitionLoadResult>;
```

### createInstanceFromDefinition
```ts
export function createInstanceFromDefinition(
  definition: ReactaDefinition, 
  name: string
): InstanceLoadResult;
```

loadInstance(instanceData);
```ts
export function loadInstance(
  instanceData: string | Record<string, unknown>
): InstanceLoadResult;
```

### upgradeInstanceToLatestDefinition
```ts
export function upgradeInstanceToLatestDefinition(
  oldInstance: ReactaInstance,
  latestDefinition: ReactaDefinition,
  // optional callback allowing custom upgrade logic
  callback?: (oldInstance: ReactaInstance, newInstance: Record<string, unknown>, latestDefinition: ReactaDefinition) => void
): InstanceLoadResult;
```

---

## Handler Registries
Handler registries enables users inject custom process in ReactaForm
### Types
```ts
// Field validator function: returns error string or undefined if valid
export type FieldValidationHandler = (
  fieldName: string,
  value: FieldValueType | unknown,
  t: TranslationFunction,
) => string | undefined;

// Form validator function: takes entire values map,
// and returns error string or undefined if valid
// This is used for cross fields validation
export type FormValidationHandler = (
  valuesMap: Record<string, FieldValueType | unknown>,
  t: TranslationFunction,
) => string[] | undefined | Promise<string[] | undefined>;
```


### registerSubmissionHandler
```ts
export function registerSubmissionHandler(
  submitterName: string,
  fn: FormSubmissionHandler
): void
```

### registerFieldValidationHandler
```ts
export function registerFieldValidationHandler(
  category: string,
  name: string,
  fn: FieldValidationHandler
): void
```

### registerFormValidationHandler
```ts
export function registerFormValidationHandler(
  name: string,
  fn: FormValidationHandler
): void
```
