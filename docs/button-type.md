# Button Type Feature

The button type allows you to add interactive buttons to your forms that can read and modify any form field values. This is useful for actions like:
- Calculating derived values from other fields
- Resetting specific fields
- Copying values between fields
- Validating and transforming data
- Triggering custom workflows

## Button Definition in JSON Schema

```json
{
  "name": "calculateButton",
  "displayName": "Calculate Total",
  "type": "button",
  "action": "calculateTotal"
}
```

### Required Properties
- `name`: Unique identifier for the button
- `displayName`: Text shown on the button
- `type`: Must be "button"
- `action`: Name of the registered button handler function

## Registering Button Handlers

Button handlers receive full access to all form values and can modify any field:

```typescript
import { registerButtonHandler, type ButtonHandler } from 'reactaform';

// Register a button handler
registerButtonHandler('calculateTotal', (valuesMap, handleChange, handleError, t) => {
  // Read values from other fields
  const price = valuesMap['price'] as number;
  const quantity = valuesMap['quantity'] as number;
  const taxRate = valuesMap['taxRate'] as number;

  // Validate inputs
  if (!price || !quantity) {
    handleError('total', t('Please enter price and quantity first'));
    return;
  }

  // Calculate and update fields
  const subtotal = price * quantity;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  handleChange('subtotal', subtotal);
  handleChange('tax', tax);
  handleChange('total', total);

  // Clear any previous errors
  handleError('total', null);
});
```

## Button Handler Function Signature

```typescript
type ButtonHandler = (
  valuesMap: Record<string, FieldValueType>,  // All form values (read-only)
  handleChange: (fieldName: string, value: FieldValueType) => void,  // Update field values
  handleError: (fieldName: string, error: ErrorType) => void,  // Report/clear field errors
  t: TranslationFunction,  // Translation function for i18n
) => void | Promise<void>;
```

## Complete Example

```typescript
import React from 'react';
import { ReactaForm, registerButtonHandler } from 'reactaform';

// Register button handlers
registerButtonHandler('resetFields', (valuesMap, handleChange, handleError) => {
  // Reset specific fields to their defaults
  handleChange('firstName', '');
  handleChange('lastName', '');
  handleChange('email', '');
  
  // Clear any errors
  handleError('firstName', null);
  handleError('lastName', null);
  handleError('email', null);
});

registerButtonHandler('copyAddress', (valuesMap, handleChange) => {
  // Copy billing address to shipping address
  const billingAddress = valuesMap['billingAddress'] as string;
  const billingCity = valuesMap['billingCity'] as string;
  const billingZip = valuesMap['billingZip'] as string;
  
  handleChange('shippingAddress', billingAddress);
  handleChange('shippingCity', billingCity);
  handleChange('shippingZip', billingZip);
});

// Async button handler example
registerButtonHandler('validateAddress', async (valuesMap, handleChange, handleError, t) => {
  const address = valuesMap['address'] as string;
  
  try {
    const response = await fetch('/api/validate-address', {
      method: 'POST',
      body: JSON.stringify({ address }),
    });
    
    const result = await response.json();
    
    if (result.valid) {
      handleChange('validatedAddress', result.standardizedAddress);
      handleError('address', null);
    } else {
      handleError('address', t('Address could not be validated'));
    }
  } catch (error) {
    handleError('address', t('Validation service unavailable'));
  }
});

// Form definition with buttons
const formDefinition = {
  name: "UserForm",
  version: "1.0",
  displayName: "User Registration",
  properties: [
    {
      name: "firstName",
      displayName: "First Name",
      type: "string",
      defaultValue: "",
      required: true
    },
    {
      name: "lastName",
      displayName: "Last Name",
      type: "string",
      defaultValue: "",
      required: true
    },
    {
      name: "email",
      displayName: "Email",
      type: "email",
      defaultValue: "",
      required: true
    },
    {
      name: "resetButton",
      displayName: "Reset Form",
      type: "button",
      action: "resetFields"
    },
    {
      name: "billingAddress",
      displayName: "Billing Address",
      type: "string",
      defaultValue: ""
    },
    {
      name: "billingCity",
      displayName: "Billing City",
      type: "string",
      defaultValue: ""
    },
    {
      name: "billingZip",
      displayName: "Billing ZIP",
      type: "string",
      defaultValue: ""
    },
    {
      name: "copyAddressButton",
      displayName: "Copy to Shipping",
      type: "button",
      action: "copyAddress"
    },
    {
      name: "shippingAddress",
      displayName: "Shipping Address",
      type: "string",
      defaultValue: ""
    },
    {
      name: "shippingCity",
      displayName: "Shipping City",
      type: "string",
      defaultValue: ""
    },
    {
      name: "shippingZip",
      displayName: "Shipping ZIP",
      type: "string",
      defaultValue: ""
    }
  ]
};

function App() {
  return (
    <ReactaForm
      definitionData={formDefinition}
      onSubmit={(definition, instanceName, valuesMap, t) => {
        console.log('Form submitted:', valuesMap);
      }}
    />
  );
}

export default App;
```

## API Reference

### Registration Functions

#### `registerButtonHandler(handlerName: string, fn: ButtonHandler): void`
Register a button handler function with a unique name.

#### `getButtonHandler(handlerName: string): ButtonHandler | undefined`
Retrieve a registered button handler by name.

#### `hasButtonHandler(handlerName: string): boolean`
Check if a button handler is registered.

#### `unregisterButtonHandler(handlerName: string): boolean`
Remove a registered button handler.

#### `listButtonHandlers(): string[]`
Get all registered button handler names.

## Best Practices

1. **Register handlers before rendering the form** - Button handlers should be registered before the form component mounts.

2. **Use descriptive action names** - Action names should clearly indicate what the button does.

3. **Handle errors gracefully** - Always validate inputs and provide clear error messages.

4. **Use translations** - Use the provided `t()` function for all user-facing text.

5. **Keep handlers focused** - Each button should have a single, clear purpose.

6. **Async operations** - Button handlers can be async. The button will show a "Processing..." state.

## Styling

Buttons use CSS variables for theming:

```css
:root {
  --reactaform-button-bg: #007bff;
  --reactaform-button-bg-hover: #0056b3;
  --reactaform-button-text: #ffffff;
  --reactaform-border-radius: 4px;
  --reactaform-input-height: 34px;
}
```

## Notes

- Buttons don't have a value in the form submission data
- Button fields don't participate in validation (no `required`, `min`, `max`, etc.)
- Buttons receive all form data, so be mindful of sensitive information
- Button handlers can be synchronous or asynchronous
- The button component displays "Processing..." while async handlers execute
