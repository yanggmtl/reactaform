# ReactaForm

A powerful, type-safe React form builder library with dynamic field rendering, conditional visibility, multi-language support, and extensible validation. Built with TypeScript and React 19+.

## ✨ Features

- 🎯 **Type-Safe**: Full TypeScript support with generic field types
- 🎨 **Themeable**: CSS variables for easy customization (light/dark mode built-in)
- 🌍 **i18n Ready**: Built-in internationalization with translation caching
- 🔌 **Extensible**: Registry pattern for custom components, validators, and handlers
- ⚡ **Performance**: Virtual scrolling, debounced inputs, RAF-based state management
- 🎭 **Conditional Logic**: Field visibility based on parent field values
- 📱 **Responsive**: Works seamlessly across devices
- ♿ **Accessible**: ARIA attributes and keyboard navigation support
- 🧩 **20+ Field Types**: Text, email, phone, dropdown, checkbox, slider, rating, date, file upload, and more

## 📦 Installation

```bash
npm install reactaform react react-dom
```

**Peer Dependencies:**
- React ^19.2.0
- React-DOM ^19.2.0

## 🌐 Environment Compatibility

ReactaForm is **bundler-agnostic** and works seamlessly across different build tools:

✅ **Vite** - Fully supported (recommended)  
✅ **Webpack** (Create React App) - Fully supported  
✅ **Next.js** - Fully supported  
✅ **Parcel, esbuild, Rollup** - Fully supported  

The library gracefully handles environment-specific APIs (`import.meta.env`, `process.env`) with automatic fallbacks. No special configuration needed!

### TypeScript Setup (Non-Vite Projects)

If you see TypeScript errors about CSS imports in non-Vite projects, add a `global.d.ts`:

```typescript
// src/global.d.ts
declare module '*.css';
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
```

## 🚀 Quick Start

```tsx
import { ReactaForm, createInstanceFromDefinition } from 'reactaform';
import { useState } from 'react';

const definition = {
  name: "contactForm",
  version: "1.0",
  displayName: "Contact Form",
  properties: [
    {
      name: "fullName",
      displayName: "Full Name",
      type: "string",
      defaultValue: "",
      required: true,
    },
    {
      name: "email",
      displayName: "Email",
      type: "email",
      defaultValue: "",
      required: true,
    },
    {
      name: "message",
      displayName: "Message",
      type: "text",
      defaultValue: "",
      required: true,
    }
  ]
};

function App() {
  // Create an instance from the definition
  const result = createInstanceFromDefinition(definition, "myForm");
  const [instance, setInstance] = useState(result.instance);

  return (
    <ReactaForm
      definitionData={definition}
      instance={instance}
      language="en"
    />
  );
}
```

> **Note**: `ReactaForm` manages form state internally. If you need to programmatically update values, use `setInstance()` with a new instance object.

## 📖 Core Concepts

### Form Definitions

A form definition is a JSON object that describes the structure of your form:

```typescript
interface ReactaDefinition {
  name: string;              // Unique form identifier
  version: string;           // Version for tracking changes
  displayName: string;       // Human-readable form title
  properties: FieldDefinition[]; // Array of field definitions
}
```

### Field Types

ReactaForm supports 20+ field types out of the box:

| Type | Description | Example |
|------|-------------|---------|
| `string` | Single-line text input | Name, username |
| `text` | Multi-line text area | Comments, descriptions |
| `email` | Email with validation | user@example.com |
| `phone` | Phone number input | +1 (555) 123-4567 |
| `url` | URL with validation | https://example.com |
| `integer` | Whole numbers | Age, quantity |
| `float` | Decimal numbers | Price, weight |
| `boolean` | Checkbox | Accept terms |
| `dropdown` | Select from options | Country, category |
| `radio` | Radio button group | Gender, size |
| `multiSelection` | Multiple checkboxes | Interests, tags |
| `slider` | Range slider | Volume, brightness |
| `rating` | Star rating | Product rating |
| `date` | Date picker | Birth date |
| `dateTime` | Date and time picker | Appointment |
| `time` | Time picker | Meeting time |
| `color` | Color picker | Theme color |
| `file` | File upload | Documents, images |
| `image` | Image display | Preview, thumbnail |
| `unitValue` | Value with unit conversion | 100 cm → 1 m |

### Conditional Visibility

Fields can be conditionally shown/hidden based on parent field values:

