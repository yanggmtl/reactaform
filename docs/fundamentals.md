# Fundamentals

Purpose: explain the mental model for ReactaForm.

## Form Component
- Responsibilities: provide context, handle submission, supply `t` translation, expose definition metadata.
- Manages lifecycle events: initialize defaults, validate on change/blur/submit, emit submission payloads.

## Field Components
- Props: `value`, `error`, `onChange`, `onError`
- Patterns: controlled inputs preferred; keep side effects minimal; respect disabled/read-only states.
- Layout: use provided field layouts (standard/column/row) or supply custom wrappers.

## Validation Basics
- Built-in rules: required, min/max, pattern, enum/options, custom messages.
- Async support: validators may return promises for server checks.
- Field-level vs form-level: combine per-field rules with cross-field validation handlers.

## Submission Flow
- Register `onSubmit` handlers; payload mirrors definition properties.
- Handle success/error states; show inline errors via validation output.

## Localization
- Provide locale JSON and `t()` will resolve messages; allow per-field overrides for messages and labels.
