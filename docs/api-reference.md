# API Reference

A structured overview of the public API exported from the package root.  
See source root: `src/index.ts`.

---

## Table of Contents
1. [Types](#types)
2. [Components](#components)
3. [Context & Hooks & Debounce](#context--hooks--debounce)
4. [Layout Components](#layout-components)
5. [Style & theming](#style--theming)
6. [Component Registry](#component-registry)
7. [Translation](#translation)
8. [Definition & Instance Model Other Types](#definition--instance-model-other-types)
9. [Handler Registries](#handler-registries)
10. [Plugin System](#plugin-system)

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
  type: string; // 'string' | 'number' | 'boolean' | etc.
  defaultValue: FieldValueType;
  required?: boolean;
  parents?: ParentField;
  children?: Record<string, string[]>;
  group?: string;
  tooltip?: string;
  labelLayout?: 'row' | 'column-left' | 'column-center'; // Optional label layout: 'row' (default), 'column-left' (label left-aligned), or 'column-center' (label center-aligned)

  // Custom validation handler name
  validationHandlerName?: ValidationHandlerName;

  // Unit field properties
  dimension?: string; // for 'unit' type fields, e.g. 'length', 'angle', etc.
  defaultUnit?: string; // for 'unit' type fields

  // Enum/select field properties
  options?: Array<{ label: string; value: string }>;

  // Text/String field properties
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternErrorMessage?: string;
  placeholder?: string;
  
  // Numeric field properties
  min?: number;
  max?: number;
  minInclusive?: boolean;
  maxInclusive?: boolean;
  step?: number;

  // Array/collection properties
  minCount?: number;
  maxCount?: number;
  
  // Date/Time field properties
  minDate?: string;
  maxDate?: string;
  includeSeconds?: boolean; // for 'time' type fields
  
  // Layout properties
  layout?: 'horizontal' | 'vertical' | 'row' | 'column';
  alignment?: 'left' | 'center' | 'right';
  
  // Image/Display properties
  width?: number;
  height?: number;
  localized?: string;
  minHeight?: string; // For textarea minimum height
  
  // File input properties
  accept?: string; // e.g. "image/*,.pdf"
  multiple?: boolean;

  // Url input properties
  allowRelative?: boolean; // for 'url' type fields
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
```tsx
export interface ReactaFormProps {
  definitionData: string | Record<string, unknown> | ReactaDefinition; // JSON string, plain object, or typed definition
  language?: string;          // Language, "en", "fr", ...              
  instance?: ReactaInstance;  // Optional instance (if omitted, ReactaForm creates one from the definition)
  className?: string;         // Container css class
  theme?: string;             // Theme name (e.g. "light", "material-dark", custom)
  style?: React.CSSProperties; // Inline styles (merged into default style)
  fieldValidationMode?: FieldValidationMode; // "onEdit" | "onBlur" | "onSubmission" | "realTime"(deprecated)
  displayInstanceName?: boolean;             // Display and edit instance name in form
  onSubmit?: FormSubmissionHandler;          // Submission handler callback. When this is specified, the submit handler defined in definition will be skipped
  onValidation?: FormValidationHandler;      // Validation handler callback. When this is specified, the validation handler defined in definition will be skipped
}
```
---

### Validator & Handler Types
#### FieldCustomValidationHandler
- Description
  - Callback handler for field validation
  - Note: Don't use time consuming remote logic for validate field to avoid UI delay
  - Return: undefined when success, otherwise return error message

```tsx
export type FieldCustomValidationHandler = (
  fieldName: string,
  value: FieldValueType | unknown,
  t: TranslationFunction,
) => string | undefined;
```

#### FormSubmissionHandler
- Description
  - Callback handler for form submission
  - Support async operation and can transfer input data to server.
  - Return: undefined when success, otherwise return error messages

```tsx
export type FormValidationHandler = (
  valuesMap: Record<string, FieldValueType | unknown>,
  t: TranslationFunction,
) => string[] | Promise<string[] | undefined> | undefined;
```


#### FieldTypeValidationHandler
- Description
  - Callback validation handler for new type component
  - When you register a custom field component/type, provide its validation contract (e.g., `validateValue(value)`), so the form can call it during standard validation cycles.
  - This keeps validation logic close to component behavior while still integrating with form-level flows.
  - Return: if success, return undefined, otherwise return error messages

```tsx
export type FieldTypeValidationHandler = (
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction,
) => string | undefined;
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
#### ReactaFormContextType
```tsx
export type ReactaFormContextType = {
  definitionName: string;
  language: string;
  theme: string;
  formStyle: { container?: React.CSSProperties; titleStyle?: React.CSSProperties };
  fieldStyle: Record<string, unknown>;
  t: TranslationFunction;
  fieldValidationMode?: FieldValidationMode;
  displayInstanceName?: boolean;
}
```

### useReactaFormContext hook
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

## Style & theming

ReactaForm uses CSS variables as the single source of truth for styling.

### CSS Variables Reference {#css-variables-reference}

All themes use the same CSS variable system. Override these for custom styling:

#### Colors & Surfaces
- `--reactaform-primary-bg`:         Main container background
- `--reactaform-secondary-bg`:       Card/surface background
- `--reactaform-input-bg`:           Input field background
- `--reactaform-text-color`:         Primary text color
- `--reactaform-text-muted`:         Secondary/muted text
- `--reactaform-form-border-color`:  Form border color
- `--reactaform-border-color`:       Default border
- `--reactaform-border-hover`:       Hover border
- `--reactaform-border-focus`:       Focus border
- `--reactaform-error-color`:        Error state
- `--reactaform-success-color`:      Success state

#### Spacing & Layout
- `--reactaform-space`:             Base spacing unit
- `--reactaform-field-gap`:         Gap between fields
- `--reactaform-column-gap`:        Label to input gap in row layout
- `--reactaform-label-gap`:         Label to input gap in column layout
- `--reactaform-container-padding`: Form padding
- `--reactaform-input-padding`:     Input padding

#### Typography
- `--reactaform-font-family`:       Font stack
- `--reactaform-font-size `:        Base font size
- `--reactaform-font-weight`:       Font weight
- `--reactaform-label-font-family`: Field label font family
- `--reactaform-label-font-size`:   Field label font size
- `--reactaform-label-font-weight`: Field label font weight

#### Shape & Borders
- `--reactaform-border-radius`:       Control border radius
- `--reactaform-border-width`:        Border width
- `--reactaform-form-border-radius`:  Form border radius
- `--reactaform-form-border-style`:   Form border style
- `--reactaform-form-border-width`:   Form border width
- `--reactaform-group-border-radius`: Group border radius
- `--reactaform-group-border-style`:  Group boder style
- `--reactaform-group-border-width`:  Group border width

#### Buttons & Controls
- `--reactaform-button-bg`:         Button background
- `--reactaform-button-text`:       Button text color
- `--reactaform-button-hover-bg`:   Button hover state
- `--reactaform-button-padding`:    Button padding
- `--reactaform-button-font-size`:  Button font size

#### Tooltips
- `--reactaform-tooltip-bg`:        Tooltip background
- `--reactaform-tooltip-color`:     Tooltip text color

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

`{{'<index>'}}` is used to insert arguments dynamically.

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
| English  | t(text, args) — **Number 2 + Number 3 is equal to 5** |
| French   | t(text, args) — **Nombre 2 + Nombre 3 est égal à 5**  |

---

## Definition & Instance Model Other Types

### LoadDefinitionOptions

```ts
export interface LoadDefinitionOptions {
  validateSchema?: boolean;
}
```

### DefinitionLoadResult

```tsx
export interface DefinitionLoadResult {
  success: boolean;
  definition?: ReactaDefinition;
  error?: string;
}
```

### InstanceLoadResult
```tsx
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

#### FieldCustomValidationHandler
- Description
  Custom field validator function which user defined extra field validation locgic, returns error string or undefined if validation is valid.
```tsx
export type FieldCustomValidationHandler = (
  fieldName: string,
  value: FieldValueType | unknown,
  t: TranslationFunction,
) => string | undefined;
```

#### FieldTypeValidationHandler
- Description
  When define a new type of component, field type validator function should be defined to make Reactaform applying same validate logic to it as other existing components, returns error string or undefined if validation is valid.

```tsx
export type FieldTypeValidationHandler = (
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction,
) => string | undefined;
```

#### FormValidationHandler
- Description
  Custom form validator function to let the user defining validation before form submission. This validation includes cross fields check and time consuming validations. It returns error string or undefined if valid.

```tsx
export type FormValidationHandler = (
  valuesMap: Record<string, FieldValueType | unknown>,
  t: TranslationFunction,
) => string[] | Promise<string[] | undefined> | undefined;
```
---

### Registration functions

#### registerSubmissionHandler

Registrate custom submission handler

```ts
export function registerSubmissionHandler(
  submitterName: string, // The submission registered name for submission handler
  fn: FormSubmissionHandler
): void;
```

#### registerFieldCustomValidationHandler

Registrate field custom validation handler

```ts
export function registerFieldCustomValidationHandler(
  category: string,                 // Custom validation category which can be the name of definition
  name: string,                     // The validation registered name for validation handler
  fn: FieldCustomValidationHandler
): void
```

#### registerFieldTypeValidationHandler

Registrate field custom type validation handler for new type of component

```ts
export function registerFieldTypeValidationHandler(
  name: string,                    // new type name
  fn: FieldTypeValidationHandler   // type valifdation handler
): void
```

#### registerFormValidationHandler

Registrate form validation handler

```ts
export function registerFormValidationHandler(
  name: string, // The validation registered name for validation handler
  fn: FormValidationHandler // Form validation handler
): void;
```
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

- registerPlugin — Registers a plugin and all of its contributions
- unregisterPlugin — Removes a plugin and optionally its registered items
- getPlugin / getAllPlugins — Plugin introspection utilities
- hasPlugin — Checks if a plugin is registered
- registerComponents — Convenience helper for registering components only

