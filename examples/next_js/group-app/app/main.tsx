"use client";

import { ReactaForm } from "reactaform";
import "./style.css";

const testDefinition = {
  name: "userProfile",
  displayName: "User Profile",
  version: "1.0.0",
  properties: [
    { type: "text", name: "firstName", displayName: "First Name", defaultValue: "", required: true, group: "Personal" },
    { type: "text", name: "lastName", displayName: "Last Name", defaultValue: "", required: true, group: "Personal" },
    { type: "date", name: "birthDate", displayName: "Date of Birth", defaultValue: "", group: "Personal" },
    { type: "email", name: "email", displayName: "Email Address", defaultValue: "", required: true, group: "Contact" },
    { type: "phone", name: "phone", displayName: "Phone Number", defaultValue: "", group: "Contact" },
    { type: "text", name: "address", displayName: "Address", defaultValue: "", group: "Contact" }
  ]
};

const predefined_instance = {
  name: "groupExampleInstance",
  version: "1.0.0",
  definition: "userProfile",
  values: {
    firstName: "John",
    lastName: "Smith",
    birthDate: "2000-12-08",
    email: "abcdefg@sample.com",
    phone: "",
    address: ""
  }
};

export default function App() {
  const instance = predefined_instance;
  return (
    <div className={`app`}>
      <h2>Reactaform Group Example</h2>
      <ReactaForm definitionData={{ ...testDefinition }} instance={instance} style={{ height: "100%" }} />
    </div>
  );
}
