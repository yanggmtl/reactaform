// Custom Styles App: demonstrates applying a custom class that overrides
// ReactaForm CSS variables to change background and text color.
// Check out style.css for the custom styles applied.
import { createRoot } from 'react-dom/client';
import { ReactaForm } from 'reactaform';
import './style.css';

const definition = {
  name: 'custom_styles_demo',
  version: '1.0.0',
  displayName: 'Custom Styles Demo',
  properties: [
    { name: 'height', displayName: 'Height', type: 'int', defaultValue: 170 },
    { name: 'weight', displayName: 'Weight', type: 'int', defaultValue: 65 },
  ],
};

export default function App() {
  return (
    <div className="demo-wrap">
      <h2 style={{ marginTop: 0 }}>Reactaform - Custom Styles</h2>

      {/* Apply both classes so the component still receives base styles */}
      <div className="reactaform custom-reactaform">
        <ReactaForm definitionData={definition} />
      </div>
    </div>
  );
}

const container = document.getElementById("root");
if (container) createRoot(container).render(<App />);

