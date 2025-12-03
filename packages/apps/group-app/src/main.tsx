// Group Support Test App
// This app demonstrates the use of field groups to organize form fields
// logically. Groups help structure complex forms by categorizing related
// fields together (e.g., "Personal Information", "Contact Details", "Preferences").
import { createRoot } from "react-dom/client";
import { ReactaForm } from "reactaform";
import "./style.css";

const testDefinition = {
  "name": "userProfile",
  "displayName": "User Profile",
  "version": "1.0.0",
  "properties": [
    {
      "type": "text",
      "name": "firstName",
      "displayName": "First Name",
      "defaultValue": "",
      "required": true,
      "group": "Personal"
    },
    {
      "type": "text",
      "name": "lastName",
      "displayName": "Last Name",
      "defaultValue": "",
      "required": true,
      "group": "Personal"
    },
    {
      "type": "date",
      "name": "birthDate",
      "displayName": "Date of Birth",
      "defaultValue": "",
      "group": "Personal"
    },
    {
      "type": "email",
      "name": "email",
      "displayName": "Email Address",
      "defaultValue": "",
      "required": true,
      "group": "Contact"
    },
    {
      "type": "phone",
      "name": "phone",
      "displayName": "Phone Number",
      "defaultValue": "",
      "group": "Contact"
    },
    {
      "type": "text",
      "name": "address",
      "displayName": "Street Address",
      "defaultValue": "",
      "group": "Contact"
    },
    {
      "type": "switch",
      "name": "newsletter",
      "displayName": "Subscribe to Newsletter",
      "defaultValue": false,
      "group": "Preferences"
    },
    {
      "type": "dropdown",
      "name": "theme",
      "displayName": "Preferred Theme",
      "defaultValue": "light",
      "options": [
        { "label": "Light", "value": "light" },
        { "label": "Dark", "value": "dark" },
        { "label": "Auto", "value": "auto" }
      ],
      "group": "Preferences"
    },
    {
      "type": "multiselection",
      "name": "interests",
      "displayName": "Interests",
      "defaultValue": [],
      "options": [
        { "label": "Technology", "value": "tech" },
        { "label": "Sports", "value": "sports" },
        { "label": "Music", "value": "music" },
        { "label": "Travel", "value": "travel" },
        { "label": "Reading", "value": "reading" }
      ],
      "group": "Preferences"
    },
    {
      "type": "multiline",
      "name": "bio",
      "displayName": "Bio",
      "defaultValue": "",
      "group": "About",
      "labelLayout": "column-left"
    }
  ],
  "groups": [
    {
      "name": "personal",
      "displayName": "Personal Information",
      "collapsed": false
    },
    {
      "name": "contact",
      "displayName": "Contact Details",
      "collapsed": false
    },
    {
      "name": "preferences",
      "displayName": "Preferences",
      "collapsed": false
    },
    {
      "name": "about",
      "displayName": "About You",
      "collapsed": false
    }
  ]
};

export default function App() {
  return (
    <div className={`app`}>
      <h2>Reactaform Group Example</h2>
      <ReactaForm
        definitionData={{
          ...testDefinition,
          // Use the preset handler for demo purposes
          submitHandlerName: "Preset_AlertSubmitHandler",
        }}
        style={{ height: "100%" }}
      />
    </div>
  );
}

const container = document.getElementById("root");
if (container) createRoot(container).render(<App />);
