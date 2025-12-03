// Parents/Children Visibility Test App
// This app demonstrates parent-child field relationships where child fields
// (like "suggestion") are conditionally shown/hidden based on parent field
// values (like "satisfyWithService"). It tests the visibility logic for
// fields with `parents` dependencies, including boolean values like `false`.
import { createRoot } from "react-dom/client";
import { ReactaForm } from "reactaform";
import "./style.css";

const testDefinition = {
  "name": "customerSurvey",
  "displayName": "Customer Survey",
  "version": "1.0.0",
  "properties": [
    {
      "type": "text",
      "name": "name",
      "displayName": "Name",
      "defaultValue": "",
      "required": true
    },
    {
      "type": "rating",
      "name": "satisfaction",
      "displayName": "How Satisfy with our product",
      "defaultValue": 0,
      "labelLayout": "column-left"
    },
    {
      "type": "switch",
      "name": "satisfyWithService",
      "displayName": "Do you satisfy with our customer service",
      "defaultValue": false
    },
    {
      "type": "multiline",
      "name": "suggestion",
      "displayName": "Tell us your suggestions with our service",
      "defaultValue": "",
      "parents": {
        "satisfyWithService": [
          false
        ]
      },
      "labelLayout": "column-left"
    }
  ]
};

export default function App() {
  return (
    <div className={`app`}>
      <h2>Reactaform Translation Example</h2>
      <ReactaForm
        definitionData={{
          ...testDefinition,
          // Use the preset handler for demo purposes
          submitHandlerName: "Preset_AlertSubmitHandler",
        }}
      />
    </div>
  );
}

const container = document.getElementById("root");
if (container) createRoot(container).render(<App />);