```typescript
{
  name: "country",
  displayName: "Country",
  type: "dropdown",
  options: [
    { label: "United States", value: "US" },
    { label: "Canada", value: "CA" }
  ]
},
{
  name: "state",
  displayName: "State/Province",
  type: "dropdown",
  parents: {
    country: ["US", "CA"]  // Only show when country is US or CA
  },
  options: [
    { label: "California", value: "CA" },
    { label: "Ontario", value: "ON" }
  ]
}
```

### Validation

Built-in validation for common patterns:

```typescript
{
  name: "email",
  displayName: "Email Address",
  type: "email",
  required: true,           // Field is required
  pattern: "^[a-z]+$",     // Custom regex pattern (optional)
  minLength: 5,            // Minimum length (optional)
  maxLength: 100,          // Maximum length (optional)
}
```

## 🎨 Theming

ReactaForm uses CSS variables for easy theming:

```css
:root {
  /* Colors */
  --reactaform-color-primary: #2563eb;
  --reactaform-color-error: #ef4444;
  --reactaform-color-success: #10b981;
  
  /* Typography */
  --reactaform-font-family: system-ui, sans-serif;
  --reactaform-font-size: 1rem;
  --reactaform-font-weight: 400;
  
  /* Spacing */
  --reactaform-space-xs: 4px;
  --reactaform-space-sm: 8px;
  --reactaform-space-md: 16px;
  
  /* Borders */
  --reactaform-border-radius: 4px;
  --reactaform-border-color: #d1d5db;
  
  /* Inputs */
  --reactaform-input-bg: #ffffff;
  --reactaform-input-padding: 8px 12px;
}

/* Dark mode */
[data-reactaform-theme="dark"] {
  --reactaform-bg-primary: #1A1A1A;
  --reactaform-text-color: #EDEDED;
  --reactaform-input-bg: #2A2A2A;
  --reactaform-border-color: #3A3A3A;
}
```

### Using Dark Mode

```tsx
<ReactaForm
  definitionData={definition}
  instance={formData}
  darkMode={true}  // Enable dark mode
/>
```

## 🌍 Internationalization

ReactaForm supports multiple languages:

```tsx
<ReactaForm
  definitionData={definition}
  instance={formData}
  language="fr"  // 'en', 'fr', 'de', 'es', 'zh-cn'
/>
```

### Custom Translations

Provide custom translations for your form:

```typescript
// public/locales/fr/myform.json
{
  "Full Name": "Nom complet",
  "Email": "Courriel",
  "Submit": "Soumettre"
}
```

## 🔧 Advanced Usage

### Custom Field Components

Register custom field components:

```tsx
import { registerComponent } from 'reactaform';

const CustomInput = ({ field, value, onChange }) => {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value, null)}
      placeholder={field.displayName}
    />
  );
};

registerComponent('customType', CustomInput);
```

### Custom Validation

Register custom validators:

```tsx
import { registerValidationHandler } from 'reactaform';

registerValidationHandler('customType', (value, field) => {
  if (value.length < 10) {
    return "Value must be at least 10 characters";
  }
  return null; // No error
});
```

### Form Submission

Handle form submission with custom logic:

```tsx
import { registerSubmissionHandler } from 'reactaform';

// Register a submission handler for your form
registerSubmissionHandler(
  'mySubmitHandler',  // Handler name (referenced in definition.submitHandlerName)
  (definition, instanceName, valuesMap, t) => {
    // definition: The form definition
    // instanceName: Current instance name
    // valuesMap: Object with all field values { fieldName: value }
    // t: Translation function for error messages

    // Custom validation
    if (!valuesMap.email?.includes('@')) {
      return [t('Invalid email address')]; // Return array of error strings
    }

    // Submit to API
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(valuesMap),
    }).catch(err => {
      console.error('Submission failed:', err);
    });

    // Return undefined for success, or array of error strings for failure
    return undefined;
  }
);
```

**Then reference it in your definition:**

```tsx
const definition = {
  name: "contactForm",
  submitHandlerName: "mySubmitHandler",  // Link to registered handler
  // ... rest of definition
};
```

### Using ReactaFormProvider

Wrap your app for global configuration:

```tsx
import { ReactaFormProvider, ReactaFormRenderer } from 'reactaform';

function App() {
  return (
    <ReactaFormProvider
      defaultLanguage="en"
      defaultDarkMode={false}
      definitionName="myForm"
    >
      <ReactaFormRenderer
        properties={definition.properties}
        instance={formData}
      />
    </ReactaFormProvider>
  );
}
```

