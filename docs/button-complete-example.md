# Button Type - Complete Working Example

This example demonstrates various button capabilities including calculations, validations, field resets, and data transformations.

## Features Demonstrated

1. **Calculate Button** - Performs calculations based on form values
2. **Reset Button** - Clears specific fields  
3. **Validate Button** - Custom validation logic
4. **Transform Button** - Transforms data (e.g., uppercase conversion)
5. **Async Button** - Simulates API calls with loading states

## Complete Code

```typescript
import React from 'react';
import { ReactaForm, registerButtonHandler, type ButtonHandler } from 'reactaform';

// 1. Calculate button - Sums two numbers
registerButtonHandler('calculateSum', (valuesMap, handleChange, handleError) => {
  const num1 = Number(valuesMap['number1']) || 0;
  const num2 = Number(valuesMap['number2']) || 0;
  
  const sum = num1 + num2;
  handleChange('sum', sum);
  handleError('sum', null);
});

// 2. Reset button - Clears specific fields
registerButtonHandler('resetNumbers', (valuesMap, handleChange, handleError) => {
  handleChange('number1', 0);
  handleChange('number2', 0);
  handleChange('sum', 0);
  
  // Clear any errors
  handleError('number1', null);
  handleError('number2', null);
  handleError('sum', null);
});

// 3. Validate button - Custom validation with error reporting
registerButtonHandler('validatePositive', (valuesMap, handleChange, handleError, t) => {
  const num1 = Number(valuesMap['number1']);
  const num2 = Number(valuesMap['number2']);
  
  let hasError = false;
  
  if (num1 < 0) {
    handleError('number1', t('Number must be positive'));
    hasError = true;
  } else {
    handleError('number1', null);
  }
  
  if (num2 < 0) {
    handleError('number2', t('Number must be positive'));
    hasError = true;
  } else {
    handleError('number2', null);
  }
  
  if (!hasError) {
    alert(t('All numbers are valid!'));
  }
});

// 4. Transform button - Convert text to uppercase
registerButtonHandler('toUppercase', (valuesMap, handleChange) => {
  const text = String(valuesMap['inputText'] || '');
  handleChange('outputText', text.toUpperCase());
});

// 5. Async button - Simulates API call
registerButtonHandler('fetchData', async (valuesMap, handleChange, handleError, t) => {
  const userId = valuesMap['userId'] as number;
  
  if (!userId) {
    handleError('userData', t('Please enter a user ID first'));
    return;
  }
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock data
    const userData = {
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`
    };
    
    handleChange('userData', JSON.stringify(userData, null, 2));
    handleError('userData', null);
  } catch (error) {
    handleError('userData', t('Failed to fetch user data'));
  }
});

// 6. Complex calculation - Calculate order total with tax
registerButtonHandler('calculateOrder', (valuesMap, handleChange, handleError, t) => {
  const price = Number(valuesMap['price']) || 0;
  const quantity = Number(valuesMap['quantity']) || 0;
  const taxRate = Number(valuesMap['taxRate']) || 0;
  
  if (price < 0 || quantity < 0 || taxRate < 0) {
    handleError('total', t('All values must be positive'));
    return;
  }
  
  const subtotal = price * quantity;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  
  handleChange('subtotal', subtotal.toFixed(2));
  handleChange('tax', tax.toFixed(2));
  handleChange('total', total.toFixed(2));
  handleError('total', null);
});

