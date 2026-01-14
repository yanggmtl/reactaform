// Instance App: Create, Load, and Edit Instances (JSX version)
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  createInstanceFromDefinition,
  ReactaForm,
  registerSubmissionHandler,
} from "reactaform";
import "./style.css";

const exampleDefinition = {
  name: "user_profile",
  version: "1.0.0",
  displayName: "User Profile",
  submitHandlerName: "instanceAppSubmitHandler",
  properties: [
    { name: "firstName", displayName: "First Name", type: "string", defaultValue: "" },
    { name: "lastName", displayName: "Last Name", type: "string", defaultValue: "" },
    { name: "email", displayName: "Email", type: "string", defaultValue: "" },
    { name: "age", displayName: "Age", type: "int", defaultValue: 25 },
    { name: "isActive", displayName: "Active User", type: "checkbox", defaultValue: true },
  ],
};

const getUniqueName = (baseName, instances) => {
  let i = 1;
  let candidate = `${baseName} (${i})`;
  const exists = (name) => instances.some((ins) => ins.name === name);
  while (exists(candidate)) {
    i += 1;
    candidate = `${baseName} (${i})`;
  }
  return candidate;
};

const placeholder=`{
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
}`;

export default function App() {
  const [instances, setInstances] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [loadJsonInput, setLoadJsonInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedIndexRef = React.useRef(selectedIndex);
  const instancesRef = React.useRef(instances);

  React.useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  React.useEffect(() => {
    instancesRef.current = instances;
  }, [instances]);

  const submissionHandler = React.useCallback(
    (definition, instanceName, valuesMap, t) => {
      void definition;
      void t;

      if (
        instanceName &&
        instancesRef.current.some(
          (ins, idx) => ins.name === instanceName && idx !== (selectedIndexRef.current ?? -1)
        )
      ) {
        return [
          t("Instance name {{1}} has been used. Please choose another name.", `"${instanceName}"`),
        ];
      }

      const idx = selectedIndexRef.current;
      if (idx !== null && idx !== undefined) {
        setInstances((prev) => {
          const updated = [...prev];
          const current = updated[idx];
          updated[idx] = {
            ...current,
            name: instanceName ?? current.name,
            values: valuesMap,
          };
          return updated;
        });
      }

      return undefined;
    },
    [setInstances]
  );

  React.useEffect(() => {
    registerSubmissionHandler("instanceAppSubmitHandler", submissionHandler);
  }, [submissionHandler]);

  const handleNew = () => {
    const uniqueName = getUniqueName(exampleDefinition.name, instances);
    const res = createInstanceFromDefinition(exampleDefinition, uniqueName);
    if (!res || !res.instance) {
      setErrorMessage(res?.error || "Failed to create instance");
      return;
    }

    const newInstance = res.instance;
    setInstances((prev) => {
      const updated = [...prev, newInstance];
      setSelectedIndex(updated.length - 1);
      return updated;
    });
    setErrorMessage("");
  };

  const handleLoadClick = () => {
    setShowLoadDialog(true);
    setLoadJsonInput("");
    setErrorMessage("");
  };

  const handleLoadConfirm = () => {
    try {
      const jsonInput = loadJsonInput.trim() != "" ? loadJsonInput : placeholder;
      const parsed = JSON.parse(jsonInput);

      if (!parsed.name || !parsed.definition || !parsed.version || !parsed.values) {
        setErrorMessage("Invalid instance format. Must include name, definition, version, and values.");
        return;
      }

      setInstances((prev) => [...prev, parsed]);
      setSelectedIndex(instances.length);
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
            <ReactaForm definitionData={exampleDefinition} instance={selectedInstance} />
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
              placeholder={placeholder}
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
