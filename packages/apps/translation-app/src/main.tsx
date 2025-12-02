import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { ReactaForm, registerSubmissionHandler } from "reactaform";
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
      displayName: "Temperature",
      dimension: "temperature",
      defaultValue: 30,
      defaultUnit: "C",
    },
    {
      type: "multi-selection",
      name: "multipleSelection",
      displayName: "Multiple Selection",
      options: [
        { label: "Option 1", value: "1" },
        { label: "Option 2", value: "2" },
        { label: "Option 3", value: "3" },
        { label: "Option 4", value: "4" },
        { label: "Option 5", value: "5" },
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
  const [language, setLanguage] = useState("en");
  const [instance, setInstance] =
    useState<Record<string, FieldValueType>>(predefined_instance);

  // Register a submission handler that stores submitted values into the local `instance` state
  React.useEffect(() => {
    registerSubmissionHandler(
      "translationSubmitHandler",
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
      <h2>Reactaform Translation Example</h2>

      <div className="language_panel">
        <label>
          Language: {" "}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </label>
      </div>
      <div style={{ gap: 16}}>
        <ReactaForm
          definitionData={exampleDefinition}
          language={language}
          instance={instance}
          style={{ maxWidth: 640 }}
        />
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
