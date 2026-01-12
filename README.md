# ReactaForm

> **Build dynamic React forms visually — no JSX, no boilerplate.**

**ReactaForm is a dynamic, schema-driven form platform for React, built for visual workflows.**

Design forms using the drag-and-drop builder or JSON schemas, render them instantly, and scale complex, configurable UIs without rewriting JSX.

✨ Visual Builder included  
✨ TypeScript-first  
✨ Themeable & extensible  
✨ Designed for dynamic, backend-driven UIs

🌐 **Documentation & Demos**  
- https://reactaform.vercel.app  
- **Builder:** https://reactaform.vercel.app/builder

---

## Table of Contents

- [Why ReactaForm?](#why-reactaform)
- [ReactaForm Builder](#reactaform-builder)
- [Key Features](#key-features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Conditional Logic](#conditional-logic)
- [Validation and Validators](#validation-and-validators)
- [Documentation](#documentation)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)


## 🤔 Why ReactaForm?

Most React form libraries assume your form structure is **static JSX**.

ReactaForm is built for cases where forms are:
- Generated from backend data
- Configurable at runtime
- Built visually (low-code / no-code)
- Shared across multiple apps
- Highly customizable and themeable

### Comparison

| Feature | React Hook Form | Formik | ReactaForm |
|------|------|------|------|
| JSX required | ✔ | ✔ | ❌ |
| Schema-driven | ❌ | ❌ | ✔ |
| Runtime dynamic forms | ⚠️ | ⚠️ | ✔ |
| Visual form builder | ❌ | ❌ | ✔ |
| Built-in theming | ❌ | ⚠️ | ✔ |
| Plugin architecture | ❌ | ❌ | ✔ |
| Backend-driven UI | ❌ | ❌ | ✔ |

---

## 🏗 ReactaForm Builder

Visual drag-and-drop builder for creating dynamic forms:

<img src="./docs/assets/images/builder_ui.jpg" alt="ReactaForm Builder Screenshot" width="900" style="max-width:100%;height:auto;display:block;margin:0.5rem auto;" />

## ✨ Key Features

### 🔧 Core
- Schema-driven form rendering
- 20+ built-in field types
- Automatic state management
- Full TypeScript support

### 🛠 Visual Form Builder
- Drag-and-drop form creation
- Live preview
- Validation & conditional logic
- Export production-ready JSON schemas

👉 https://reactaform.vercel.app/builder

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
- Translation caching

### ⚡ Performance & Accessibility
- Debounced input handling
- requestAnimationFrame-based updates
- ARIA-compliant by default

---

## 👥 Who Is ReactaForm For?

- SaaS settings pages
- Admin dashboards
- Product configurators
- CMS-driven forms
- Low-code tools
- Enterprise dynamic UIs

---

## 📦 Installation

```bash
npm install reactaform
```

**Peer Dependencies**
- React ^18 || ^19
- React-DOM ^18 || ^19

---

## 🚀 Quick Start

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

## 🎭 Conditional Logic

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

## 🔒 Validation and Validators

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

## 📚 Documentation

👉 https://reactaform.vercel.app/docs

---

## 🗺️ Roadmap

### Core & Standards
- [ ] Accessibility certification (WCAG 2.2 AA)
- [ ] Performance & accessibility audit tooling
- [ ] Schema versioning & migration tools

### Conditional Logic
- [x] Parent–child conditional visibility (current)
- [x] Field grouping (current)
- [ ] Advanced conditional logic engine
  - [ ] Logical operators (AND / OR / NOT)
  - [ ] Multi-field conditions
  - [ ] Expression-based rules
  - [ ] Nested condition groups
- [ ] Layout enhancement
  - [ ] Tabbed forms (planned)
  - [ ] Navigation sections (planned)
  - [ ] Multi-step forms

### Visual Builders
- [ ] Enhanced visual form builder
  - [ ]Advanced conditional logic editor
  - [ ]Validation rule designer
- [ ] **Theme Builder (Visual)**
  - [ ]Visual CSS-variable editor
  - [ ]Live preview across field types
  - [ ]Light / dark theme generation
  - [ ]Exportable, versioned theme packages
  - [ ]Tailwind-compatible themes
- [ ] **Plugin Builder**
  - [ ] Scaffold custom field components
  - [ ] Scaffold validators & submission handlers
  - [ ] Plugin metadata & versioning
  - [ ] One-click plugin export

### Ecosystem
- [ ] Plugin marketplace (community-driven)
- [ ] Theme sharing & presets gallery
- [ ] Official plugin & theme collections

### Enterprise
- [ ] Form analytics & submission insights
- [ ] Role-based builder permissions
- [ ] Hosted schema & asset management
- [ ] Enterprise integrations

---

## 🤝 Contributing

Contributions are welcome!  
Open an issue or submit a pull request.

---

## 📄 License

MIT
