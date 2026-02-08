# Example Apps

This folder contains small demo apps that exercise features of the `reactaform` library. The apps are intended to:

- show common integration points (custom submit handlers, form-level validation)
- demonstrate theming/custom CSS variable overrides
- exercise conditional visibility, grouping, and localization
- act as runnable examples during development (they import the local `reactaform` source)

Each app is a minimal React app located at `<vite|next_js|create_react_app>/<app-name>` and includes a `public/reactaform.svg` used as the favicon.

The file is located at [REAMDME.md](https://github.com/yanggmtl/reactaform/blob/master/examples/README.md)
The examples are located at [Github Examples](https://github.com/yanggmtl/reactaform/tree/master/examples)

---

## 🎮 Demo Applications

The `example/<vite|next_js|create_react_app>` directory contains working examples demonstrating various ReactaForm features:

### **instance-app**
Demonstrates instance management - create, load, edit, and save multiple form instances. Shows how to:
- Create new instances from definitions
- Load instances from JSON
- Edit instance values and names
- Handle form submission with instance updates

  [Vite Example](https://github.com/yanggmtl/reactaform/tree/master/examples/vite/instance_app)  |   [Next.js example](https://github.com/yanggmtl/reactaform/tree/master/examples/next_js/instance_app) | [Create react app example](https://github.com/yanggmtl/reactaform/tree/master/examples/create_react_app/instance_app)

### **group-app**
Shows how to organize form fields into logical groups (e.g., "Personal Information", "Contact Details"). Demonstrates:
- Field grouping for better UX
- Collapsible sections
- Visual organization of complex forms

  [Vite Example](https://github.com/yanggmtl/reactaform/tree/master/examples/vite/group-app)  |   [Next.js example](https://github.com/yanggmtl/reactaform/tree/master/examples/next_js/group-app) | [Create react app example](https://github.com/yanggmtl/reactaform/tree/master/examples/create_react_app/group-app)

### **parents-app**
Showcases conditional field visibility based on parent field values. Features:
- Parent-child field relationships
- Dynamic show/hide logic
- Cascading dropdowns
- Multi-level conditional rendering

  [Vite Example](https://github.com/yanggmtl/reactaform/tree/master/examples/vite/parents-app)  |   [Next.js example](https://github.com/yanggmtl/reactaform/tree/master/examples/next_js/parents-app) | [Create react app example](https://github.com/yanggmtl/reactaform/tree/master/examples/create_react_app/parents-app)

### **custom-validation-app**
Demonstrates custom validation patterns. Shows how to:
- Register custom validators
- Implement field-specific validation logic
- Display custom error messages
- Handle async validation

  [Vite Example](https://github.com/yanggmtl/reactaform/tree/master/examples/vite/custom-validation-app)  |   [Next.js example](https://github.com/yanggmtl/reactaform/tree/master/examples/next_js/custom-validation-app) | [Create react app example](https://github.com/yanggmtl/reactaform/tree/master/examples/create_react_app/custom-validation-app)

### **translation-app**
Multi-language form support with custom translations. Demonstrates:
- Language switching
- Custom translation files
- Localized field labels and messages
- RTL support preparation

  [Vite Example](https://github.com/yanggmtl/reactaform/tree/master/examples/vite/translation-app)  |   [Next.js example](https://github.com/yanggmtl/reactaform/tree/master/examples/next_js/translation-app) | [Create react app example](https://github.com/yanggmtl/reactaform/tree/master/examples/create_react_app/translation-app)

### **submit-handler-app**
Custom form submission handling. Shows how to:
- Register submission handlers
- Process form data
- Handle validation errors
- Display success/error messages

  [Vite Example](https://github.com/yanggmtl/reactaform/tree/master/examples/vite/submit-handler-app)  |   [Next.js example](https://github.com/yanggmtl/reactaform/tree/master/examples/next_js/submit-handler-app) | [Create react app example](https://github.com/yanggmtl/reactaform/tree/master/examples/create_react_app/submit-handler-app)

### **custom-styles-app**
Advanced CSS customization and theming. Demonstrates:
- Custom CSS variable overrides
- Component-level styling
- Brand-specific themes
- Responsive design patterns

  [Vite Example](https://github.com/yanggmtl/reactaform/tree/master/examples/vite/custom-styles-app)  |   [Next.js example](https://github.com/yanggmtl/reactaform/tree/master/examples/next_js/custom-styles-app) | [Create react app example](https://github.com/yanggmtl/reactaform/tree/master/examples/create_react_app/custom-styles-app)

## Install
```powershell
- npm install
```

## Run and build

- Run a single app in dev mode (hot reload):

```powershell
  vite & Next.js
     npm run dev
  create_react_app (CRA)
     npm run start
```

## Build a single app for production:

```powershell
  npm run build
```

## Registering custom handlers (examples in apps)

- Form submission handler (register and reference):

1. Define and register a handler with `registerSubmissionHandler(name, fn)` (usually inside a `useEffect`).
2. Set `submitHandlerName` on your definition to the registered name.

## Form-level validation handler (cross-field validation):

1. Register with `registerFormValidationHandler(name, fn)`.
2. Set `validationHandlerName` on your definition.

Example (conceptual):

```ts
registerFormValidationHandler('myFormValidator', (valuesMap, t) => {
  const errors: string[] = [];
  if (Number(valuesMap.a) >= Number(valuesMap.b)) {
    errors.push(t('Field A must be less than Field B'));
  }
  return errors.length ? errors : undefined;
});

// definition.validationHandlerName = 'myFormValidator'
```

The apps include minimal implementations you can copy into your project.

---

## Styling and theme customization

- `reactaform` uses CSS custom properties (variables) for theming (see `reracta/reactaform.css`).
- To override the default look, create a class that redefines the variables and apply that class to the same container as the `reactaform` root element (or a parent). Example in `custom-styles-app`:

```css
.custom-reactaform {
  --reactaform-primary-bg: #0f1724;
  --reactaform-text-color: #f8fafc;
  --reactaform-button-bg: #2563eb;
}
```

Then apply both classes to the container:

```jsx
<div className="reactaform custom-reactaform">
  <ReactaForm definitionData={definition} />
</div>
```

This approach keeps the library styles intact while allowing app-level theming.

---

