# Plugin Conflict Resolution

When working with multiple plugins, conflicts can occur when different plugins try to register the same component, validator, or handler. ReactaForm provides a flexible conflict resolution system to handle these scenarios.

## Conflict Types

Conflicts can occur for:
- **Components**: Two plugins register a component with the same type name
- **Field Validators**: Two plugins register a field validator with the same category and name
- **Form Validators**: Two plugins register a form validator with the same name
- **Submission Handlers**: Two plugins register a submission handler with the same name
- **Plugin**: Attempting to register the same plugin twice

## Resolution Strategies

ReactaForm supports four conflict resolution strategies:

### 1. `'error'` (default)
Throws an error when a conflict is detected. This ensures no accidental overwrites.

```typescript
import { registerPlugin } from 'reactaform';
import myPlugin from './myPlugin';

// This will throw if any conflicts exist
registerPlugin(myPlugin);
// or explicitly:
registerPlugin(myPlugin, { conflictResolution: 'error' });
```

**Error example:**
```
Error: Plugin conflict: "MyPlugin" tried to register component "Point2D" 
already registered by "GeometryPlugin"
```

### 2. `'warn'`
Logs a warning to the console and skips registration of conflicting items. The original registration is preserved.

```typescript
registerPlugin(myPlugin, { conflictResolution: 'warn' });
```

**Console output:**
```
Warning: Plugin conflict: "MyPlugin" tried to register component "Point2D" 
already registered by "GeometryPlugin". Skipping registration.
```

### 3. `'override'`
Replaces the existing registration with the new one. Logs an info message to the console.

```typescript
registerPlugin(myPlugin, { conflictResolution: 'override' });
```

**Console output:**
```
Info: Plugin "MyPlugin" is overriding component "Point2D" 
previously registered by "GeometryPlugin"
```

### 4. `'skip'`
Silently skips registration of conflicting items without logging. The original registration is preserved.

```typescript
registerPlugin(myPlugin, { conflictResolution: 'skip' });
```

## Custom Conflict Handler

For more advanced scenarios, you can provide a custom conflict handler that will be called for each conflict detected:

```typescript
registerPlugin(myPlugin, {
  conflictResolution: 'override',
  onConflict: (conflict) => {
    console.log(`Conflict detected:`, conflict);
    // conflict.type: 'component' | 'fieldValidator' | 'formValidator' | 'submissionHandler' | 'plugin'
    // conflict.name: the name/type of the conflicting item
    // conflict.existingPlugin: name of plugin that registered it first
    // conflict.newPlugin: name of plugin trying to register it now
    
    // You could send this to analytics, log it, etc.
  }
});
```

## Conflict Detection Details

### Components
Conflicts are detected by component type name:
```typescript
const plugin1 = {
  name: 'Plugin1',
  version: '1.0.0',
  components: {
    'Point2D': Point2DComponent  // ← conflict on this type name
  }
};

const plugin2 = {
  name: 'Plugin2',
  version: '1.0.0',
  components: {
    'Point2D': AnotherPoint2DComponent  // ← conflict on this type name
  }
};
```

### Field Validators
Conflicts are detected by category + validator name combination:
```typescript
const plugin1 = {
  name: 'Plugin1',
  version: '1.0.0',
  fieldValidators: {
    'geometry': {
      'required': requiredValidator  // ← conflict on geometry:required
    }
  }
};

const plugin2 = {
  name: 'Plugin2',
  version: '1.0.0',
  fieldValidators: {
    'geometry': {
      'required': anotherRequiredValidator  // ← conflict on geometry:required
    }
  }
};
```

### Form Validators & Submission Handlers
Conflicts are detected by name:
```typescript
const plugin1 = {
  name: 'Plugin1',
  version: '1.0.0',
  formValidators: {
    'validateGeometry': validator1  // ← conflict on this name
  },
  submissionHandlers: {
    'saveToServer': handler1  // ← conflict on this name
  }
};
```

## Ownership Tracking

ReactaForm tracks which plugin registered each component, validator, and handler. This information is used to:
1. Detect conflicts accurately
2. Provide meaningful error/warning messages
3. Enable the override strategy to work correctly

You can check if a plugin is registered:
```typescript
import { hasPlugin, getPlugin } from 'reactaform';

if (hasPlugin('GeometryPlugin')) {
  const plugin = getPlugin('GeometryPlugin');
  console.log(`GeometryPlugin v${plugin.version} is installed`);
}
```

## Best Practices

1. **Use unique names**: Avoid conflicts by using descriptive, unique component type names. Consider prefixing with your plugin name:
   ```typescript
   components: {
     'mycompany-Point2D': MyPoint2DComponent,
     'mycompany-Point3D': MyPoint3DComponent
   }
   ```

2. **Document conflicts**: If your plugin intentionally overrides built-in components, document this clearly.

3. **Test with multiple plugins**: Test your app with various plugin combinations to ensure conflicts are handled gracefully.

4. **Version check before override**: Use the custom conflict handler to check versions before allowing overrides:
   ```typescript
   registerPlugin(newPlugin, {
     conflictResolution: 'override',
     onConflict: (conflict) => {
       const existing = getPlugin(conflict.existingPlugin);
       const newer = getPlugin(conflict.newPlugin);
       if (existing && newer && existing.version > newer.version) {
         console.warn(`Overriding newer version ${existing.version} with ${newer.version}`);
       }
     }
   });
   ```

5. **Choose the right strategy**:
   - Development: use `'error'` to catch issues early
   - Production with known plugin order: use `'warn'` or `'skip'`
   - Theme/skin plugins: use `'override'` to replace default components
   - Plugin marketplace: provide UI for users to choose conflict resolution

## Example: Safe Plugin Loading

Here's a pattern for safely loading multiple plugins:

```typescript
import { registerPlugin } from 'reactaform';
import basePlugin from './plugins/base';
import geometryPlugin from './plugins/geometry';
import customTheme from './plugins/customTheme';

// Load plugins in order with appropriate strategies
try {
  // Base plugin: error on conflicts (should be loaded first)
  registerPlugin(basePlugin, { conflictResolution: 'error' });
  
  // Geometry plugin: warn on conflicts but continue
  registerPlugin(geometryPlugin, { conflictResolution: 'warn' });
  
  // Theme plugin: override to replace default components
  registerPlugin(customTheme, { 
    conflictResolution: 'override',
    onConflict: (conflict) => {
      console.log(`Theme overriding ${conflict.type}: ${conflict.name}`);
    }
  });
  
  console.log('All plugins loaded successfully');
} catch (error) {
  console.error('Plugin loading failed:', error);
}
```

## Unregistering Plugins

To remove a plugin (note: this does not automatically unregister its components/validators/handlers):

```typescript
import { unregisterPlugin } from 'reactaform';

if (unregisterPlugin('MyPlugin')) {
  console.log('Plugin removed');
}
```

The cleanup hook will be called if the plugin defined one:
```typescript
const myPlugin = {
  name: 'MyPlugin',
  version: '1.0.0',
  components: { /* ... */ },
  cleanup: () => {
    console.log('Cleaning up MyPlugin resources');
    // Cleanup logic here
  }
};
```
