// Submit Handler App: Custom Submit Handler Demo
// This demo shows how to register a custom `FormSubmissionHandler`
// with `registerSubmissionHandler`. The handler is defined (typed as
// `FormSubmissionHandler`) and registered inside `React.useEffect` so the
// example keeps the registration local to the app while following the
// library interface. Use this app to test submission handler behavior.
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { ReactaForm, registerSubmissionHandler } from "reactaform";
import type { FieldValueType, ReactaInstance, ReactaDefinition, TranslationFunction } from "reactaform";
import "./style.css";

const exampleDefinition = {
  name: "submit_handler_app",
  version: "1.0.0",
  displayName: "Submit Handler Example",
  // name of the registered submit handler to invoke on submit
  submitHandlerName: "exampleSubmitHandler",
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
  ],
};

const predefinedInstance = {
  name: "exampleInstance1",
  version: "1.0.0",
  definition: "submit_handler_app",
  values: {
    firstName: "John",
    age: 30,
    subscribe: false,
  },
};
export default function App() {
  const [instance, setInstance] = useState<ReactaInstance>(predefinedInstance);
  const [serialized, setSerialized] = useState<string>("");

  // Register a submission handler that stores submitted values into the local `instance` state
  React.useEffect(() => {
    const handler = (
      definition: ReactaDefinition | Record<string, unknown>,
      instanceName: string | null,
      valuesMap: Record<string, FieldValueType | unknown>,
      t: TranslationFunction
    ): string[] | undefined => {
      void definition;
      void t;
      void instanceName;

      // Use functional update to avoid stale closures over `instance` and ensure we always
      // base the new instance on the latest state.
      setInstance((prev: ReactaInstance | undefined) => {
        const prevInst = (prev as ReactaInstance) || ({} as ReactaInstance);
        const newInstance: ReactaInstance = {
          ...prevInst,
          name: instanceName || prevInst.name || "Unnamed Instance",
          version: definition.version as string,
          values: valuesMap as Record<string, FieldValueType>,
        };
        // update serialized snapshot immediately
        setSerialized(JSON.stringify(newInstance, null, 2));
        return newInstance;
      });

      return undefined;
    };

    registerSubmissionHandler("exampleSubmitHandler", handler);
    // no-op cleanup: handlers are registered globally in this simple demo
  }, [setInstance, setSerialized]);

  return (
    <div className={`app`}>
      <h2>Reactaform Submit Handler</h2>

      <div style={{ display: "flex", gap: 16, height: "100%" }}>
        <div style={{ flex: 1, height: "100%" }}>
          <ReactaForm
            definitionData={exampleDefinition}
            instance={instance}
            style={{ maxWidth: 640, height: "100%" }}
          />
        </div>

        <div
          style={{
            width: 320,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div>
            <strong>Instance (JSON)</strong>
          </div>
          <textarea
            style={{
              flex: 1,
              width: "100%",
              boxSizing: "border-box",
              fontFamily: "monospace",
            }}
            value={serialized || JSON.stringify(instance, null, 2)}
            onChange={(e) => setSerialized(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

const container = document.getElementById("root");
if (container) createRoot(container).render(<App />);
