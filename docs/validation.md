# Validation

## Built-in Validation

ReactaForm provides a set of declarative, built-in validators you can set directly on property definitions. These cover the most common needs and work out-of-the-box in the renderer and builder.

- Required: set `required: true`.
- Numeric bounds: `min`, `max` with optional `minInclusive` / `maxInclusive` flags for inclusive/exclusive checks.
- Text and Multiline: `minLength`, `maxLength` for length.
- Array (int & float) item count: `minCount`, `maxCount`.
- Date: `minDate`, `maxDate`.
- Pattern (regex): provide a `pattern` string and a `patternErrorMessage` for a user-friendly/localized message.
- Enum / options checks: define `options` as an array of `{ label, value }` and the renderer will validate that selected `defaultValue` (if any) exists in the options list.
- Type-specific notes: some rules apply only to certain types (e.g., `step` for numeric steppers, `precision` for floats, date formats for `date`).

Example — pattern with custom message:

```json
{
  "name": "zip",
  "type": "text",
  "pattern": "^[0-9]{5}$",
  "patternErrorMessage": "Please enter a 5-digit ZIP code"
}
```

Example — options and default validation:

```json
{
  "name": "country",
  "type": "dropdown",
  "options": [{ "label": "US", "value": "us" }, { "label": "CA", "value": "ca" }],
  "defaultValue": "us"
}
```

Notes:

- Precedence: built-in validators are evaluated prior to custom field/form handlers; custom validators may override or augment these checks.
- Messages: prefer returning message keys or using `patternErrorMessage` so the renderer or your `t()` helper can localize messages consistently.
- Builder: the visual builder surfaces these rules and will warn about mismatches (for example, a `defaultValue` not found in `options`).

## Field-level Validation

Field-level validators validate a single property. They are ideal for format checks, value ranges, and synchronous field-specific checks.

**Important:** Field-level validators must be **synchronous**. For async validation (e.g., API calls to check uniqueness), use form-level validation instead.

Usage:

- In the field definition, set `validationHandlerName` to the registered handler name.
- Register the handler in application code with `registerFieldValidationHandler(name, handler)`.
- Handler signature: `(value, t) => string | undefined`.

Example:

```ts
// synchronous handler
registerFieldValidationHandler('evenNumber', (value, t) => {
  if (typeof value !== 'number' || value % 2 !== 0) {
    return t('errors.mustBeEven') || 'Value must be an even number';
  }
  return undefined; // valid
});

// field definition (JSON)
{
  "name": "count",
  "type": "integer",
  "validationHandlerName": "evenNumber"
}
```

Notes:

- Triggers: field validators typically run on `change` depending on form config.
- Return value: return `undefined` for valid values, or an error message string for invalid values.
- Localization: use the `t` function to translate error messages.
- **No async:** Field validators must be synchronous. For async checks like API calls, use form-level validation.

## Form-level Validation

Form-level validators run across multiple fields and are useful for:
- Cross-field rules (e.g. password confirmation, combined constraints)
- Server-side checks that need full form context
- **Async validation** such as API calls (e.g., uniqueness checks, external validation services)

**Important:** Form-level validation **supports both synchronous and asynchronous** handlers. This is the only place where async validation is allowed.

Usage:

- Register a handler with `registerFormValidationHandler(name, handler)`.
- Reference the handler name in the form JSON using `validationHandlerName` at the top-level.
- Handler signature: `(values, t) => string[] | undefined | Promise<string[] | undefined>`.

Examples:

```ts
// Synchronous form validation
registerFormValidationHandler('passwordMatch', (values, t) => {
  if (values.password !== values.confirmPassword) {
    return [t('errors.passwordMismatch') || 'Passwords must match'];
  }
  return undefined;
});

// Asynchronous form validation (API call)
registerFormValidationHandler('uniqueEmailCheck', async (values, t) => {
  const errors: string[] = [];
  if (values.email && !(await api.isEmailUnique(values.email))) {
    errors.push(t('errors.emailInUse') || 'Email already in use');
  }
  return errors.length ? errors : undefined;
});

// form definition (JSON)
{
  "name": "signup",
  "validationHandlerName": "uniqueEmailCheck",
  "properties": [ /* ... */ ]
}
```

Notes:

- Triggering: form-level validators run on submit by default, though apps can provide hooks to run them earlier.
- Return value: return `undefined` for valid forms, or an array of error message strings for invalid forms.
- Localization: use the provided `t` helper in handlers to translate error messages.
- **Async support:** Form-level validators can be async (return a Promise). The form will wait for the Promise to resolve before proceeding.

## Async Validation

**Async validation is only supported at the form level, not at the field level.**

For async validation needs (such as API calls to check uniqueness), use form-level validators:

```ts
registerFormValidationHandler('uniqueUsername', async (values, t) => {
  if (!values.username) return undefined;
  
  const isAvailable = await api.isUsernameAvailable(values.username);
  if (!isAvailable) {
    return [t('errors.usernameTaken') || 'Username already taken'];
  }
  return undefined;
});
```

Best practices for async validation:
- Debounce user input to avoid excessive API calls
- Show pending state in the UI during validation
- Handle errors gracefully (network failures, timeouts)
- Consider caching results to avoid duplicate checks

## Error Messages

Error messaging should be consistent and localizable. Prefer message keys (resolved via your `t()` helper) or use the dedicated per-field message properties so translators can provide localized text.

- Use per-rule message properties where available (e.g. `patternErrorMessage`) so the renderer and builder can surface friendly, localized text.

Example — use i18n key in schema and resolve in code:

```json
{
  "name": "zip",
  "type": "text",
  "pattern": "^[0-9]{5}$",
  "patternErrorMessage": "ZIP code must be exactly 5 digits (0–9)"
}
```

```ts
// inside a validator or renderer
const message = t ? t(field.patternErrorMessage || 'Invalid value') : 'Invalid value';
```

- Validator return error (field validator) or values (form validator) which can be localized if needed. See previous example.

## Validation Triggers
- Common flows: `Change`, and `Submit`. Choose per form/field for the desired UX.
