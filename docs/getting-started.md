# Getting Started

Welcome to **ReactaForm**! This guide will get you productive in under **5 minutes** by walking you through installation, basic usage, and core concepts. ReactaForm allows you to define forms as JSON, render them with React components, and handle validation, state, and user input seamlessly.

You’ll quickly learn how to:
- Install the library
- Define forms and instances
- Render forms with ReactaForm components
- Understand core concepts like fields, validation, and state

By the end of this guide, you’ll be ready to create, render, and manage forms in your React applications efficiently.

## Installation
```bash
npm install reactaform
# or
yarn add reactaform
# or
pnpm add reactaform
```

## Quick Start


### A simple example for display ReactaForm
1. Define your form as JSON.
2. (Optional) Provide an instance (values) if you want to load/edit existing data.
3. Render it with `ReactaForm`.

```tsx
import { ReactaForm } from 'reactaform';

// Define definition or get from server
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
  // If you don't pass `instance`, ReactaForm will create one from the definition.
  return <ReactaForm definitionData={definition} />;
}
```

### Example for submit values
In the example above, the form is displayed and the inputs can be exited. The next question is how to retrieve these inputvalues and process them?
ReactaForm provides a submission registration system that allows you define custom submission logic for each form definition.
The process is straightforward:

1. Specify the submission handler name in your form definition with property "submitHandlerName".
```ts
// Define definition or get from server
const definition = {
  name: 'contactForm',
  version: '1.0.0',
  displayName: 'Contact Form',
  // name of the registered submit handler to invoke on submit
  submitHandlerName: "exampleSubmitHandler",
  properties: [
    { name: 'name', type: 'text', displayName: 'Name', required: true },
    { name: 'email', type: 'email', displayName: 'Email', required: true },
    { name: 'message', type: 'multiline', displayName: 'Message', minHeight: '80px' }
  ]
};
```

2. Implement your custom submission handler
```ts
// Define submission handler to process input data
const handler: FormSubmissionHandler = (
  definition,
  instanceName,
  valuesMap,
  t
): string[] | undefined => {
  // you can get valuesMap and process it
  // ... 

  // Return undefined when submission success; when submission fail, return error message string
  // Function t is used for translate the error message
  return undefined; 
};

```
3. Register the submission handler with ReactaForm

```ts
export default function App() {
  React.useEffect(() => {
    // Register the submission handler
    // Name is the submitHandlerName in definition
    registerSubmissionHandler("exampleSubmitHandler", handler); 
  }, []);

  return (
    <ReactaForm definitionData={definition} />
  );
}
```

## Core Concepts
- **Form**: top-level container managing values, validation, submission.
            definition and instance are input.
- **Definition**: a json schema discribe the form rendering and default values
- **Instance**:  instance data for editing
- **Field**: leaf component rendering input (Text, Select, Date, etc.).
- **Validation**: declarative rules (built-in) plus custom validators.
- **State Management**: values, errors, touched, submission state.

## Next Steps
- Try the visual builder to author definitions and export JSON.
- Explore examples and templates to reuse common patterns.
