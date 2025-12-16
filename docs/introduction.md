# Introduction

Purpose: orient new users quickly and explain why ReactaForm exists.

## What is ReactaForm
- Lightweight, type-safe React form library that renders full forms from JSON definitions.
- Batteries included: i18n, validation handlers, extensible field components, submission/validator registries.
- Ships both a runtime renderer and a visual builder for authoring definitions.

## Why ReactaForm
- Declarative definitions: treat forms as data, not component wiring.
- Runtime validation: enforce min/max/pattern and custom rules without bespoke code per form.
- Accessibility-minded defaults with ARIA-friendly components and layouts.
- Plays nicely with modern React app stacks and design systems (Tailwind, MUI, AntD, Chakra via custom renderers).

## Key Features
- Dynamic form rendering from JSON definitions (no recompiles to change forms).
- Built-in validators plus pluggable custom validators and submission handlers.
- Field registries to add your own inputs alongside the built-ins.
- Localization support via JSON locales and `t()` lookups.
- Layout helpers: column/row/standard field layouts.
- Visual builder to author and preview forms, exportable as JSON templates.

## When to choose ReactaForm
- You need to ship configurable forms without redeploying code.
- Product or ops teams author definitions; engineering maintains components/validation.
- You want type-safe definitions and predictable validation semantics.

## Comparison (Formik / RHF)
- ReactaForm centers on runtime JSON definitions and dynamic rendering; Formik/RHF focus on component-driven forms.
- Choose ReactaForm when forms must be editable by configuration, not code.

## Browser & React Support
- Modern evergreen browsers; React 18+ peer dependency range.
