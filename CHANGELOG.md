# Changelog

All notable changes to this project are documented in this file.

## 1.0.0 — 2025-12-07
- Publish the initial version.

## 1.1.0 — 2025-12-09
- Support define and register custom components.
- Display label and value input of Checkbox and Switch in the same row.
- Enhance `onError` support in components.
- Removed unnecessary subfolder from the npm package output.
- Removed unused template files to reduce package size and improve clarity.

## 1.1.2 — 2025-12-09
- Use `package.json` `files` field to control published content.

## 1.1.3 — 2025-12-10
- Remove duplicate error messages in submit validation.
- Add support for `react-window` 2.x.

## 1.1.4 — 2025-12-11
- Remove `react-window` dependency and related virtual fields rendering.

## 1.1.5 — 2025-12-11
- Rewrite `README.md` to improve clarity and onboarding.

## 1.1.6 — 2025-12-12
- Support drag-and-drop in `FileInput`.
- Add Chip/Tag component support for selected file display.
- Add translations for newly added strings.

## 1.2.0 — 2025-12-12
- Add `Password` input component.
- Add relative support for `Url` input.
- Add `TranslationFunction` type.

## 1.2.1 — 2025-12-14
- Enhance ARIA-compliant support for several components.
- Fix small issues reported by users.

## 1.3.0 — 2025-12-17
- Refactor imports to improve compatibility with React 18.
  - Remove React 19 specific import logic to avoid type conflicts (e.g. CRA).
- Add async support for submit and validation flows.

## 1.4.0 — 2025-12-20
- Ensure compatibility with React 18.
- Add support for plugins.
- Fix tooltip positioning in scrollable containers.
- Make field-level validators synchronous while keeping form-level validation and submission asynchronous.

## 1.4.2 — 2025-12-26
- Refactor: enhance code quality, performance, and type safety.
  - Fix critical bugs: `SliderInput` padding syntax, character encoding in `NumericStepper`/`SpinInput`.
  - Performance: add validation memoization to seven field components.
  - Type safety: enhance null checks and add stricter TypeScript constraints.
  - Optimization: improve cache operations and translation interpolation.
  - Robustness: better number deserialization with Infinity/NaN validation.

## 1.4.3 — 2025-12-26
- Add ReactaForm Builder support in `README.md`.

## 1.4.4 — 2025-12-27
- Fix popup position issues in `MultiSelection` and `UnitValueInput`.

## 1.5.0 — 2025-12-27
- Enhance themes support:
  - Replace previous light/dark logic with a `themes` system.
  - Add 20 themes.

## 1.8.0 — 2026-01-06
- Enhance validation:
  - Separate validation logic from components to make it reusable.

- Performance improvements:
  - Use uncontrolled validated inputs to reduce validation invocations on refresh.
  - Add `useMemo` in layouts and components to avoid unnecessary recreations.

- Provide product build

- Fixes:
  - Instance creation issue.
  - Color issues in some components.
  - Fix build issues
  - Test type issues.
  - Dropdown keyboard navigation issue.

## 1.8.1 — 2026-01-10
- Add FieldValidationMode to support validating fields in submit case and real time case.
- Fix test issues
- Remove error prop from Onchange
- Cleanup and add missing translations

## 1.8.2 - 2026-01-13
- Add more languages to support builtin messsages
- Rewrite README.md to make it clear
- Update documentation

## 1.8.3 - 2026-01-14
- Fix handleChange & onChange error prop issue
- Update example apps

## 1.8.4 - 2026-01-15
- Simplify README.md and provide a full README. 

## 1.8.5 - 2026-01-15
- Fix radio selection issue in builder preview

## 1.8.6 - 2026-01-15
- Fix npm link issue

## 1.8.7 - 2026-01-16
- Align field label to left when field is row layout
- Add JSDoc comments for Typescript intelllisence
- Add animation gif in README