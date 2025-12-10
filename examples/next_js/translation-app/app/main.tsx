"use client";

import React, { useState } from "react";
import { ReactaForm } from "reactaform";
import "./style.css";

const translationDefinition = {
  name: "personalInformation",
  displayName: "Personal Information",
  version: "1.0.0",
  localization: "personal_information",
  properties: [
    { type: "text", name: "name", displayName: "Name", defaultValue: "", required: true },
    { type: "date", name: "birthday", displayName: "Birth Day", defaultValue: "", required: true },
    { type: "int", name: "age", displayName: "Age", defaultValue: 0, min: 0, minInclusive: true },
    { type: "dropdown", name: "gender", displayName: "Gender", options: [{ label: "Male", value: "male" }, { label: "Female", value: "female" }], defaultValue: "male" },
    { type: "text", name: "email", displayName: "Email", defaultValue: "" },
    { type: "multiline", name: "introduction", displayName: "Introduction", defaultValue: "", tooltip: "Summarize your educational background and professional experience", labelLayout: "column-left" }
  ]
};

const predefined_instance = {
  name: "instance1",
  version: "1.0.0",
  definition: "personalInformation",
  values: { name: "Alice", birthday: "1990-05-15", age: 33 }
};

export default function App() {
  const [language, setLanguage] = useState("en");

  return (
    <div className={`app`}>
      <h2>Reactaform Translation Example</h2>

      <div style={{ marginBottom: "10px" }}>
        <label>
          Language: {" "}
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </label>
      </div>
      <ReactaForm definitionData={translationDefinition} language={language} instance={predefined_instance} />
    </div>
  );
}
