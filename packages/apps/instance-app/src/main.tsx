// Instance App: Create, Load, and Edit Instances
// This app demonstrates creating new instances from definitions, loading
// existing instances from JSON, managing a list of instances, and editing
// selected instances using ReactaForm with immediate updates on submit.

import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ReactaForm,
  registerSubmissionHandler,
} from "reactaform";
import type { ReactaDefinition, ReactaInstance } from "reactaform";
import "./style.css";

// Example definition for creating new instances
const exampleDefinition: ReactaDefinition = {
  name: "user_profile",
  version: "1.0.0",
  displayName: "User Profile",
  submitHandlerName: "instanceAppSubmitHandler",
  properties: [
    {
      name: "firstName",
      displayName: "First Name",
      type: "string",
      defaultValue: "",
    },
    {
      name: "lastName",
      displayName: "Last Name",
      type: "string",
      defaultValue: "",
    },
    {
      name: "email",
      displayName: "Email",
      type: "string",
      defaultValue: "",
    },
    {
      name: "age",
      displayName: "Age",
      type: "int",
      defaultValue: 25,
    },
    {
      name: "isActive",
      displayName: "Active User",
      type: "checkbox",
      defaultValue: true,
    },
  ],
};

let instanceCounter = 1;

export default function App() {
  const [instances, setInstances] = useState<ReactaInstance[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [loadJsonInput, setLoadJsonInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Register submission handler to update the selected instance
  React.useEffect(() => {
    const handler = (
      definition: ReactaDefinition | Record<string, unknown>,
      instanceName: string | null,
      valuesMap: Record<string, unknown>,
      t: (key: string) => string
    ): string[] | undefined => {
      void definition;
      void t;
      void instanceName;

      // Update the currently selected instance with new values
      if (selectedIndex !== null) {
        setInstances((prev) => {
          const updated = [...prev];
          updated[selectedIndex] = {
            ...updated[selectedIndex],
            values: valuesMap,
          };
          return updated;
        });
      }

      return undefined;
    };

    registerSubmissionHandler("instanceAppSubmitHandler", handler);
  }, [selectedIndex]);

  const handleNew = () => {
    const newInstance: ReactaInstance = {
      name: `Instance ${instanceCounter++}`,
      definition: exampleDefinition.name,
      version: exampleDefinition.version,
      values: {},
    };

    // Populate with default values from definition
    exampleDefinition.properties?.forEach((prop) => {
      if (prop.defaultValue !== undefined) {
        newInstance.values[prop.name] = prop.defaultValue;
      }
    });

    setInstances((prev) => [...prev, newInstance]);
    setSelectedIndex(instances.length); // Select the new instance
    setErrorMessage("");
  };

  const handleLoadClick = () => {
    setShowLoadDialog(true);
    setLoadJsonInput("");
    setErrorMessage("");
  };

  const handleLoadConfirm = () => {
    try {
      const parsed = JSON.parse(loadJsonInput) as ReactaInstance;

      // Basic validation
      if (!parsed.name || !parsed.definition || !parsed.version || !parsed.values) {
        setErrorMessage("Invalid instance format. Must include name, definition, version, and values.");
        return;
      }

      setInstances((prev) => [...prev, parsed]);
      setSelectedIndex(instances.length); // Select the loaded instance
      setShowLoadDialog(false);
      setLoadJsonInput("");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(`Failed to parse JSON: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleLoadCancel = () => {
    setShowLoadDialog(false);
    setLoadJsonInput("");
    setErrorMessage("");
  };

  const selectedInstance = selectedIndex !== null ? instances[selectedIndex] : null;

  return (
    <div className="app">
      <h2>Instance Manager</h2>

      <div className="toolbar">
        <button onClick={handleNew}>New</button>
        <button onClick={handleLoadClick}>Load</button>
      </div>

      <div className="content">
        <div className="instance-list-panel">
          <h3>Instances</h3>
          <div className="instance-list">
            {instances.length === 0 && (
              <div style={{ color: "#999", fontSize: "13px", padding: "12px" }}>
                No instances yet. Click "New" or "Load" to get started.
              </div>
            )}
            {instances.map((instance, index) => (
              <div
                key={index}
                className={`instance-item ${selectedIndex === index ? "selected" : ""}`}
                onClick={() => {
                  setSelectedIndex(index);
                  setErrorMessage("");
                }}
              >
                {instance.name}
              </div>
            ))}
          </div>
        </div>

        <div className={`editor-panel ${!selectedInstance ? "empty" : ""}`}>
          {selectedInstance ? (
            <ReactaForm
              definitionData={exampleDefinition}
              instance={selectedInstance}
            />
          ) : (
            <div>Select an instance from the list to edit</div>
          )}
        </div>
      </div>

      {showLoadDialog && (
        <div className="load-dialog-overlay" onClick={handleLoadCancel}>
          <div className="load-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Load Instance from JSON</h3>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <textarea
              placeholder='Paste instance JSON here, e.g.:
{
  "name": "My Instance",
  "definition": "user_profile",
  "version": "1.0.0",
  "values": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "age": 30,
    "isActive": true
  }
}'
              value={loadJsonInput}
              onChange={(e) => setLoadJsonInput(e.target.value)}
            />
            <div className="load-dialog-actions">
              <button onClick={handleLoadCancel}>Cancel</button>
              <button className="primary" onClick={handleLoadConfirm}>
                Load
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const container = document.getElementById("root");
if (container) createRoot(container).render(<App />);
