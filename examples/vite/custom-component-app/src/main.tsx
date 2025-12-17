import { createRoot } from "react-dom/client";
import Point2DInput from "./Point2DInput";
import { ReactaForm, registerComponent } from "reactaform";
import type { ReactaDefinition } from "reactaform";
import "./style.css";

const def: ReactaDefinition = {
  name: "point2dDemo",
  displayName: "Point2D Custom Component Demo",
  version: "1.0.0",
  properties: [
    {
      type: "point2d",
      name: "position",
      displayName: "Position",
      defaultValue: ['0', '0'],
      required: true,
      // layout will place the two inputs in one row via the custom component
    }
  ]
};

const instance = {
  name: 'pos1',
  version: '1.0.0',
  definition: 'point2dDemo',
  values: {
    position: ['10', '20a']
  }
};

// Register the custom component under type 'point2d'
registerComponent("point2d", Point2DInput);

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
