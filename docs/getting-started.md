# Getting Started

Purpose: get users productive in under 5 minutes.

## Installation
```bash
npm install reactaform
# or
yarn add reactaform
# or
pnpm add reactaform
```

## Quick Start
1) Define your form as JSON.
2) Define or get a instance 
3) Render it with `ReactaForm` or `ReactaFormRenderer`.

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

// Define an instance or get from server
const instance = {"name": "John", "email": "abc@example.com", "message" : "Send Notification."};

export function App() {
  return <ReactaForm definitionData={definition} instance = {instance} />;
}
```

## Core Concepts
- **Forms**: top-level container managing values, validation, submission.
- **Fields**: leaf components rendering inputs (Text, Select, Date, etc.).
- **Validation**: declarative rules plus custom validators.
- **State Management**: values, errors, touched, dirty, submission state.

## Next Steps
- Try the visual builder to author definitions and export JSON.
- Explore examples and templates to reuse common patterns.
