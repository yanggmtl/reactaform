"use client";

import { ReactaForm } from "reactaform";
import "./style.css";

const testDefinition = {
  name: "customerSurvey",
  displayName: "Customer Survey",
  version: "1.0.0",
  properties: [
    { type: "text", name: "name", displayName: "Name", defaultValue: "", required: true },
    { type: "rating", name: "satisfaction", displayName: "How Satisfy with our product", defaultValue: 0, labelLayout: "column-left" },
    { type: "switch", name: "satisfyWithService", displayName: "Do you satisfy with our customer service", defaultValue: false },
    { type: "multiline", name: "suggestion", displayName: "Tell us your suggestions with our service", defaultValue: "", parents: { satisfyWithService: [false] }, labelLayout: "column-left" }
  ]
};

const predefined_instance = {
  name: "parentsExampleInstance",
  version: "1.0.0",
  definition: "customerSurvey",
  values: {
    name: "John Doe",
    satisfaction: 4,
    satisfyWithService: false,
    suggestion: "Improve response time."
  }
};

export default function App() {
  return (
    <div className={`app`}>
      <h2>Reactaform Parents Example</h2>
      <ReactaForm definitionData={{ ...testDefinition }} instance={predefined_instance} />
    </div>
  );
}
