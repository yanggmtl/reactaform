/**
 * Plugin Registry for ReactaForm
 * Allows bundling and registering multiple components, validators, and handlers as a single plugin
 */

import { registerComponent, getComponent } from './componentRegistry';
import { registerFieldValidationHandler, registerFormValidationHandler, getFieldValidationHandler, getFormValidationHandler } from './validationHandlerRegistry';
import { registerSubmissionHandler, getSubmissionHandler } from './submissionHandlerRegistry';
import type { FieldValidationHandler, FormValidationHandler, FormSubmissionHandler } from '../reactaFormTypes';

/**
 * Strategy for handling conflicts when registering plugins
 */
export type ConflictResolution = 
  | 'error'     // Throw error on conflict (default)
  | 'warn'      // Log warning and skip conflicting items
  | 'override'  // Override existing registrations
  | 'skip';     // Silently skip conflicting items

/**
 * Options for plugin registration
 */
export interface PluginRegistrationOptions {
  /** How to handle conflicts with existing registrations */
  conflictResolution?: ConflictResolution;
  
  /** Custom conflict handler - return true to proceed with registration */
  onConflict?: (conflict: PluginConflict) => boolean;
}

/**
 * Information about a registration conflict
 */
export interface PluginConflict {
  type: 'component' | 'fieldValidator' | 'formValidator' | 'submissionHandler' | 'plugin';
  name: string;
  existingPlugin: string;
  newPlugin: string;
}

/**
 * Plugin definition interface
 */
export interface ReactaFormPlugin {
  /** Unique plugin identifier */
  name: string;
  
  /** Plugin version */
  version: string;
  
  /** Optional plugin description */
  description?: string;
  
  /** Components to register (field type -> component mapping) */
  components?: Record<string, unknown>;
  
  /** Field validation handlers to register (category -> {name -> handler} mapping) */
  fieldValidators?: Record<string, Record<string, FieldValidationHandler>>;
  
  /** Form validation handlers to register */
  formValidators?: Record<string, FormValidationHandler>;
  
  /** Submission handlers to register */
  submissionHandlers?: Record<string, FormSubmissionHandler>;
  
  /** Optional setup function called when plugin is registered */
  setup?: () => void;
  
  /** Optional cleanup function */
  cleanup?: () => void;
}

/**
 * Registry to track installed plugins
 */
const installedPlugins = new Map<string, ReactaFormPlugin>();

/**
 * Track which plugin registered what
 */
const registrationOwnership = {
  components: new Map<string, string>(),
  fieldValidators: new Map<string, string>(),
  formValidators: new Map<string, string>(),
  submissionHandlers: new Map<string, string>(),
};

/**
 * Determine if an item should be registered based on conflict resolution strategy
 */
function shouldRegister(
  conflict: PluginConflict | null,
  strategy: ConflictResolution,
  onConflict?: (conflict: PluginConflict) => void
): boolean {
  if (!conflict) return true;

  if (onConflict) {
    onConflict(conflict);
  }

  switch (strategy) {
    case 'error':
      throw new Error(
        `Plugin conflict: "${conflict.newPlugin}" tried to register ${conflict.type} "${conflict.name}" ` +
        `already registered by "${conflict.existingPlugin}"`
      );
    case 'warn':
      console.warn(
        `Plugin conflict: "${conflict.newPlugin}" tried to register ${conflict.type} "${conflict.name}" ` +
        `already registered by "${conflict.existingPlugin}". Skipping registration.`
      );
      return false;
    case 'override':
      console.info(
        `Plugin "${conflict.newPlugin}" is overriding ${conflict.type} "${conflict.name}" ` +
        `previously registered by "${conflict.existingPlugin}"`
      );
      return true;
    case 'skip':
      return false;
  }
}

/**
 * Handle conflicts for plugin registrations
 */
function handleConflicts(
  plugin: ReactaFormPlugin,
): PluginConflict[] {
  const conflicts: PluginConflict[] = [];

  // Check component conflicts
  if (plugin.components) {
    for (const [type, _component] of Object.entries(plugin.components)) {
      void _component;
      const existingComponent = getComponent(type);
      if (existingComponent) {
        const existingPlugin = registrationOwnership.components.get(type);
        if (existingPlugin && existingPlugin !== plugin.name) {
          conflicts.push({
            type: 'component',
            name: type,
            existingPlugin,
            newPlugin: plugin.name,
          });
        }
      }
    }
  }

  // Check field validator conflicts
  if (plugin.fieldValidators) {
    for (const [category, validators] of Object.entries(plugin.fieldValidators)) {
      for (const [name, _handler] of Object.entries(validators)) {
        void _handler;
        const existingHandler = getFieldValidationHandler(category, name);
        if (existingHandler) {
          const key = `${category}:${name}`;
          const existingPlugin = registrationOwnership.fieldValidators.get(key);
          if (existingPlugin && existingPlugin !== plugin.name) {
            conflicts.push({
              type: 'fieldValidator',
              name: key,
              existingPlugin,
              newPlugin: plugin.name,
            });
          }
        }
      }
    }
  }

  // Check form validator conflicts
  if (plugin.formValidators) {
    for (const [name, _handler] of Object.entries(plugin.formValidators)) {
      void _handler;
      const existingHandler = getFormValidationHandler(name);
      if (existingHandler) {
        const existingPlugin = registrationOwnership.formValidators.get(name);
        if (existingPlugin && existingPlugin !== plugin.name) {
          conflicts.push({
            type: 'formValidator',
            name,
            existingPlugin,
            newPlugin: plugin.name,
          });
        }
      }
    }
  }

  // Check submission handler conflicts
  if (plugin.submissionHandlers) {
    for (const [name, _handler] of Object.entries(plugin.submissionHandlers)) {
      void _handler;
      const existingHandler = getSubmissionHandler(name);
      if (existingHandler) {
        const existingPlugin = registrationOwnership.submissionHandlers.get(name);
        if (existingPlugin && existingPlugin !== plugin.name) {
          conflicts.push({
            type: 'submissionHandler',
            name,
            existingPlugin,
            newPlugin: plugin.name,
          });
        }
      }
    }
  }

  return conflicts;
}

