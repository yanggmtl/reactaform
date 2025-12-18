# Plugin System Quick Start

## Simple Example

Instead of registering components individually:

```typescript
// ❌ Old way - manual registration
import { registerComponent } from 'reactaform';
import Point2DInput from './Point2DInput';
import Point3DInput from './Point3DInput';

registerComponent("point2d", Point2DInput);
registerComponent("point3d", Point3DInput);
```

Bundle them as a plugin:

```typescript
// ✅ New way - plugin
import { registerPlugin } from 'reactaform';
import pointPlugin from './pointPlugin';

registerPlugin(pointPlugin);
```

## Complete Working Example

### 1. Create the Plugin (`pointPlugin.ts`)

```typescript
import type { ReactaFormPlugin } from 'reactaform';
import Point2DInput from './Point2DInput';
import Point3DInput from './Point3DInput';

const pointPlugin: ReactaFormPlugin = {
  name: 'point-components',
  version: '1.0.0',
  description: 'Point input components',
  
  components: {
    point2d: Point2DInput,
    point3d: Point3DInput,
  },
  
  fieldValidators: {
    'custom': {
      'point-numeric': (value) => {
        if (!Array.isArray(value)) return 'Must be an array';
        for (const coord of value) {
          if (isNaN(Number(coord))) {
            return 'All coordinates must be numeric';
          }
        }
        return null;
      },
    },
  },
  
  setup() {
    console.log('[PointPlugin] Registered');
  },
};

export default pointPlugin;
```

### 2. Use the Plugin in Your App

```typescript
import { ReactaForm, registerPlugin } from 'reactaform';
import pointPlugin from './pointPlugin';

// Register once at app startup
registerPlugin(pointPlugin);

function App() {
  return <ReactaForm definitionData={def} instance={instance} />;
}
```

That's it! All components from the plugin are now available.

## Publishing as NPM Package

### Package Structure
```
my-reactaform-plugin/
├── src/
│   ├── index.ts           # Export plugin
│   ├── myPlugin.ts        # Plugin definition
│   └── components/        # Your components
├── package.json
└── tsconfig.json
```

### `package.json`
```json
{
  "name": "reactaform-plugin-charts",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "reactaform": ">=1.3.0",
    "react": ">=18.0.0"
  }
}
```

### `src/index.ts`
```typescript
export { default } from './myPlugin';
export { default as ChartInput } from './components/ChartInput';
```

### Usage
```bash
npm install reactaform-plugin-charts
```

```typescript
import { registerPlugin } from 'reactaform';
import chartPlugin from 'reactaform-plugin-charts';

registerPlugin(chartPlugin);
```

## See Also
- Full documentation: [PLUGIN_SYSTEM.md](./PLUGIN_SYSTEM.md)
- Example: `/examples/vite/custom-component-app/src/pointPlugin.ts`