// Form definition with all button types
const formDefinition = {
  name: "ButtonExampleForm",
  version: "1.0.0",
  displayName: "Button Type Examples",
  properties: [
    // Section 1: Basic Calculation
    {
      name: "section1",
      displayName: "Basic Calculator",
      type: "separator"
    },
    {
      name: "number1",
      displayName: "Number 1",
      type: "int",
      defaultValue: 0,
      min: -100,
      max: 100
    },
    {
      name: "number2",
      displayName: "Number 2",
      type: "int",
      defaultValue: 0,
      min: -100,
      max: 100
    },
    {
      name: "calculateBtn",
      displayName: "Calculate Sum",
      type: "button",
      action: "calculateSum",
      tooltip: "Calculate the sum of Number 1 and Number 2"
    },
    {
      name: "validateBtn",
      displayName: "Validate Numbers",
      type: "button",
      action: "validatePositive",
      tooltip: "Check if numbers are positive"
    },
    {
      name: "sum",
      displayName: "Sum",
      type: "int",
      defaultValue: 0
    },
    {
      name: "resetBtn",
      displayName: "Reset",
      type: "button",
      action: "resetNumbers",
      tooltip: "Reset all fields to zero"
    },
    
    // Section 2: Text Transformation
    {
      name: "section2",
      displayName: "Text Transformation",
      type: "separator"
    },
    {
      name: "inputText",
      displayName: "Input Text",
      type: "string",
      defaultValue: "hello world"
    },
    {
      name: "transformBtn",
      displayName: "Convert to Uppercase",
      type: "button",
      action: "toUppercase"
    },
    {
      name: "outputText",
      displayName: "Output Text",
      type: "string",
      defaultValue: ""
    },
    
    // Section 3: Async Operations
    {
      name: "section3",
      displayName: "Async Operations",
      type: "separator"
    },
    {
      name: "userId",
      displayName: "User ID",
      type: "int",
      defaultValue: 1,
      min: 1,
      max: 1000
    },
    {
      name: "fetchBtn",
      displayName: "Fetch User Data",
      type: "button",
      action: "fetchData",
      tooltip: "Fetch user data from API (simulated)"
    },
    {
      name: "userData",
      displayName: "User Data (JSON)",
      type: "multiline",
      defaultValue: "",
      minHeight: "120px"
    },
    
    // Section 4: Order Calculator
    {
      name: "section4",
      displayName: "Order Calculator",
      type: "separator"
    },
    {
      name: "price",
      displayName: "Unit Price ($)",
      type: "float",
      defaultValue: 10.00,
      min: 0,
      step: 0.01
    },
    {
      name: "quantity",
      displayName: "Quantity",
      type: "int",
      defaultValue: 1,
      min: 0
    },
    {
      name: "taxRate",
      displayName: "Tax Rate (%)",
      type: "float",
      defaultValue: 8.5,
      min: 0,
      max: 100,
      step: 0.1
    },
    {
      name: "calculateOrderBtn",
      displayName: "Calculate Total",
      type: "button",
      action: "calculateOrder"
    },
    {
      name: "subtotal",
      displayName: "Subtotal ($)",
      type: "string",
      defaultValue: "0.00"
    },
    {
      name: "tax",
      displayName: "Tax ($)",
      type: "string",
      defaultValue: "0.00"
    },
    {
      name: "total",
      displayName: "Total ($)",
      type: "string",
      defaultValue: "0.00"
    }
  ]
};

function App() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <ReactaForm
        definitionData={formDefinition}
        theme="light"
        onSubmit={(definition, instanceName, valuesMap, t) => {
          console.log('Form submitted:', valuesMap);
          alert(t('Form submitted successfully!'));
        }}
      />
      
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ marginTop: 0 }}>About This Example</h3>
        <p>This form demonstrates all button capabilities:</p>
        <ul>
          <li><strong>Calculate Sum:</strong> Reads two numbers and writes the sum</li>
          <li><strong>Validate Numbers:</strong> Custom validation with error reporting</li>
          <li><strong>Reset:</strong> Clears specific fields to defaults</li>
          <li><strong>Convert to Uppercase:</strong> Transforms text data</li>
          <li><strong>Fetch User Data:</strong> Async operation with loading state</li>
          <li><strong>Calculate Total:</strong> Multi-field calculation with formatting</li>
        </ul>
        <p><em>Buttons provide full access to form data and can modify any field.</em></p>
      </div>
    </div>
  );
}

export default App;
```

## Key Concepts

### 1. Handler Registration
Always register handlers before rendering the form:
```typescript
registerButtonHandler('handlerName', (valuesMap, handleChange, handleError, t) => {
  // Handler logic
});
```

### 2. Reading Values
Access any field value through `valuesMap`:
```typescript
const value = valuesMap['fieldName'];
```

### 3. Writing Values
Update any field using `handleChange`:
```typescript
handleChange('fieldName', newValue);
```

### 4. Error Management
Report or clear errors using `handleError`:
```typescript
handleError('fieldName', 'Error message'); // Set error
handleError('fieldName', null); // Clear error
```

### 5. Async Operations
Handlers can be async - the button shows a loading state:
```typescript
registerButtonHandler('asyncHandler', async (valuesMap, handleChange) => {
  const result = await fetchData();
  handleChange('resultField', result);
});
```

## Testing Your Buttons

Run the example and try:
1. Enter numbers and click "Calculate Sum"
2. Enter negative numbers and click "Validate Numbers"
3. Click "Reset" to clear fields
4. Type text and click "Convert to Uppercase"
5. Enter a user ID and click "Fetch User Data" (watch the loading state)
6. Enter order details and click "Calculate Total"

## Next Steps

- Create your own button handlers for specific use cases
- Combine buttons with conditional visibility using parent/children
- Use buttons in groups for related actions
- Add confirmation dialogs before destructive operations
- Integrate with your backend APIs for real-time operations
