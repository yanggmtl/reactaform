import React from 'react';
import { createRoot } from 'react-dom/client';
import { ReactaForm } from 'reactaform';
import './style.css';

const testDefinition = {
  name: "customer",
  displayName: "Customer",
  version: "1.0.0",
  properties: [
    {
      type: "text",
      name: "name",
      displayName: "Name",
      defaultValue: "",
      required: true,
    },
    {
      type: "dropdown",
      name: "country",
      displayName: "Country",
      defaultValue: "US",
      options: [
        { label: "United States", value: "US" },
        { label: "Canada", value: "CA" },
      ],
    },
    {
      type: "dropdown",
      name: "state",
      displayName: "State",
      defaultValue: "",
      options: [
        { label: "Alaska", value: "AK " },
        { label: "California", value: "CA" },
        { label: "New York", value: "NY" },
      ],
      parents: { country: ["US"] },
    },
    {
      type: "dropdown",
      name: "province",
      displayName: "Province",
      defaultValue: "",
      options: [
        { label: "British Columbia", value: "BC" },
        { label: "Ontario", value: "ON" },
        { label: "Quebec", value: "QC" },
      ],
      parents: { country: ["CA"] },
    },
  ],
};

const predefined_instance = {
  name: "parentsExampleInstance",
  version: "1.0.0",
  definition: "customer",
  values: {
    name: "John Doe",
    country: "CA",
    province: "ON",
  },
};

export default function App() {
  return (
    <div className={`app`}>
      <h2>Reactaform Parents Example</h2>
      <ReactaForm definitionData={{ ...testDefinition }} instance={predefined_instance} />
    </div>
  );
}

const container = document.getElementById('root');
if (container) createRoot(container).render(<App />);
