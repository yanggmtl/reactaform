// Custom Styles App: demonstrates applying a custom class that overrides
// ReactaForm CSS variables to change background and text color.
// Check out style.css for the custom styles applied.
import { createRoot } from "react-dom/client";
import { ReactaForm } from "reactaform";
import "./style.css";

import "reactaform/themes/ant-design.css";
import "reactaform/themes/ant-design-dark.css";
import "reactaform/themes/blueprint.css";
import "reactaform/themes/blueprint-dark.css";
import "reactaform/themes/fluent.css";
import "reactaform/themes/glass-morphism.css";
import "reactaform/themes/high-contrast-accessible.css";
import "reactaform/themes/ios-mobile.css";
import "reactaform/themes/macos-native.css";
import "reactaform/themes/material.css";
import "reactaform/themes/material-dark.css";
import "reactaform/themes/neon-cyber-dark.css";
import "reactaform/themes/shadcn.css";
import "reactaform/themes/modern-light.css";
import "reactaform/themes/midnight-dark.css";
import "reactaform/themes/soft-pastel.css";
import "reactaform/themes/tailwind.css";
import "reactaform/themes/tailwind-dark.css";
import "reactaform/themes/compact-variant.css";
import "reactaform/themes/spacious-variant.css";

import { useState } from "react";

const definition = {
  name: "custom_styles_demo",
  version: "1.0.0",
  displayName: "Custom Styles Demo",
  properties: [
    {
      name: "height",
      displayName: "Height",
      type: "int",
      defaultValue: 170,
      tooltip: "Enter your height in centimeters",
    },
    { name: "weight", displayName: "Weight", type: "int", defaultValue: 65 },
    {
      name: "resume",
      displayName: "Resume",
      type: "file",
      defaultValue: "",
      multiple: true,
    },
    {
      name: "password",
      displayName: "Password",
      type: "password",
      defaultValue: "",
    },
  ],
};

const themeMap: Record<string, string> = {
  "Light - default": "light",
  "Dark - default": "dark",
  "Ant Design": "antd",
  "Ant Design Dark": "antd-dark",
  Blueprint: "blueprint",
  "Blueprint Dark": "blueprint-dark",
  Fluent: "fluent",
  Glassmorphism: "glassmorphism",
  "High Contrast Accessible": "accessible",
  iOS: "ios",
  "macOS Native": "macos",
  Material: "material",
  "Material Dark": "material-dark",
  "Midnight Blue": "midnight-dark",
  "Modern Light": "modern-light",
  "Neon Cyber": "cyber",
  Shadcn: "shadcn",
  "Soft Pastel": "pastel",
  Tailwind: "tailwind",
  "Tailwind Dark": "tailwind-dark",
};

const variantOptions: Record<string, string> = {
  Normal: "normal",
  Compact: "compact",
  "Spacious / Comfortable": "spacious",
};

export default function App() {
  const [theme, setTheme] = useState("Light - default");
  const [variant, setVariant] = useState("Normal");

  const variantString = variant === "Normal" ? "" : variantOptions[variant];

  return (
    <div className="demo-wrap">
      <h2 style={{ marginTop: 0 }}>Reactaform - Custom Styles</h2>

      <div style={{ marginBottom: "10px" }}>
        <label>
          Select Theme{" "}
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            {Object.keys(themeMap).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>
          Select Size{" "}
          <select value={variant} onChange={(e) => setVariant(e.target.value)}>
            {Object.keys(variantOptions).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>
      </div>
      {/* Apply both classes so the component still receives base styles */}
      <div
        className="reactaform"
        data-reactaform-theme={themeMap[theme]}
        data-reactaform-size={variantString}
      >
        <ReactaForm definitionData={definition} />
      </div>
    </div>
  );
}

const container = document.getElementById("root");
if (container) createRoot(container).render(<App />);
