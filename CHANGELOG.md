# Changelog

## 1.0.0 - 2025-12-07
- Publish the initial version

## 1.1.0 - 2025-12-09
- Support define and register custom component
- Display label and value input of checkbox and switch in same row
- Enhance OnError support in components

## 1.1.0 - 2025-12-09
- Removed unnecessary subfolder from the npm package output
- Removed unused template files to reduce package size and improve clarity

## 1.1.2 - 2025-12-09
- Use package.json "files" field to control published content

## 1.1.3 - 2025-12-10
- Remove duplicate error messages in submit validation
- Add support for react-window 2.x

## 1.1.4 - 2025-12-11
- Remove react-window dependency and related virtual fields rendering.

## 1.1.5 - 2025-12-11
- Rewrite README.md to make it clean and clear.

## 1.1.6 - 2025-12-12
- Support drag/drop in FileInput
- Add Chip(or Tag) component support for selected file display.
- Translate new added strings.

## 1.2.0 - 2025-12-12
- Add Password input component
- Add relative support for Url input
- Add TranslationFunction type

## 1.2.1 - 2025-12-14
- Enhance ARIA-compliant support for some components
- Fix some small issues

## 1.3.0 - 2025-12-17
- Refactor import to make library works in React 18.
  Remove React 19 specific import logic to avoid type conflicts with React 18. For example, using this library in CRA app.
- Add async for submit and validation

## 1.4.0 - 2025-12-20
- Ensure compatibility with React 18
- Add support for plugins
- Fix tooltip positioning in scrollable containers
- Make field-level validators synchronous; keep form-level validation and submission asynchronous

## 1.4.2 - 2025-12-26
Refactor: enhance code quality, performance, and type safety
- Fix critical bugs: SliderInput padding syntax, character encoding in NumericStepper/SpinInput
- Performance: add validation memoization to 7 field components
- Type safety: enhance null checks, add strict TypeScript constraints
- Optimization: improve cache operations, translation interpolation
- Robustness: better number deserialization with Infinity/NaN validation

## 1.4.3 - 2025-12-26
- Add ReactaForm Builder support in README.md

## 1.4.4 - 2025-12-27
- Fix popup position issues of MultiSelection and UnitValueInput