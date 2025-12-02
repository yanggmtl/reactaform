import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ReactaForm,
  registerSubmissionHandler,
} from "reactaform";
import type { FieldValueType } from "reactaform";
import "./style.css";

const exampleDefinition = {
  name: "example-form",
  version: "1.0.0",
  displayName: "Example Form",
  // name of the registered submit handler to invoke on submit
  submitHandlerName: "exampleSubmitHandler",
  localization: "example-form",
  properties: [
    {
      name: "firstName",
      displayName: "First Name",
      type: "string",
      defaultValue: "",
    },
    {
      name: "age",
      displayName: "Age",
      type: "int",
      defaultValue: 30,
    },
    {
      name: "subscribe",
      displayName: "Subscribe to newsletter",
      type: "checkbox",
      defaultValue: false,
    },
    {
      type: "unit",
      name: "unitValue",
      displayName: "unitValue",
      dimension: "temperature",
      defaultValue: 30,
      defaultUnit: "C",
    },
    {
      type: "multi-selection",
      name: "multipleSelection",
      displayName: "Multiple Selection",
      options: [
        {
          label: "Option 1",
          value: "1",
        },
        {
          label: "Option 2",
          value: "2",
        },
      ],
      defaultValue: ["2"],
    },
  ],
};

const predefined_instance: Record<string, FieldValueType> = {
  firstName: "Guang",
  age: 30,
  subscribe: false,
  unitValue: [30, "F"],
  multipleSelection: ["2", "1"] as unknown as FieldValueType,
};

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [instance, setInstance] = useState<Record<string, FieldValueType>>(predefined_instance);

  // Register a submission handler that stores submitted values into the local `instance` state
  React.useEffect(() => {
    registerSubmissionHandler(
      "exampleSubmitHandler",
      (definition, valuesMap) => {
        setInstance(valuesMap as Record<string, FieldValueType>);
        const serializedStr = JSON.stringify(valuesMap, null, 2);
        alert(serializedStr);
        return undefined;
      }
    );
  }, []);

  return (
    <div className={`app`} style={{ width: "400px" }}>
      <h1>Dark Mode Example</h1>

      <div className="dark_mode_panel">
        <label>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
          />{" "}
          Dark mode
        </label>
      </div>

      <div style={{ gap: 16 }}>
        <div style={{ flex: 1 }}>
          <ReactaForm
            definitionData={exampleDefinition}
            darkMode={darkMode}
            instance={instance}
            style={{ maxWidth: 640 }}
          />
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
