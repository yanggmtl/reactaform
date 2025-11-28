import type { ReactaDefinition } from "../core/reactaFormTypes";

const conditionalAddress: ReactaDefinition = {
  name: "conditionalAddress",
  version: "1.0",
  displayName: "Conditional Address Form",
  properties: [
    {
      name: "hasAddress",
      displayName: "Has Address",
      type: "boolean",
      defaultValue: false,
      required: true,
      tooltip: "Toggle to add address fields",
    },
    {
      name: "street",
      displayName: "Street",
      type: "string",
      defaultValue: "",
      required: false,
      parents: {
        hasAddress: ["true"],
      },
    },
    {
      name: "city",
      displayName: "City",
      type: "string",
      defaultValue: "",
      required: false,
      parents: {
        hasAddress: ["true"],
      },
    },
  ],
};

export default conditionalAddress;
