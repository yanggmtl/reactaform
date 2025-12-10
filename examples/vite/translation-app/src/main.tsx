// Translation Example App
// The `localization` property in the form definition (e.g. `example-form`)
// is used to select a translation JSON file placed under this app's
// `public/locales/<lang>/` folder. For example, with
// `localization: "example-form"` and `language = "fr"`, the form will
// load `/locales/fr/example-form.json` from the app's `public` folder.
// This app demonstrates switching `language` at runtime; translation files
// should be found at `public/locales/<lang>/<localization>.json`.
// Translation: 
//   DisplayName, tooltip content, and option labels are translated.
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { ReactaForm } from "reactaform";
import "./style.css";

const translationDefinition = {
  "name": "personalInformation",
  "displayName": "Personal Information",
  "version": "1.0.0",
  "localization": "personal_information",
  "properties": [
    {
      "type": "text",
      "name": "name",
      "displayName": "Name",
      "defaultValue": "",
      "required": true
    },
    {
      "type": "date",
      "name": "birthday",
      "displayName": "Birth Day",
      "defaultValue": "",
      "required": true
    },
    {
      "type": "int",
      "name": "age",
      "displayName": "Age",
      "defaultValue": 0,
      "min": 0,
      "minInclusive": true
    },
    {
      "type": "dropdown",
      "name": "gender",
      "displayName": "Gender",
      "options": [
        {
          "label": "Male",
          "value": "male"
        },
        {
          "label": "Female",
          "value": "female"
        }
      ],
      "defaultValue": "male"
    },
    {
      "type": "text",
      "name": "email",
      "displayName": "Email",
      "defaultValue": ""
    },
    {
      "type": "multiline",
      "name": "introduction",
      "displayName": "Introduction",
      "defaultValue": "",
      "tooltip": "Summarize your educational background and professional experience",
      "labelLayout": "column-left" // row, column-left, column-center
    }
  ]
};

const predefined_instance = {
  name: "instance1",
  version: "1.0.0", 
  definition: "personalInformation",
  values: {
    name: "Alice",
    birthday: "1990-05-15",
    age: 33,
  }
};

export default function App() {
  const [language, setLanguage] = useState("en");

  return (
    <div className={`app`}>
      <h2>Reactaform Translation Example</h2>

      <div style={{marginBottom: "10px" }}>
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
      <ReactaForm
        definitionData={translationDefinition}
        language={language}
        instance={predefined_instance}
      />
    </div>
  );
}

const container = document.getElementById("root");
if (container) createRoot(container).render(<App />);
