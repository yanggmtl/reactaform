import { createRoot } from 'react-dom/client';
import { ReactaForm, registerButtonHandler } from 'reactaform';

// Register a simple calculation button handler
registerButtonHandler('calculateSum', (valuesMap, handleChange, handleError) => {
  const num1 = Number(valuesMap['number1']) || 0;
  const num2 = Number(valuesMap['number2']) || 0;
  
  const sum = num1 + num2;
  handleChange('result', sum);
  
  // Clear any previous errors
  handleError('result', null);
});

// Register a reset button handler
registerButtonHandler('resetForm', (valuesMap, handleChange, handleError) => {
  void valuesMap;
  handleChange('number1', 0);
  handleChange('number2', 0);
  handleChange('result', 0);
  
  handleError('number1', null);
  handleError('number2', null);
  handleError('result', null);
});

// Form definition with button fields
const formDefinition = {
  name: "CalculatorForm",
  version: "1.0.0",
  displayName: "Simple Calculator with Buttons",
  properties: [
    {
      name: "desc",
      displayName: "Welcome Message",
      type: "description",
      textAlign: "left",
      allowHtml: true,
      displayText: "This form allows you to add two numbers using buttons.<ol><li>Enter two positive numbers</li><li>Click 'Calculate Sum' to compute the result</li><li>Click 'Reset Form' to clear all fields</li><li>Click 'Apply' to submit the form</li></ol>",
    },
    {
      name: "number1",
      displayName: "Number 1",
      type: "int",
      defaultValue: 0,
      required: true,
      min: 0
    },
    {
      name: "number2",
      displayName: "Number 2",
      type: "int",
      defaultValue: 0,
      required: true,
      min: 0
    },
    {
      name: "calculateButton",
      displayName: "Calculate Sum",
      type: "button",
      width: 120,
      action: "calculateSum",
      tooltip: "Click to calculate the sum of Number 1 and Number 2"
    },
    {
      name: "result",
      displayName: "Result",
      type: "int",
      defaultValue: 0,
      tooltip: "The calculated sum"
    },
    {
      name: "resetButton",
      displayName: "Reset Form",
      type: "button",
      action: "resetForm",
      tooltip: "Reset all fields to default values"
    }
  ]
};

export default function App() {
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <ReactaForm
        definitionData={formDefinition}
        theme="light"
        onSubmit={(definition, instanceName, valuesMap, t) : string[]=> {
          void definition;
          void instanceName;
          alert(t('Form submitted! Result: ') + valuesMap['result']);
          console.log('Submitted values:', valuesMap);
          return [];
        }}
      />
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
