"use client";

import React, { useState } from "react";
import { ReactaForm, registerSubmissionHandler } from "reactaform";
import type { FieldValueType, FormSubmissionHandler, ReactaInstance } from "reactaform";
import "./style.css";

const exampleDefinition = {
  name: "submit_handler_app",
  version: "1.0.0",
  displayName: "Submit Handler Example",
  submitHandlerName: "exampleSubmitHandler",
  properties: [
    { name: "firstName", displayName: "First Name", type: "string", defaultValue: "" },
    { name: "age", displayName: "Age", type: "int", defaultValue: 30 },
    { name: "subscribe", displayName: "Subscribe to newsletter", type: "checkbox", defaultValue: false },
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

  React.useEffect(() => {
    const handler: FormSubmissionHandler = (
      definition, instanceName, valuesMap, t
    ): string[] | undefined => {
      void definition;
      void t;
      void instanceName;

      setInstance((prev) => {
        const prevInst = (prev as ReactaInstance) || ({} as ReactaInstance);
        const newInstance: ReactaInstance = {
          ...prevInst,
          name: instanceName || prevInst.name || "Unnamed Instance",
          version: definition.version as string,
          values: valuesMap as Record<string, FieldValueType>,
        };
        setSerialized(JSON.stringify(newInstance, null, 2));
        return newInstance;
      });

      return undefined;
    };

    registerSubmissionHandler("exampleSubmitHandler", handler);
  }, [setInstance, setSerialized]);

  return (
    <div className={`app`}>
      <h2>Reactaform Submit Handler</h2>

      <div style={{ display: "flex", gap: 16, height: "100%" }}>
        <div style={{ flex: 1, height: "100%" }}>
          <ReactaForm definitionData={exampleDefinition} instance={instance} style={{ maxWidth: 640, height: "100%" }} />
        </div>

        <div style={{ width: 320, height: "100%", display: "flex", flexDirection: "column" }}>
          <div>
            <strong>Instance (JSON)</strong>
          </div>
          <textarea style={{ flex: 1, width: "100%", boxSizing: "border-box", fontFamily: "monospace" }} value={serialized || JSON.stringify(instance, null, 2)} onChange={(e) => setSerialized(e.target.value)} />
        </div>
      </div>
    </div>
  );
}