### Note: `definitionName` vs renderer-level override

- `ReactaFormProvider` accepts an optional `definitionName` prop which can be used as a top-level default when you are rendering a single form or when tests/storybook rely on a global active definition.
- `ReactaFormRenderer` injects its own `definitionName` into the React context (it wraps its output in a nested provider). This means multiple renderers with different definitions can safely coexist under the same `ReactaFormProvider`.
- Recommendation: prefer leaving `definitionName` empty at the top-level and let each `ReactaFormRenderer` provide the definitive `definitionName` for the fields it renders. Use the provider-level `definitionName` only for special cases (tests, single-form pages) where you need a global fallback.


## 📚 API Reference

### ReactaForm Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `definitionData` | `ReactaDefinition \| string` | Yes | Form definition object or JSON string |
| `instance` | `ReactaInstance` | No* | Form instance with values and metadata. If not provided, will be auto-created from definition |
| `language` | `string` | No | Language code (default: 'en') |
| `darkMode` | `boolean` | No | Enable dark mode (default: auto-detect from parent theme) |
| `className` | `string` | No | Custom CSS class |
| `style` | `CSSProperties` | No | Custom inline styles |

*While `instance` is technically optional (auto-created if omitted), providing it is recommended for proper state management.

### Field Definition Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `name` | `string` | Yes | Unique field identifier |
| `displayName` | `string` | Yes | Field label |
| `type` | `string` | Yes | Field type (see Field Types) |
| `defaultValue` | `any` | No | Default field value |
| `required` | `boolean` | No | Field is required |
| `disabled` | `boolean` | No | Field is disabled |
| `readOnly` | `boolean` | No | Field is read-only |
| `tooltip` | `string` | No | Tooltip text |
| `placeholder` | `string` | No | Placeholder text |
| `options` | `Option[]` | No | Options for dropdown/radio/multi-selection |
| `parents` | `Record<string, string[]>` | No | Conditional visibility rules |
| `pattern` | `string` | No | Regex validation pattern |
| `minLength` | `number` | No | Minimum input length |
| `maxLength` | `number` | No | Maximum input length |
| `min` | `number` | No | Minimum numeric value |
| `max` | `number` | No | Maximum numeric value |
| `step` | `number` | No | Numeric step increment |
| `labelLayout` | `'row' \| 'column-left' \| 'column-center'` | No | Label positioning |

## 🧪 Testing

ReactaForm uses Vitest for testing:

```bash
npm run test          # Run all tests
npm run typecheck     # Type checking
```

## 🏗️ Building

```bash
npm run build:lib     # Build library
npm pack              # Create .tgz package
```

Output formats:
- **ESM**: `dist/reactaform.es.js`
- **CommonJS**: `dist/reactaform.cjs.js`
- **Types**: `dist/index.d.ts`

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Known Issues

- Virtual scrolling optimization in progress for forms with 1000+ fields
- Screen reader testing ongoing for complex conditional fields

## 🗺️ Roadmap

- [ ] Enhanced accessibility audit
- [ ] More built-in validators
- [ ] Form builder UI
- [ ] Schema migration tools
- [ ] Performance profiling dashboard

## 🔍 Troubleshooting

### "Cannot find module './style.css'"

**Solution**: Add a `global.d.ts` file (see Environment Compatibility section above).

### Form not updating when instance changes

**Solution**: Ensure you're passing a **new instance object** (immutable updates):

```tsx
// ✅ Correct - creates new object
setInstance({ ...instance, values: { ...instance.values, name: 'John' } });

// ❌ Wrong - mutates existing object
instance.values.name = 'John';
setInstance(instance);
```

### Submission handler not called

**Solution**: Ensure `submitHandlerName` in your definition matches the registered handler name:

```tsx
registerSubmissionHandler('myHandler', ...);
// Definition must have: submitHandlerName: "myHandler"
```

### TypeScript errors about `import.meta` or `process`

**Solution**: The library handles these internally with fallbacks. If you see errors in **your** code, ensure you're not directly importing library internals. If errors persist, update to the latest version.

### Dark mode not working

**Solution**: Either pass `darkMode={true}` prop, or wrap your app with `[data-reactaform-theme="dark"]` attribute on a parent element.

---

**Built with ❤️ using React and TypeScript**
