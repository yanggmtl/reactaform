# Fields & Components

Reference for common field types. Link each entry to dedicated examples where available.

## Text
- `text`, `multiline`, `password`, `email`, `url`, `phone`.
- Options: `minLength`, `maxLength`, `pattern`, `placeholder`, `labelLayout`.

## Numbers
- `int`, `float`, `slider`, `stepper`, `rating`, `unit`.
- Options: `min`, `max`, inclusivity flags, `step`, `precision`.

## Choices
- `dropdown`, `radio`, `checkbox`, `switch`, `multi-selection`.
- Options: `options` (label/value), `defaultValue`, `allowSearch`, `allowClear` (where supported).

## Date & Time
- `date`, `time`, `datetime` with formatting/locale options.

## File / Image
- `file`, `image-display`; configure accept types, size limits, preview behavior.

## Actions
- `button` - Interactive buttons that can read and modify form values.
- Options: `action` (required - name of registered button handler).
- See [Button Type Documentation](button-type.md) for complete guide and examples.

## Custom Field
- Register via component registry; supply schema (e.g., `fancy-input` demo) and renderer.

## Field Arrays / Repeatable Fields
- Support repeatable patterns via array-capable components (integer-array, float-array) or custom repeaters.
