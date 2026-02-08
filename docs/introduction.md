# Introduction

ReactaForm is a **dynamic, schema-driven form platform for React**.

Instead of building every form by hand in JSX, you describe your forms as JSON. That definition can live in code, a database, a CMS, or come from an API. ReactaForm reads that definition and renders the form at runtime.
For teams that prefer a visual approach, ReactaForm also includes a **drag-and-drop Builder**.

## What ReactaForm is (and isn’t)

ReactaForm works best when you think of it as a **runtime form engine**:

- **Schema-first:** forms are defined as data (JSON), not React component trees.
- **Runtime-configurable:** you can change form structure without redeploying your app.
- **Backend-friendly:** form definitions can be stored and served from your backend.

ReactaForm is not meant to replace code-first libraries like Formik or React Hook Form. Those tools are excellent when you’re building forms directly in JSX. ReactaForm is for cases where forms need to be **configurable**, **portable**, and **shared** across systems or applications.

## Why ReactaForm

### Current status:
Most React form libraries assume:

- Form structure is mostly static
- Developers define fields using JSX
- Any change requires code update and redeploy

To avoid repeatedly designing and modifying UI component code for different requirements, ReactaForm enables the users to build forms easily without worrying about rendering details.

### ReactaForm benefits
ReactaForm is designed for different scenarios — when forms are:

- Generated from backend data
- Configured and edited without code (low-code / no-code workflows)
- Reused across multiple apps
- Highly customizable (components, themes, validation, i18n)

## Core building blocks

- **Definition:** the JSON schema that describes fields, labels, rules, and behavior.
- **Instance:** values for editing/loading existing data (optional).
- **Renderer:** the React component that turns a definition into a live form.
- **Registries:** extension points for custom field components, validators, and submission handlers.
- **`t()` (i18n):** translation lookup used across components and error messages.

## Key capabilities

- **No JSX required:** render complete forms directly from JSON.
- **Conditional logic:** show or hide fields (parent–child rules) and groups.
- **Validation:** field-level and form-level validators, including custom handlers.
- **Submission workflows:** submit directly vai `onSubmit` or use registered per form.
- **Extensibility:** custom field types, component registry, CSS-variable-based theming, i18n support.
- **Performance & accessibility:** optimized for large dynamic forms with ARIA-friendly defaults.

## Quick start

Install:

```bash
npm install reactaform
```

Render a simple form definition:

```tsx
import { ReactaForm } from 'reactaform';

const definition = {
	name: 'simpleForm',
	displayName: 'Simple Form',
	properties: [{ name: 'email', type: 'email', required: true }],
};

export default function App() {
	return <ReactaForm definitionData={definition} />;
}
```

## Who it’s for

ReactaForm is a good fit for:

- SaaS settings pages and admin dashboards

  Where form definitions change frequently and must be updated without redeploying the app.

- Product configurators and enterprise dynamic UIs

  Complex, multi-step or rule-driven forms that are generated from data rather than hard-coded JSX.

- CMS-driven or database-stored forms

  Forms whose definitions are stored, versioned, and served from a backend system or content platform.

- Teams adopting visual/low-code form authoring

  Designers or non-frontend developers can create and maintain forms using configuration or a builder instead of React code.

## Next steps

- Start here: [Getting Started](./getting-started.md)
- Learn the mental model: [Fundamentals](./fundamentals.md)
- Define custom component: [Custom Components](./custom-components.md)
- Define field and form validation logics: [Validation](./validation.md)
- [Advanced Usage](./advanced-usage.md)
- [ReactaForm Builder](./reactaform-builder.md)
- [Theme & Styling](./style-theming.md)
