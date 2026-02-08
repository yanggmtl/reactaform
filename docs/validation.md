# Validation

## Built-in Validation

ReactaForm provides a set of declarative, built-in validators you can set directly on property definitions. These cover the most common needs and work out-of-the-box in the renderer.

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

## Field Validation Mode

The field validation mode determines when field validation is performed: either in the field is in editing, or when the form is submitted.

FieldValidationMode values:

  - "onEdit" — Validation occurs as the field is in editing. Errors are displayed immediately.
  - "onSubmission" — Validation occurs during form submission. If validation fails, the form is not submitted.
  - "realTime" — Deprecated. Same as "onEdit".

Example:
```ts
  // Field validation on field edit
  <ReactaForm
    definitionData={definition}
    instance={instance}
    fieldValidationMode="onEdit"
  />;

  // Field validation on form submission
  <ReactaForm
    definitionData={definition}
    instance={instance}
    fieldValidationMode="onSubmission"
  />;
```

## Field-level Validation

Field-level validators validate a single property. They are ideal for format checks, value ranges, and field-specific async checks (e.g. uniqueness).

Usage:

- In the field definition, set `validationHandlerName` to the registered handler name.
- Register the handler in application code with `registerFieldCustomValidationHandler(name, handler)`.
- Handler signature: `(value, t) => string | null`.

Examples:

```ts
// synchronous handler
registerFieldCustomValidationHandler('evenNumber', (value, t) => {
  if (typeof value !== 'number' || value % 2 !== 0) {
    return t('Value must be an even number');
  }
  return null;
});

// asynchronous handler
registerFieldCustomValidationHandler('uniqueUsername', async (value, t) => {
  const ok = await api.isUsernameAvailable(value);
  return ok ? null : t('Username already taken');
});

// field definition (JSON)
{
  "name": "username",
  "type": "text",
  "validationHandlerName": "uniqueUsername"
}
```

Notes:

- Triggers: field validators typically run on `blur` or `change` depending on form config. Debounce async validators to avoid excessive requests.
- Return shape: prefer `{ valid: true }` for success and `{ error: 'message' }` for a single-field error. Adapt to your application's handler contract if different.
- Localization: use `ctx.t` inside the handler or return i18n keys resolved by the renderer.

## Form-level Validation

Form-level validators run across multiple fields and are useful for cross-field rules (e.g. password confirmation, combined constraints) or server-side checks that need full form context.

Usage:

- Register a handler with `registerFormValidationHandler(name, handler)`.
- Reference the handler name in the form JSON using `validationHandlerName` at the top-level.
- Handler signature: `(values, t) => null | errors`.

Example:

```ts
// app startup
registerFormValidationHandler('uniqueEmailCheck', async (values, t) => {
  const translate = (key: string) => t?.(key) ?? key;
  const errors: string[];
  if (values.email && !(await api.isEmailUnique(values.email))) {
    errors.push(translate('Email already in use'));
  }
  return errors.length ? errors : null;
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
- Return shape: prefer `{ valid: true }` for success and `{ errors: { [fieldName]: 'message' } }` to map messages to fields.
- Localization: use the provided `ctx.t` helper in handlers or return i18n keys for resolution by the renderer.

## Async Validation
- Both field-level and form-level handlers may be async. Ensure UI debounces and shows pending state for long-running checks.

Example (async field handler):

```ts
registerFieldCustomValidationHandler('uniqueUsername', async (value, _values, ctx) => {
  if (!value) return { valid: true };
  const ok = await api.isUsernameAvailable(value);
  return ok ? { valid: true } : { error: ctx?.t ? ctx.t('errors.usernameTaken') : 'Username already taken' };
});
```

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
