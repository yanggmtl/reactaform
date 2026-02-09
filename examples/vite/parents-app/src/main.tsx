import { ReactaForm } from "reactaform";
import "./style.css";
import { createRoot } from "react-dom/client";

const testDefinition = {
  "name": "definition",
  "displayName": "Definition",
  "version": "1.0.0",
  "properties": [
    {
      "type": "radio",
      "name": "radio",
      "displayName": "Radio",
      "options": [
        {
          "label": "Option 1",
          "value": "1"
        },
        {
          "label": "Option 2",
          "value": "2"
        }
      ],
      "defaultValue": "1",
      "parents": {}
    },
    {
      "type": "dropdown",
      "name": "dropdown",
      "displayName": "dropdown",
      "options": [
        {
          "label": "Option 1",
          "value": "1"
        },
        {
          "label": "Option 2",
          "value": "2"
        }
      ],
      "defaultValue": "1"
    },
    {
      "type": "multi-selection",
      "name": "multipleSelection",
      "displayName": "multipleSelection",
      "options": [
        {
          "label": "Option 1",
          "value": "1"
        },
        {
          "label": "Option 2",
          "value": "2"
        }
      ],
      "defaultValue": [
        "1"
      ]
    },
    {
      "type": "text",
      "name": "testText",
      "displayName": "Test Text",
      "defaultValue": "",
      "parents": {
        "radio": [
          "1"
        ],
        "dropdown": [
          "2"
        ],
        "multipleSelection": [
          "2"
        ]
      }
    }
  ]
};

export default function App() {
  return (
    <div className={`app`}>
      <h2>Reactaform Parents Example</h2>
      <ReactaForm
        definitionData={{ ...testDefinition }}
      />
    </div>
  );
}

const container = document.getElementById("root");
if (container) createRoot(container).render(<App />);
