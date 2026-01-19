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
  definition: string;                      // Corresponding definition name
  version: string;                         // Instance version
  values: Record<string, FieldValueType>;  // values map
}
```

---

### ReactaFormProps
```ts
export interface ReactaFormProps {
  definitionData: string | Record<string, unknown> | ReactaDefinition; // JSON string, plain object, or typed definition
  language?: string;                 // Language, "en", "fr", ...
  instance?: ReactaInstance;         // Optional instance (if omitted, ReactaForm creates one from the definition)
  className?: string;                // Container css class
  theme?: string;                    // Theme name (e.g. "light", "material-dark", custom)
  style?: React.CSSProperties;       // Inline styles (merged into default style)
  fieldValidationMode?: FieldValidationMode; // "realTime" | "onSubmission"
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
  t: TranslationFunction            // Translation function for translating error messages
) => string | undefined;           
```

```ts
// Callback handler for form validation
// Used for validate relationship of fields, also can put time consuming field validation here
// Return: if success, return undefined, otherwise return error messages
export type FormValidationHandler = (
  valuesMap: Record<string, unknown>,
  t: TranslationFunction
) => string[] | undefined | Promise<string[] | undefined>;
```

```ts
// Callback handler for form submission
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
Context provider for translations, styling, language, theme and validation mode.
```ts
export const ReactaFormProvider: React.FC<ReactaFormProviderProps>;
```

## Context & Hooks & Debounce


### Context types
```ts
export type ReactaFormContextType = {
  definitionName: string;               // Definition name
  language: string;                     // Form language
  theme: string;                        // Theme name
  formStyle: { container?: React.CSSProperties; titleStyle?: React.CSSProperties }; // Form style
  fieldStyle: Record<string, unknown>;  // Field style
  t: TranslationFunction;               // Translation function
  fieldValidationMode?: FieldValidationMode; // Field validation timing
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

### <a id="css-variables-reference"></a> CSS Variables Reference

All themes use the same CSS variable system. Override these for custom styling:

#### Colors & Surfaces
```css
--reactaform-primary-bg        /* Main container background */
--reactaform-secondary-bg      /* Card/surface background */
--reactaform-input-bg          /* Input field background */
--reactaform-text-color        /* Primary text color */
--reactaform-text-muted        /* Secondary/muted text */
--reactaform-border-color      /* Default border */
--reactaform-border-hover      /* Hover border */
--reactaform-border-focus      /* Focus border */
--reactaform-error-color       /* Error state */
--reactaform-success-color     /* Success state */
--reactaform-link-color        /* Link color */
```

#### Spacing & Layout
```css
--reactaform-space             /* Base spacing unit */
--reactaform-space-lg          /* Large spacing */
--reactaform-field-gap         /* Gap between fields */
--reactaform-column-gap        /* Gap between columns */
--reactaform-inline-gap        /* Inline element gap */
--reactaform-label-gap         /* Label to input gap */
--reactaform-container-padding /* Container padding */
--reactaform-input-padding     /* Input padding */
```

#### Typography
```css
--reactaform-font-family       /* Font stack */
--reactaform-font-size         /* Base font size */
--reactaform-font-weight       /* Font weight */
--reactaform-line-height       /* Line height */
```

#### Shape & Borders
```css
--reactaform-border-radius     /* Border radius */
--reactaform-border-width      /* Border width */
```

#### Buttons & Controls
```css
--reactaform-button-bg         /* Button background */
--reactaform-button-text       /* Button text color */
--reactaform-button-hover-bg   /* Button hover state */
--reactaform-button-padding    /* Button padding */
--reactaform-button-font-size  /* Button font size */
```

#### Tooltips
```css
--reactaform-tooltip-bg        /* Tooltip background */
--reactaform-tooltip-color     /* Tooltip text color */
```

### CSS_CLASSES
Constant class registry.
```ts
export const CSS_CLASSES = {
  field: 'reactaform-field',
  label: 'reactaform-label',
  input: 'reactaform-input',
  textInput: 'reactaform-input--text',
  inputNumber: 'reactaform-input--number',
  inputSelect: 'reactaform-select',
  rangeInput: 'reactaform-input--range',
  button: 'reactaform-button',
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

<code v-pre>{{&lt;index&gt;}}</code> is used to insert arguments dynamically.

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
| English  | Number &#123;&#123;1&#125;&#125; + Number &#123;&#123;2&#125;&#125; is equal to &#123;&#123;3&#125;&#125; |
| French   | Nombre &#123;&#123;1&#125;&#125; + Nombre &#123;&#123;2&#125;&#125; est égal à &#123;&#123;3&#125;&#125;  |

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

### registerFieldCustomValidationHandler
```ts
export function registerFieldCustomValidationHandler(
  category: string,
  name: string,
  fn: FieldCustomValidationHandler
): void
```

### registerFormValidationHandler
```ts
export function registerFormValidationHandler(
  name: string,
  fn: FormValidationHandler
): void
```
