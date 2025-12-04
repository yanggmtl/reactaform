// Custom Validation App: cross-field validation demo
// This demo registers a form-level validation handler that enforces
// the first numeric field to be less than the second numeric field.
// It also registers a simple submission handler to mirror the
// `submit-handler-app` example behavior.
// Test: input various values to see validation in action.
//       If lower limit is less than upper limit, submission should succeed.
//       If not, an error message should appear.
//       When submission messsage appears, any value change in the form will dismiss the message
import React from "react";
import { createRoot } from "react-dom/client";
import {
  ReactaForm,
  registerFormValidationHandler,
} from "reactaform";
import type { FormValidationHandler} from "reactaform";
import "./style.css";

const exampleDefinition = {
  name: "custom_validation_app",
  version: "1.0.0",
  displayName: "Custom Validation Example",
  // register and reference the validation handler name below
  validationHandlerName: "rangeValidationHandler",
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

export default function App() {

  // Register form validation handler (cross-field)
  React.useEffect(() => {
    const formValidator: FormValidationHandler = (valuesMap, t) => {
      // valuesMap contains raw values for all fields
      const first = Number(valuesMap["lowerLimit"] ?? NaN);
      const second = Number(valuesMap["upperLimit"] ?? NaN);

      // If either value is not a number, we'll let field-level validators handle it.
      if (Number.isNaN(first) || Number.isNaN(second)) return undefined;

      if (!(first < second)) {
        return [t("Lower Limit must be less than Upper Limit.")];
      }
      return undefined;
    };

    registerFormValidationHandler("rangeValidationHandler", formValidator);
  }, []);

  return (
    <div className={`app`}>
      <h2>Reactaform Custom Validation</h2>
      <div style={{gap: 16, height: "100%" }}>
        <ReactaForm
          definitionData={exampleDefinition}
          style={{ maxWidth: 640, height: "100%" }}
        />
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
