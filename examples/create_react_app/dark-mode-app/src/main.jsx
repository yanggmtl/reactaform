import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ReactaForm } from 'reactaform';
import './style.css';

const darkModeDefinition = {
  name: 'darkForm',
  version: '1.0.0',
  displayName: 'Dark Mode Form',
  properties: [
    { name: 'firstName', displayName: 'First Name', type: 'string', defaultValue: '' },
    { name: 'age', displayName: 'Age', type: 'int', defaultValue: 30 },
    { name: 'subscribe', displayName: 'Subscribe to newsletter', type: 'checkbox', defaultValue: false },
  ],
};

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`app`}>
      <h1>Dark Mode Example</h1>

      <div style={{ marginBottom: '10px' }}>
        <label>
          <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />{' '}
          Dark mode
        </label>
      </div>
      <ReactaForm definitionData={{ ...darkModeDefinition }} theme={darkMode ? 'dark' : 'light'} />
    </div>
  );
}

const container = document.getElementById('root');
if (container) createRoot(container).render(<App />);
