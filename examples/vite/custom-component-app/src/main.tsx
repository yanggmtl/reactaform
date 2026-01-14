import { createRoot } from "react-dom/client";
import Point2DInput from "./Point2DInput";
import Point3DInput from "./Point3DInput";
import { ReactaForm, registerComponent } from "reactaform";
import "./style.css";

const def: Record<string, unknown> = {
  name: "point2d3dDemo",
  displayName: "Point 2D/3D Custom Component Demo",
  version: "1.0.0",
  properties: [
    {
      type: "point2d",
      name: "pos2d",
      displayName: "2D Position",
      defaultValue: ['0', '0'],
      required: true,
    },
    {
      type: "point3d",
      name: "pos3d",
      displayName: "3D Position",
      defaultValue: ['0', '0', '0'],
      required: true,
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
    pos3d: ['5', '15', '25'],
  }
};

// Register the custom component under type 'point2d'
registerComponent("point2d", Point2DInput);
registerComponent("point3d", Point3DInput);

export default function App() {
  return (
    <div className="app">
      <h2>Custom Component: Point2D and Point3D</h2>
      <ReactaForm definitionData={def} instance={instance} />
    </div>
  );
}

const container = document.getElementById("root");
if (container) createRoot(container).render(<App />);
