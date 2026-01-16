# ReactaForm

> **Build dynamic React forms visually — no JSX, no boilerplate.**

**ReactaForm is a dynamic, schema-driven form platform for React, built for visual workflows.**

Design forms using JSON schemas or a visual builder, render them instantly, and scale complex configurable UIs across multiple applications.

✨ Visual Builder included
✨ Schema-first, no JSX
✨ Fully extendable (components, themes, validation, i18n)  
✨ TypeScript-first  
✨ Optimized for large, dynamic forms

🌐 **Documentation & Demos**  
- **Doc:** https://reactaform.vercel.app
- **Playground & Demos:** https://reactaform.vercel.app
- **Builder:** https://reactaform.vercel.app/builder

![ReactaForm Example](https://github.com/yanggmtl/docs/assets/images/reactaform_example.gif)

---

## Table of Contents

- [What is ReactaForm?](#what-is-reactaform)
- [Why ReactaForm?](#why-reactaform)
- [Extensibility](#extensibility)
- [ReactaForm Builder](#reactaform-builder)
- [Key Features](#key-features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Conditional Logic](#conditional-logic)
- [Validation and Validators](#validation-and-validators)
- [Documentation](#documentation)
- [Who Is ReactaForm For?](#target-customer)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Learn More](#learn-more)
- [License](#license)


## <a id="what-is-reactaform"></a> 🤔 What is-Reactaform?

ReactaForm is not a traditional React form library.

Instead of writing forms in JSX, ReactaForm treats forms as data:

- Defined using JSON schemas
- Stored in databases or CMSs
- Rendered dynamically at runtime
- Editable visually by non-developers

This makes ReactaForm ideal for applications where forms are configurable, shared, or owned by the backend.

---

## <a id="why-reactaform"></a> 🤔 Why ReactaForm?

### Most React form libraries assume:

- The form structure is static
- Developers write every field in JSX
- Changes require code edits and redeploys

### ReactaForm is built for cases where forms are:
- Generated from backend data
- Configurable at runtime
- Built visually (low-code / no-code)
- Shared across multiple apps
- Highly customizable and themeable

### Comparison
⚠️ Important context

Not all form libraries solve the same problem.

Libraries like React Hook Form, Formik, and Final Form are code-first form state managers.
They assume forms are authored in JSX at build time.

ReactaForm belongs to a different category:
👉 schema-driven, runtime-configurable form engines.

ReactaForm vs Schema-Driven Form Libraries
| Feature	| ReactaForm	| RJSF	| JSON Forms	| Uniforms	| Form.io |
|------|------|------|------|------|------|
| Form definition	| Custom JSON schema	| JSON Schema	| JSON Schema + UI schema	| Multiple schemas	| Platform schema | 
| JSX required	| ❌	| ❌	| ❌	| ❌	| ❌  |
| Runtime-configurable	| ✔	| ⚠️	| ⚠️	| ⚠️	| ✔ |
| Conditional logic	| ✔ Native	| ⚠️	| ⚠️	| ⚠️	| ✔ |
| Visual builder	| ✔	| ❌	| ❌	| ❌	| ✔ |
| Backend-driven forms	| ✔ First-class	| ⚠️	| ⚠️	| ⚠️	| ✔ |
| Plugin architecture	| ✔	| ⚠️	| ⚠️	| ✔	| ✔ |
| Built-in theming	| ✔	| ⚠️	| ✔	| ⚠️	| ✔ |
| Low-code friendly	| ✔	| ❌	| ❌	| ❌	| ✔ |

---

## <a id="extensibility"></a> 🏗 Extensibility

ReactaForm is designed as an extendable platform, not just a renderer.

| Area                        | Support                                    |
| --------------------------- | ------------------------------------------ |
| Field components            | ✔ Custom components                        |
| Layout & grouping           | ✔ Groups, sections (more planned)          |
| Validation logic            | ✔ Field, form, and field-type validators   |
| Submission workflows        | ✔ Pluggable submission handlers            |
| Themes                      | ✔ CSS-variable-based theme registry        |
| Internationalization (i18n) | ✔ Custom dictionaries & per-form overrides |
| Schema model                | ✔ Custom field types & metadata            |

---

## <a id="reactaform-builder"></a> 🏗 ReactaForm Builder

ReactaForm includes a drag-and-drop visual builder:

- Build forms visually
- Configure validation & conditional logic
- Preview instantly
- Export production-ready JSON schemas

<img src="./docs/assets/images/builder_ui.jpg" alt="ReactaForm Builder Screenshot" width="900" style="max-width:80%;height:auto;display:block;margin:0.5rem auto;" />
👉 https://reactaform.vercel.app/builder

## <a id="key-features"></a> ✨ Key Features

### 🔧 Core Concepts
| Concept | Description |
|------|------|
| Schema-driven | Forms are defined using JSON, not JSX |
| Runtime rendering | Forms can change without redeploying  |
| Visual-first  | Optional drag-and-drop builder  |
| Extendable  | Components, themes, validation, and i18n are pluggable  |
| Backend-friendly  | Schemas can live in APIs or databases |

### 🎨 Theming
- CSS-variable-based themes
- Light & dark modes
- 20+ built-in themes

### 🧠 Logic & Validation
- Conditional visibility
- Custom validators
- Custom submission handlers

### 🔌 Extensibility
- Component registry
- Plugin system
- Custom fields and workflows

### 🌍 i18n
- Built-in multi-language support
- Per-form/Per-app translation dictionaries
- Translation caching

### ⚡ Performance & Accessibility
- Incremental (chunked) mounting.
- Efficient updates using requestAnimationFrame batching and targeted visibility recomputation.
- Reduced input overhead with debounced callbacks for expensive handlers.
- ARIA-compliant by default

---

## <a id="installation"></a> 📦 Installation

```bash
npm install reactaform
```

**Peer Dependencies**
- React ^18 || ^19
- React-DOM ^18 || ^19

---

## <a id="quick-start"></a> 🚀 Quick Start

```tsx
import { ReactaForm } from 'reactaform';

const definition = {
  name: "simpleForm",
  displayName: "Simple Form",
  properties: [
    { name: "email", type: "email", required: true }
  ]
};

export default function App() {
  return <ReactaForm definitionData={definition} />;
}
```

## <a id="conditional-logic"></a> 🎭 Conditional Logic

Dynamically show or hide individual fields or groups based on parent–child rules or group conditions.

Parent–child example (schema fragment):
Parents are defined in the parents field by specifying the parent field name and the corresponding values.

```json
{
  "properties": [
    {
      "name": "country",
      "displayName": "Country",
      "type": "dropdown",
      "options": [
        { "label": "United States", "value": "US" },
        { "label": "Canada", "value": "CA" }
      ]
    },
    {
      "name": "state",
      "displayName": "State",
      "type": "dropdown",
      "parents": { "country": ["US"] }
    },
    {
      "name": "province",
      "displayName": "Province",
      "type": "dropdown",
      "parents": { "country": ["CA"] }
    }
  ]
}
```

### Group support

Groups let you treat multiple fields as a unit and control the group's visibility with group name defined in field. Consecutive fields with same group name will be grouped while non consecutive fields with same group name are treated as different groups.

Example — `Address` group contains `address1` and `address2` 

```json
{
  {
    "type": "text",
    "name": "address1",
    "displayName": "Address Line 1",
    "defaultValue": "",
    "group": "Address"
  },
  {
    "type": "text",
    "name": "address2",
    "displayName": "Address Line 2",
    "defaultValue": "",
    "group": "Address"
  }
}
```

---

## <a id="validation-and-validators"></a> 🔒 Validation and Validators

ReactaForm supports both field-level and form-level validation.

- Field-level: validation for a single field; can happen in real-time (while editing) or on submission.
- Form-level: cross-field validation performed during submission.

### Field validation modes

`FieldValidationMode`:
- `realTime`: Runs validation while the user edits a field.
- `onSubmission`: Runs validation only when the form is submitted.

### Validators

- Field custom validator — register a handler for individual-field logic.
- Form custom validator — register a handler for cross-field logic (runs during submission).
- Field type validator — define validation for a custom field/component type.
---

## Submission Handler
Since ReactaForm is a dynamic form system, it provides a submission handler mechanism that allows you to define and plug in custom submission logic, such as validation, data processing, or API calls.

**How It Works**

Submission handling is configured in two steps:

1. Define and Register a Submission Handler

```ts
import { registerSubmissionHandler } from 'reactaform';

registerSubmissionHandler('api:saveForm', async (definition, instanceName, valuesMap, t) => {
  // send valuesMap to your API
  const res = await fetch('/api/save', { method: 'POST', body: JSON.stringify(valuesMap), headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) return [t('Server error while submitting form')];
  return undefined; // returning undefined (or falsy) means success
});
```

2. Reference the Registered Handler in the Form Definition

    Schema example (Reference a registered handler using the submitHandlerName property):

```json
{
  "name": "contactForm",
  "version": "1.0",
  "displayName": "Contact",
  "submitHandlerName": "api:saveForm",
  "properties": [ /* ... */ ]
}
```

## <a id="documentation"></a> 📚 Documentation

👉 https://reactaform.vercel.app/docs

---

## 👥 <a id="target-customer"></a>Who Is ReactaForm For?

- SaaS settings pages
- Admin dashboards
- Product configurators
- CMS-driven forms
- Low-code tools
- Enterprise dynamic UIs

---

## <a id="roadmap"></a> 🗺️ Roadmap
Status Legend:
- 🟢 Current — available or actively shipping
- 🔵 Planned — designed and scheduled
- 🟡 Experimental — under research or prototyping

### Core & Standards
- 🟡 Accessibility certification (WCAG 2.2 AA)
- 🔵 Performance & accessibility audit tooling
- 🔵 Schema versioning & migration tools
- 🔵 Backward-compatible schema evolution
- 🔵 Form definition linting & diagnostics
- 🔵 Runtime schema validation & error reporting

### Conditional Logic
- 🟢 Parent–child conditional visibility
- 🟢 Field grouping
- 🔵 Logical operators (AND / OR / NOT)
- 🔵 Multi-field conditions
- 🔵 Expression-based rules
- 🔵 Nested condition groups
- 🔵 Cross-group conditional logic
- 🔵 Conditional validation rules
- 🔵 Conditional default values

### Layout & Structure
- 🔵 Multi-step / wizard forms
- 🔵 Tabbed layouts
- 🔵 Navigation sections / anchors
- 🔵 Collapsible sections
- 🔵 Reusable layout templates
- 🔵 Responsive layout rules
- 🔵 Grid & column layouts
- 🟡 Layout-aware conditional logic

### Visual Builders
- 🟢 Drag-and-drop form builder
- 🔵 Advanced conditional logic editor
- 🔵 Validation rule designer
- 🔵 Submission workflow editor
- 🔵 Layout editor (tabs, steps, groups)
- 🔵 Live schema diff & change preview
- 🔵 Schema version history & rollback
- 🔵 Import / export schema packs
- 🟡 Builder extensibility API

### Theme System
- 🟢 CSS-variable-based theming
- 🟢 Light & dark mode support
- 🟢 Per-form theme customization
- 🔵 Visual theme builder
- 🔵 CSS variable editor
- 🔵 Light / dark theme generator
- 🔵 Live theme preview across field types
- 🔵 Exportable & versioned theme packages
- 🔵 Tailwind-compatible themes
- 🟡 Theme inheritance & overrides

### Plugin System
- 🟢 Component registry
- 🟢 Submission handler registration
- 🟢 Validation handler registrytion
- 🔵 Plugin scaffolding CLI
- 🔵 Custom field plugin builder
- 🔵 Validator plugin builder
- 🔵 Submission handler plugins
- 🔵 Plugin metadata & versioning
- 🔵 Plugin dependency management
- 🟡 One-click plugin export
- 🟡 Plugin compatibility checks

Internationalization (i18n)

Current: built-in i18n with per-form dictionaries
- 🟢 Built-in i18n support
- 🟢 Per-form translation dictionaries
- 🔵 Visual translation editor
- 🔵 Translation key discovery
- 🔵 Missing translation detection
- 🔵 Locale fallback strategies
- 🟡 RTL layout support
- 🟡 Async translation loaders

### Ecosystem & Marketplace
- 🟡 Definition templates (community-driven)
- 🟡 Plugin marketplace (community-driven)
- 🟡 Theme sharing & presets gallery
- 🟡 Official plugin & theme collections

### Enterprise
- 🔵 Form analytics & submission insights
- 🔵 Role-based builder permissions
- 🔵 Hosted schema & asset management
- 🔵 Enterprise integrations

---

## <a id="contributing"></a> 🤝 Contributing

Contributions are welcome!  
Open an issue or submit a pull request.

---

## <a id="learn-more"></a> 📘 Learn more

- [Full README](https://github.com/yanggmtl/reactaform/blob/master/README.full.md) 
- [ReactaForm Official Site](http://reactaform.vercel.app)
- [Documentation](https://reactaform.vercel.app/docs)
- [Demos](http://reactaform.vercel.app/features#Demos)
- [Visual Builder](https://reactaform.vercel.app/builder)
- [Examples](https://github.com/yanggmtl/reactaform/tree/master/examples)

---

## <a id="license"></a> 📄 License

MIT