/**
 * Register a ReactaForm plugin
 * @param plugin - Plugin definition
 * @param options - Registration options including conflict resolution strategy
 * @throws Error if plugin with same name is already registered (when conflictResolution is 'error')
 */
export function registerPlugin(
  plugin: ReactaFormPlugin,
  options?: PluginRegistrationOptions
): void {
  const strategy = options?.conflictResolution || 'error';

  // Check if plugin already installed
  if (installedPlugins.has(plugin.name)) {
    const conflict: PluginConflict = {
      type: 'plugin',
      name: plugin.name,
      existingPlugin: plugin.name,
      newPlugin: plugin.name,
    };
    
    if (!shouldRegister(conflict, strategy, options?.onConflict)) {
      return;
    }
  }

  // Detect all conflicts first
  const conflicts = handleConflicts(plugin);

  // Process each conflict and decide what to register
  const componentsToRegister = new Set<string>();
  const fieldValidatorsToRegister = new Map<string, string>();
  const formValidatorsToRegister = new Set<string>();
  const submissionHandlersToRegister = new Set<string>();

  // Components
  if (plugin.components) {
    for (const type of Object.keys(plugin.components)) {
      const conflict = conflicts.find(c => c.type === 'component' && c.name === type);
      if (shouldRegister(conflict || null, strategy, options?.onConflict)) {
        componentsToRegister.add(type);
      }
    }
  }

  // Field validators
  if (plugin.fieldValidators) {
    for (const [category, validators] of Object.entries(plugin.fieldValidators)) {
      for (const name of Object.keys(validators)) {
        const key = `${category}:${name}`;
        const conflict = conflicts.find(c => c.type === 'fieldValidator' && c.name === key);
        if (shouldRegister(conflict || null, strategy, options?.onConflict)) {
          fieldValidatorsToRegister.set(key, category);
        }
      }
    }
  }

  // Form validators
  if (plugin.formValidators) {
    for (const name of Object.keys(plugin.formValidators)) {
      const conflict = conflicts.find(c => c.type === 'formValidator' && c.name === name);
      if (shouldRegister(conflict || null, strategy, options?.onConflict)) {
        formValidatorsToRegister.add(name);
      }
    }
  }

  // Submission handlers
  if (plugin.submissionHandlers) {
    for (const name of Object.keys(plugin.submissionHandlers)) {
      const conflict = conflicts.find(c => c.type === 'submissionHandler' && c.name === name);
      if (shouldRegister(conflict || null, strategy, options?.onConflict)) {
        submissionHandlersToRegister.add(name);
      }
    }
  }

  // Register components that passed conflict resolution
  if (plugin.components) {
    for (const type of componentsToRegister) {
      registerComponent(type, plugin.components[type]);
      registrationOwnership.components.set(type, plugin.name);
    }
  }

  // Register field validators that passed conflict resolution
  if (plugin.fieldValidators) {
    for (const [key, category] of fieldValidatorsToRegister) {
      const name = key.split(':')[1];
      registerFieldValidationHandler(category, name, plugin.fieldValidators[category][name]);
      registrationOwnership.fieldValidators.set(key, plugin.name);
    }
  }

  // Register form validators that passed conflict resolution
  if (plugin.formValidators) {
    for (const name of formValidatorsToRegister) {
      registerFormValidationHandler(name, plugin.formValidators[name]);
      registrationOwnership.formValidators.set(name, plugin.name);
    }
  }

  // Register submission handlers that passed conflict resolution
  if (plugin.submissionHandlers) {
    for (const name of submissionHandlersToRegister) {
      registerSubmissionHandler(name, plugin.submissionHandlers[name]);
      registrationOwnership.submissionHandlers.set(name, plugin.name);
    }
  }

  // Call setup function if provided
  if (plugin.setup) {
    plugin.setup();
  }
  
  // Track the plugin
  installedPlugins.set(plugin.name, plugin);
}

/**
 * Unregister a plugin (note: this does not remove already-registered components/handlers)
 * @param pluginName - Name of the plugin to unregister
 * @returns true if plugin was found and removed, false otherwise
 */
export function unregisterPlugin(pluginName: string): boolean {
  const plugin = installedPlugins.get(pluginName);
  if (!plugin) {
    return false;
  }
  
  // Call cleanup if provided
  if (plugin.cleanup) {
    plugin.cleanup();
  }
  
  installedPlugins.delete(pluginName);
  return true;
}

/**
 * Get installed plugin by name
 * @param pluginName - Plugin name
 * @returns Plugin definition or undefined
 */
export function getPlugin(pluginName: string): ReactaFormPlugin | undefined {
  return installedPlugins.get(pluginName);
}

/**
 * Get all installed plugins
 * @returns Array of installed plugins
 */
export function getAllPlugins(): ReactaFormPlugin[] {
  return Array.from(installedPlugins.values());
}

/**
 * Check if a plugin is registered
 * @param pluginName - Plugin name
 * @returns true if plugin is registered
 */
export function hasPlugin(pluginName: string): boolean {
  return installedPlugins.has(pluginName);
}

/**
 * Helper to register multiple components at once
 * @param components - Object mapping field types to components
 */
export function registerComponents(components: Record<string, unknown>): void {
  for (const [type, component] of Object.entries(components)) {
    registerComponent(type, component);
  }
}
