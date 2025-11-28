import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ReactaForm, serializeInstance, deserializeInstance } from 'reactaform'
import type { FieldValueType } from 'reactaform'
import './style.css'

const exampleDefinition = {
  name: 'example-form',
  version: '1.0.0',
  displayName: 'Example Form',
  localization: "example-form",
  properties: [
    {
      name: 'firstName',
      displayName: 'First Name',
      type: 'string',
      defaultValue: ''
    },
    {
      name: 'age',
      displayName: 'Age',
      type: 'int',
      defaultValue: 30
    },
    {
      name: 'subscribe',
      displayName: 'Subscribe to newsletter',
      type: 'checkbox',
      defaultValue: false
    }
  ]
}

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState('en')
  const [instance, setInstance] = useState<Record<string, FieldValueType>>({})
  const [serialized, setSerialized] = useState<string>('')

  const prefill = () => {
    const data: Record<string, FieldValueType> = { firstName: 'Ada', age: 28, subscribe: true }
    setInstance(data)
    const res = serializeInstance(data)
    setSerialized(res.success ? (res.data ?? '') : `// error: ${res.error ?? 'unknown'}`)
  }

  const clear = () => {
    setInstance({})
    setSerialized('')
  }

  const onSerialize = () => {
    const res = serializeInstance(instance)
    setSerialized(res.success ? (res.data ?? '') : `// error: ${res.error ?? 'unknown'}`)
  }

  const onDeserialize = () => {
    const res = deserializeInstance(serialized)
    if (res.success && res.data) {
      setInstance(res.data as Record<string, FieldValueType>)
    }
  }

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`} data-reactaform-theme={darkMode ? 'dark' : 'light'}>
      <h1>Reactaform Example</h1>

      <div className="controls">
        <div className="panel">
          <label>
            <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />{' '}
            Dark mode
          </label>
        </div>

        <div className="panel">
          <label>
            Language:{' '}
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </label>
        </div>

        <div className="panel">
          <button onClick={prefill}>Prefill</button>{' '}
          <button onClick={clear}>Clear</button>{' '}
          <button onClick={onSerialize}>Serialize</button>{' '}
          <button onClick={onDeserialize}>Deserialize</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <ReactaForm
            definitionData={exampleDefinition}
            language={language}
            darkMode={darkMode}
            instance={instance}
            style={{ maxWidth: 640 }}
          />
        </div>

        <div style={{ width: 320 }}>
          <div className="panel">
            <div><strong>Instance (JSON)</strong></div>
            <textarea
              className="instanceArea"
              value={serialized || JSON.stringify(instance, null, 2)}
              onChange={(e) => setSerialized(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
