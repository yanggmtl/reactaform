import { createRoot } from "react-dom/client";
import { PointPlugin } from "./PointPlugin";
import { getPlugin, ReactaForm, registerPlugin } from "reactaform";
import type { ReactaDefinition } from "reactaform";
import "./style.css";

const def: ReactaDefinition = {
  name: "point2d3dDemo",
  displayName: "Point 2D/3D Custom Component Demo",
  version: "1.0.0",
  validationHandlerName: "regionValidator",
  submitHandlerName: "alertSubmission",
  properties: [
    {
      type: "point2d",
      name: "pos2d_1",
      displayName: "Top Left Position",
      defaultValue: ['0', '0'],
      required: true,
    },
    {
      type: "point2d",
      name: "pos2d_2",
      displayName: "Bottom Right Position",
      defaultValue: ['10', '10'],
      required: true,
    },
    {
      type: "point3d",
      name: "pos3d",
      displayName: "3D Position",
      defaultValue: ['0', '0', '0'],
      required: true,
      validationHandlerName: ["point", "positivePosition"],
      tooltip: "Enter a 3D point as X, Y, Z coordinates",
    }
  ]
};

const instance = {
  name: 'pos1',
  version: '1.0.0',
  definition: 'point2dDemo',
  values: {
    pos2d: ['10', '20'],
    pos3d: ['5', '15', '35'],
  }
};

registerPlugin(PointPlugin, {conflictResolution: 'skip'});

export default function App() {
  return (
    <div className="app">
      <h2>Custom Component: Point2D</h2>
      <ReactaForm definitionData={def} instance={instance} />
    </div>
  );
}

const container = document.getElementById("root");
if (container) createRoot(container).render(<App />);
