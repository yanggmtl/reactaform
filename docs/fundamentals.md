# Fundamentals

**Purpose:** Explain the mental model behind **ReactaForm** and how its components, validation, submission, and localization work together.


  ## 1. ReactaForm definition

  - A *definition* is a JSON (or JS) structure that declares the form: its fields, layout, default values, validation rules, and metadata (labels, keys, submit handler name). Think of it as the schema for a single form UI and behavior.
  - Typical parts of a definition:
    - `fields`: array or object describing each field (type, key, label, default, rules)
    - `layout`: optional instructions for field placement and grouping
    - `submit`: the named submission handler or flag to use `onSubmit`
    - `meta`: i18n keys, descriptions, or per-field options

  Why use definitions? They make forms declarative, serializable, and easy to store or generate at runtime.

  ## 2. ReactaForm instance

  - A *form instance* is what you get when you render a definition with ReactaForm: live state, field values, error state, and event handlers.
  - The instance maintains:
    - current values for each field
    - validation errors (field-level and form-level)
    - touched/dirty flags
    - registration of submission handlers and side-effects
  - Instances are independent — you can render multiple forms on a page with different themes or definitions.

  ## 3. `ReactaFormProvider` and `ReactaFormRenderer`

  - `ReactaFormProvider`:
    - Global provider that supplies defaults, registered handlers, translations, and shared utilities.
    - Configure default theme, `t()` implementation, and global submission handler registry.
    - Use when you want consistent behavior across multiple forms in your app.

  - `ReactaFormRenderer` (or the `ReactaForm` component):
    - Takes a form definition and renders a running form instance.
    - Consumes context from `ReactaFormProvider` (if present) for i18n, handlers, and defaults.
    - Handles mounting/unmounting, local instance state, and wiring of field components to the definition.

  Example usage pattern:

  ```tsx
  <ReactaForm definition={signupDefinition} onSubmit={localSubmit} />
  ```

  ## 4. Submission logic

  - Two main ways to submit:
    1. Pass an `onSubmit` prop to the rendered form instance (inline handler).
    2. Reference a named submission handler defined in the definition and registered with the provider.

  - Priority: `onSubmit` prop (direct) overrides the registered named handler.

  - Submission flow:
    1. User triggers submit (button or programmatic call).
    2. Form performs synchronous and async validation (see Validation section).
    3. If validation passes, the form constructs a structured payload `{ values, meta }`.
    4. The payload is handed to the resolved handler (direct `onSubmit` or registered function).
    5. Handler may return a promise — the form tracks pending state and applies success/error handling.

  - Registering a submission handler:

    - Add the handler to the provider registry (`register={{ name: handler }}`) or use the registration API.
    - In the definition set `submit: 'name'` to link the definition to that handler.

  Example: register and reference a handler

  ```tsx
  function submitSignup(payload) { /* send to API */ }

  <ReactaForm definition={{ submit: 'submitSignup', fields: [...] }} />
  ```

  ## 5. Validation

  Validation in ReactaForm is layered. Different types of validation run at different times and for different purposes.

  1) Built-in validation (declaration in definition)

    - Rules declared on fields (e.g. `required`, `min`, `max`, `pattern`, `enum/options`) are executed automatically.
    - These can be synchronous or return a promise for async checks.
    - Messages can be localized via the `t()` system.

  2) Custom form-level validation (runs during submission)

    - Use when you need to validate relationships between fields (e.g., date ranges, conditional requirements).
    - Typically executed as part of the submit flow; if it fails, submission is blocked and form-level errors are set.
    - You can supply a `validationHandlerName` hook in the definition or provider.

  3) Custom field validation (validate single field)

    - For field-specific complex checks, definitions can include a `validationHandlerName` function on the field.
    - Runs on demand (e.g., on blur or programmatic validation) and returns an error message or null.

  4) Custom field-type validation (for custom components)

    - When you register a custom field component/type, provide its validation contract (e.g., `validateValue(value)`), so the form can call it during standard validation cycles.
    - This keeps validation logic close to component behavior while still integrating with form-level flows.

  5) Use the `fieldValidationMode` prop on ReactaForm to control whether field validation runs during editing or only on form submission.

  Validation best practices

  - Keep field rules fast and declarative; push cross-field rules to form-level validators.
  - Use async validators sparingly and provide good UX for pending states.

  ## 6. Style & Theme

  - Styling is powered by CSS variables. Themes are CSS files that set `--reactaform-*` variables scoped to `data-reactaform-theme` on the form container.
  - Configure a theme by importing a theme CSS and setting the `theme` prop on the form (or using provider defaults).
  - For the full list of variables and examples, see the API reference: [CSS Variables Reference](./api-reference.md#style--theming).

  ## 7. Internationalization (i18n)

  - ReactaForm emits translatable keys and consumes a `t()` function for message resolution (labels, validation messages, help text).
  - Supply translations via `ReactaFormProvider` (locale bundles) or pass a `t` implementation to the form instance.
  - Users can define their own translation dictionaries, scoped per app or form.

  ## Summary

  - `Definition`: declarative form schema.  
  - `Instance`: running form with values, errors, and lifecycle.  
  - `Provider`: global configuration, handler registry, and i18n.  
  - `Renderer` / `ReactaForm`: renders a definition into an instance.  
  - `Submission`: validated payload passed to `onSubmit` or a registered handler.  
  - `Validation`: layered (built-in rules, form-level, field validate, custom type validate).  
  - `Styling`: CSS-variable-driven themes.  
  - `i18n`: `t()`-based localization supplied via provider.
