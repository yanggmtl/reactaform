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

## 🚀 Quick Start

```tsx
import { ReactaForm } from 'reactaform';

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
  const [formData, setFormData] = useState({});

  return (
    <ReactaForm
      definitionData={definition}
      instance={formData}
      language="en"
    />
  );
}
```

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

registerSubmissionHandler('contactForm', async (formData) => {
  const response = await fetch('/api/contact', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
  
  if (!response.ok) {
    throw new Error('Submission failed');
  }
  
  return { success: true, message: 'Form submitted!' };
});
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
      defaultDefinitionName="myForm"
    >
      <ReactaFormRenderer
        properties={definition.properties}
        instance={formData}
      />
    </ReactaFormProvider>
  );
}
```

## 📚 API Reference

### ReactaForm Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `definitionData` | `ReactaDefinition \| string` | Yes | Form definition object or JSON string |
| `instance` | `Record<string, unknown>` | No | Current form values |
| `language` | `string` | No | Language code (default: 'en') |
| `darkMode` | `boolean` | No | Enable dark mode |
| `className` | `string` | No | Custom CSS class |
| `style` | `CSSProperties` | No | Custom inline styles |

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
| `labelLayout` | `'row' \| 'column' \| 'column-center'` | No | Label positioning |

## 🧪 Testing

ReactaForm uses Vitest for testing:

```bash
npm run test          # Run all tests
npm run typecheck     # Type checking
```

## 🏗️ Building

```bash
npm run build:lib     # Build library
npm run pack:staging  # Create .tgz package
```

Output formats:
- **ESM**: `dist/reactaform.es.js`
- **CommonJS**: `dist/reactaform.cjs.js`
- **UMD**: `dist/reactaform.umd.js`
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

## 💡 Examples

Check the `packages/apps` directory for complete working examples including:
- Contact forms
- Survey forms with conditional logic
- Multi-step wizards
- File upload demos
- Unit conversion examples

---

**Built with ❤️ using React and TypeScript**
