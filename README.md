# ReactaForm

Build dynamic React forms visually — no JSX, no boilerplate.

ReactaForm is a schema-driven, extendable form platform for React. Define forms as JSON (or visually), render them at runtime, and scale complex, configurable UIs without rewriting JSX.

- Visual Form Builder
- Forms as data (JSON, not JSX)
- Fully extendable (components, themes, validation, i18n)
- TypeScript-first
- Optimized for large, dynamic forms

![ReactaForm Example](https://github.com/yanggmtl/reactaform/tree/master/docs/assets/images/reactaform_example.gif)

## Why ReactaForm?

Most React form libraries are code-first:

- Forms are written in JSX
- Changes require code edits and redeploys

ReactaForm is different:

- Forms are schema-driven
- Stored in APIs, databases, or CMSs
- Editable visually (low-code / no-code)
- Rendered dynamically at runtime

If your forms change often or are backend-owned, ReactaForm fits naturally.

## Use Cases

- SaaS settings & configuration pages
- Admin dashboards
- CMS-driven forms
- Product configurators
- Low-code / no-code platforms
- Enterprise dynamic UIs

## Quick example

```tsx
import { ReactaForm } from 'reactaform';

const definition = {
  name: 'contactForm',
  displayName: 'Contact',
  properties: [
    { name: 'email', type: 'email', required: true }
  ]
};

export default function App() {
  return <ReactaForm definitionData={definition} />;
}
```

No JSX fields. No wiring. Just render.

## Key features

- Schema-driven rendering (JSON, not JSX)
- Visual drag-and-drop form builder
- Runtime-configurable forms
- Conditional logic & grouping
- Pluggable validation & submission
- Themeable via CSS variables
- Built-in i18n
- High-performance rendering
- ARIA-compliant by default

## Extensible by design

ReactaForm is a platform, not just a renderer. You can extend:

- Field components
- Validation logic (field, form, type)
- Submission workflows
- Themes & design systems
- Languages & translations
- Custom field types & metadata

No forks. No hacks.

## How it compares

- Formik / React Hook Form → code-first, JSX-based
- ReactaForm → schema-first, runtime-driven

ReactaForm doesn’t replace form state libraries — it replaces hand-coding forms when forms are dynamic.

## Installation

```bash
npm install reactaform
```

### Peer dependencies

- React ^18 || ^19
- React DOM ^18 || ^19

## Learn more

- [Full README](https://github.com/yanggmtl/reactaform/blob/master/README.full.md) 
- [ReactaForm Official Site](http://reactaform.vercel.app)
- [Documentation](https://reactaform.vercel.app/docs)
- [Demos](http://reactaform.vercel.app/features#Demos)
- [Visual Builder](https://reactaform.vercel.app/builder)
- [Examples](https://github.com/yanggmtl/reactaform/tree/master/examples)

## License

MIT