import type { ReactaDefinition } from "../core/reactaFormTypes";

const optionsAndParents: ReactaDefinition = {
  name: "optionsAndParents",
  version: "1.0",
  displayName: "Options & Parents Demo",
  properties: [
    {
      name: "country",
      displayName: "Country",
      type: "dropdown",
      defaultValue: "US",
      options: [
        { label: "United States", value: "US" },
        { label: "Canada", value: "CA" },
      ],
    },
    {
      name: "state",
      displayName: "State / Province",
      type: "dropdown",
      defaultValue: "",
      parents: {
        country: ["US", "CA"],
      },
      options: [
        { label: "California", value: "CA" },
        { label: "Ontario", value: "ON" },
      ],
    },
    {
      name: "zipcode",
      displayName: "Zip / Postal Code",
      type: "string",
      defaultValue: "",
      parents: {
        country: ["US"],
      },
    },
  ],
};

export default optionsAndParents;
