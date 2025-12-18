# ReactaForm Plugin System

The plugin system allows you to bundle multiple components, validators, and handlers into a single reusable package.

## Quick Links

- [Quick Start Guide](./PLUGIN_QUICK_START.md) - Get started in 5 minutes
- [Conflict Resolution Guide](./PLUGIN_CONFLICT_RESOLUTION.md) - Handle conflicts between plugins
- [API Reference](#api-reference) - Full API documentation

## Creating a Plugin

```typescript
import type { ReactaFormPlugin } from 'reactaform';
import MyCustomInput from './MyCustomInput';
import AnotherInput from './AnotherInput';

const myPlugin: ReactaFormPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'My custom components plugin',
  
  // Register multiple components
  components: {
    'custom-type': MyCustomInput,
    'another-type': AnotherInput,
  },
  
  // Optional: Register field validators (organized by category)
  fieldValidators: {
    'custom': {
      'my-validator': (value, field, context) => {
        // Validation logic
        return value ? null : 'Value required';
      },
    },
  },
  
  // Optional: Register form validators
  formValidators: {
    'my-form-validator': (values, definition, context) => {
      // Form-level validation
      return {};
    },
  },
  
  // Optional: Register submission handlers
  submissionHandlers: {
    'my-handler': async (values, definition, context) => {
      // Handle form submission
      console.log('Submitted:', values);
    },
  },
  
  // Optional: Run code when plugin is registered
  setup() {
    console.log('Plugin initialized');
  },
  
  // Optional: Cleanup when plugin is unregistered
  cleanup() {
    console.log('Plugin cleanup');
  },
};

export default myPlugin;
```

## Using a Plugin

### Single Plugin

```typescript
import { registerPlugin } from 'reactaform';
import myPlugin from './myPlugin';

// Register the plugin (registers all components, validators, etc.)
registerPlugin(myPlugin);
```

### Multiple Plugins

```typescript
import { registerPlugin } from 'reactaform';
import pointPlugin from './plugins/pointPlugin';
import chartPlugin from './plugins/chartPlugin';

registerPlugin(pointPlugin);
registerPlugin(chartPlugin);
```

**Note:** If plugins have conflicting registrations (e.g., both register a component with the same type), you'll need to use [conflict resolution strategies](./PLUGIN_CONFLICT_RESOLUTION.md):

```typescript
// Override existing registrations
registerPlugin(chartPlugin, { conflictResolution: 'override' });

// Or warn and skip conflicts
registerPlugin(chartPlugin, { conflictResolution: 'warn' });
```

See the [Conflict Resolution Guide](./PLUGIN_CONFLICT_RESOLUTION.md) for details.

## Plugin Management

```typescript
import { 
  registerPlugin,
  unregisterPlugin,
  getPlugin,
  getAllPlugins,
  hasPlugin 
} from 'reactaform';

// Register a plugin
registerPlugin(myPlugin);

// Check if plugin is registered
if (hasPlugin('my-plugin')) {
  console.log('Plugin is registered');
}

// Get plugin details
const plugin = getPlugin('my-plugin');

// Get all registered plugins
const allPlugins = getAllPlugins();

// Unregister a plugin (calls cleanup if defined)
unregisterPlugin('my-plugin');
```

## Bulk Component Registration

If you only need to register components without validators or handlers:

```typescript
import { registerComponents } from 'reactaform';

registerComponents({
  'type1': Component1,
  'type2': Component2,
  'type3': Component3,
});
```

## Example: Point Components Plugin

See `/examples/vite/custom-component-app/src/pointPlugin.ts` for a complete example that bundles Point2D and Point3D components.

## Publishing Plugins

To publish a plugin as an npm package:

1. Create a package with your plugin:
```json
{
  "name": "reactaform-plugin-points",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "reactaform": ">=1.3.0",
    "react": ">=18.0.0"
  }
}
```

2. Export your plugin:
```typescript
// src/index.ts
export { default as pointPlugin } from './pointPlugin';
export { default as Point2DInput } from './Point2DInput';
export { default as Point3DInput } from './Point3DInput';
```

3. Users can install and use it:
```bash
npm install reactaform-plugin-points
```

```typescript
import { registerPlugin } from 'reactaform';
import { pointPlugin } from 'reactaform-plugin-points';

registerPlugin(pointPlugin);
```

## Benefits

- **Reusability**: Bundle related components together
- **Distribution**: Easy to share via npm packages
- **Organization**: Keep plugin code separate from main app
- **Initialization**: Setup/cleanup hooks for plugin lifecycle
- **Type Safety**: Full TypeScript support
