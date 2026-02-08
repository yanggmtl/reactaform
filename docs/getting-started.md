# Getting Started

Welcome to **ReactaForm**! This guide gets you productive in under **5 minutes** by walking through installation, the smallest “render a form” example, and how to handle submission.

You’ll quickly learn how to:
- Install the library
- Define forms as JSON
- Render a form at runtime (no JSX per field)
- Handle submissions via `onSubmit` or a registered handler

By the end, you’ll have a working form rendering from a JSON definition.

## Installation

```bash
npm install reactaform
# or
yarn add reactaform
# or
pnpm add reactaform
```

## Quick Start

### Render a form from a JSON definition

1. Define your form as JSON.
2. (Optional) Provide an instance (values) if you want to load/edit existing data.
3. Render it with `ReactaForm`.

```tsx
import * as React from 'react';
import { ReactaForm } from 'reactaform';

// Define a form definition (or fetch it from your API)
const definition = {
  name: 'contactForm',
  version: '1.0.0',
  displayName: 'Contact Form',
  properties: [
    { name: 'name', type: 'text', displayName: 'Name', required: true },
    { name: 'email', type: 'email', displayName: 'Email', required: true },
    { name: 'message', type: 'multiline', displayName: 'Message', minHeight: '80px' }
  ]
};

export function App() {
  // If you don't pass an instance/value object, ReactaForm will initialize one from the definition
  return <ReactaForm definitionData={definition} />;
}
```

### Handle submission

In the example above, users can enter values. Next, you’ll typically submit those values to an API.

ReactaForm supports two common approaches:

1. Pass an `onSubmit` function directly to `ReactaForm` (simplest).
2. Use the **submission registration system** so each definition can reference a handler by name.

#### Option A — submit via `onSubmit`

```tsx
import * as React from 'react';
import { ReactaForm } from 'reactaform';

const definition = {
  name: 'contactForm',
  version: '1.0.0',
  displayName: 'Contact Form',
  properties: [
    { name: 'name', type: 'text', displayName: 'Name', required: true },
    { name: 'email', type: 'email', displayName: 'Email', required: true },
    { name: 'message', type: 'multiline', displayName: 'Message', minHeight: '80px' },
  ],
};

export function App() {
  return (
    <ReactaForm
      definitionData={definition}
      onSubmit={async (_definition, _instanceName, valuesMap, t) => {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(valuesMap),
        });

        // Return undefined for success
        if (res.ok) return undefined;

        // Return a list of error messages for failure
        return [t('Server error while submitting form')];
      }}
    />
  );
}
```

#### Option B — register a submission handler

This option is very useful when you have multiple forms and each form has different submission process.
The submission handlers can be registered and reference in form defintion without passing specific submission  by onSubmit.

1. Reference a handler in your definition using `submitHandlerName`.

```ts
const definition = {
  name: 'contactForm',
  version: '1.0.0',
  displayName: 'Contact Form',
  submitHandlerName: 'exampleSubmitHandler',
  properties: [
    { name: 'name', type: 'text', displayName: 'Name', required: true },
    { name: 'email', type: 'email', displayName: 'Email', required: true },
    { name: 'message', type: 'multiline', displayName: 'Message', minHeight: '80px' },
  ],
};
```

2. Register a handler with the same name.

```tsx
import * as React from 'react';
import { ReactaForm, registerSubmissionHandler } from 'reactaform';

export function App() {
  React.useEffect(() => {
    registerSubmissionHandler('exampleSubmitHandler', async (_definition, _instanceName, valuesMap, t) => {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(valuesMap),
      });

      if (res.ok) return undefined;
      return [t('Server error while submitting form')];
    });
  }, []);

  // There is no need passing onSubmit callback function
  // ReactaForm will get submission handler by submitHandlerName and invoke it automatically
  return <ReactaForm definitionData={definition} />;
}
```

Note: onSubmit callback has higher priority than registration submission handler. When onSubmit is specified, registrated submission handler will be skipped. 

## Core Concepts

- **Definition**: the JSON schema describing fields, labels, defaults, and behavior.
- **Instance**: existing values for editing (optional).
- **Field**: a rendered input (text, select, date, etc.) described by the definition.
- **Validation**: built-in rules plus custom validators.
- **Submission**: send the current values map to your handler (`onSubmit` or a registered handler).

## Next Steps

- Learn the mental model: [Fundamentals](./fundamentals.md)
- Configure your own form style: [Style & Theming](./style-theming.md)
- Define custom component: [Custom Components](./custom-components.md)
- Define field and form validation logics: [Validation](./validation.md)
- [Advanced Usage](./advanced-usage.md)
- [ReactaForm Builder](./reactaform-builder.md)
- [Theme & Styling](./style-theming.md)
