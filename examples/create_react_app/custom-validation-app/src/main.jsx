import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ReactaForm, registerFormValidationHandler } from "reactaform";
import { FormValidationHandler } from "reactaform";
import "./style.css";

const exampleDefinition = {
  name: "custom_validation_app",
  version: "1.0.0",
  displayName: "Custom Validation Example",
  validationHandlerName: "rangeValidationHandler", // 1. Validation handler name reference
  properties: [
    {
      name: "lowerLimit",
      displayName: "Lower Limit",
      type: "int",
      defaultValue: 0,
    },
    {
      name: "upperLimit",
      displayName: "Upper Limit",
      type: "int",
      defaultValue: 10,
    },
  ],
};

const introduction = `Instruction:

This form demonstrates custom cross-field validation: the 'Lower Limit' field must be less than the 'Upper Limit' field.

Action: Input a value for each field, then submit the form to see validation in action.

1. Lower Limit < Upper Limit, the validation passes and the form will submit successfully.

2. If Lower Limit >= Upper Limit, an error message will appear.`;

export default function App() {

  // 2. Define the form validator function
  const formValidator: FormValidationHandler = (valuesMap, t) => {
    // valuesMap contains raw values for all fields
    const lowerLimit = Number(valuesMap["lowerLimit"] ?? NaN);
    const upperLimit = Number(valuesMap["upperLimit"] ?? NaN);

    // If either value is not a number, we'll let field-level validators handle it.
    if (Number.isNaN(lowerLimit) || Number.isNaN(upperLimit))
      return undefined;
    if (!(lowerLimit < upperLimit)) {
      return [t("Lower Limit must be less than Upper Limit.")];
    }
    return undefined;
  };
  
  useEffect(() => {
    // 3. Register the form validator
    registerFormValidationHandler("rangeValidationHandler", formValidator);
  }, []);

  return (
    <div
      className="app"
      style={{
        height: "500px",
        display: "flex",
        flexDirection: "column",
        padding: 16,
      }}
    >
      <h2 style={{ margin: "0 0 16px 0" }}>Reactaform Custom Validation</h2>

      <div style={{ display: "flex", gap: 16, flex: 1, minHeight: 0 }}>
        <div
          style={{
            width: "400px",
            flexDirection: "column",
          }}
        >
          <ReactaForm
            definitionData={exampleDefinition}
          />
        </div>

        <textarea
          style={{
            width: "350px",
            height: "100%",
            boxSizing: "border-box",
            fontFamily: "monospace",
          }}
          value={introduction}
          readOnly
        />
      </div>
    </div>
  );
}

const container = document.getElementById('root');
if (container) createRoot(container).render(<App />);
