/**
 * Enhanced Plugin Registry for ReactaForm
 * Tracks installed plugins, components, validators, submission handlers
 * Handles conflicts with customizable strategy
 */

import {
  registerComponent,
  getComponent,
} from './componentRegistry';
import {
  registerFieldValidationHandler,
  registerFormValidationHandler,
  getFieldValidationHandler,
  getFormValidationHandler,
} from '../validation/validationHandlerRegistry';
import {
  registerSubmissionHandler,
  getSubmissionHandler,
} from './submissionHandlerRegistry';

import type {
  FieldValidationHandler,
  FormValidationHandler,
  FormSubmissionHandler,
} from './reactaFormTypes';

/** Conflict resolution strategies */
export type ConflictResolution =
  | 'error'
  | 'warn'
  | 'override'
  | 'skip';

/** Plugin registration options */
export interface PluginRegistrationOptions {
  conflictResolution?: ConflictResolution;
  onConflict?: (conflict: PluginConflict) => boolean;
}

/** Plugin conflict information */
export interface PluginConflict {
  type: 'component' | 'fieldValidator' | 'formValidator' | 'submissionHandler' | 'plugin';
  name: string;
  existingPlugin: string;
  newPlugin: string;
}

/** ReactaForm plugin definition */
export interface ReactaFormPlugin {
  name: string;
  version: string;
  description?: string;
  components?: Record<string, React.ComponentType<unknown>>;
  fieldValidators?: Record<string, Record<string, FieldValidationHandler>>;
  formValidators?: Record<string, FormValidationHandler>;
  submissionHandlers?: Record<string, FormSubmissionHandler>;
  setup?: () => void;
  cleanup?: () => void;
}

/** Installed plugins registry */
const installedPlugins = new Map<string, ReactaFormPlugin>();

/** Track which plugin registered which items */
const registrationOwnership = {
  components: new Map<string, string>(),
  fieldValidators: new Map<string, Map<string, string>>(), // category -> name -> plugin
  formValidators: new Map<string, string>(),
  submissionHandlers: new Map<string, string>(),
};

/** Decide whether to register based on conflict resolution */
function shouldRegister(
  conflict: PluginConflict | null,
  strategy: ConflictResolution,
  onConflict?: (conflict: PluginConflict) => boolean
): boolean {
  if (!conflict) return true;

  // Custom conflict handler can override
  if (onConflict) {
    const proceed = onConflict(conflict);
    if (!proceed) return false;
  }

  switch (strategy) {
    case 'error':
      throw new Error(
        `Plugin conflict: "${conflict.newPlugin}" tried to register ${conflict.type} "${conflict.name}" already registered by "${conflict.existingPlugin}"`
      );
    case 'warn':
      console.warn(
        `Plugin conflict: "${conflict.newPlugin}" tried to register ${conflict.type} "${conflict.name}" already registered by "${conflict.existingPlugin}". Skipping.`
      );
      return false;
    case 'override':
      console.info(
        `Plugin "${conflict.newPlugin}" is overriding ${conflict.type} "${conflict.name}" previously registered by "${conflict.existingPlugin}"`
      );
      return true;
    case 'skip':
      return false;
  }
}

/** Detect conflicts for a plugin */
function handleConflicts(plugin: ReactaFormPlugin): PluginConflict[] {
  const conflicts: PluginConflict[] = [];

  // Components
  if (plugin.components) {
    for (const type of Object.keys(plugin.components)) {
      const existing = getComponent(type);
      if (existing) {
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

  // Field validators
  if (plugin.fieldValidators) {
    for (const [category, validators] of Object.entries(plugin.fieldValidators)) {
      for (const name of Object.keys(validators)) {
        const categoryMap = registrationOwnership.fieldValidators.get(category);
        const existingPlugin = categoryMap?.get(name);
        const existingHandler = getFieldValidationHandler(category, name);
        if (existingHandler && existingPlugin && existingPlugin !== plugin.name) {
          conflicts.push({
            type: 'fieldValidator',
            name: `${category}:${name}`,
            existingPlugin,
            newPlugin: plugin.name,
          });
        }
      }
    }
  }

  // Form validators
  if (plugin.formValidators) {
    for (const name of Object.keys(plugin.formValidators)) {
      const existingHandler = getFormValidationHandler(name);
      const existingPlugin = registrationOwnership.formValidators.get(name);
      if (existingHandler && existingPlugin && existingPlugin !== plugin.name) {
        conflicts.push({
          type: 'formValidator',
          name,
          existingPlugin,
          newPlugin: plugin.name,
        });
      }
    }
  }

  // Submission handlers
  if (plugin.submissionHandlers) {
    for (const name of Object.keys(plugin.submissionHandlers)) {
      const existingHandler = getSubmissionHandler(name);
      const existingPlugin = registrationOwnership.submissionHandlers.get(name);
      if (existingHandler && existingPlugin && existingPlugin !== plugin.name) {
        conflicts.push({
          type: 'submissionHandler',
          name,
          existingPlugin,
          newPlugin: plugin.name,
        });
      }
    }
  }

  return conflicts;
}

/** Generic item registration helper */
function registerItems<T>(
  items: Record<string, T>,
  ownershipMap: Map<string, string> | Map<string, Map<string, string>>,
  registerFn: (key: string, value: T) => void,
  plugin: ReactaFormPlugin,
  conflicts: PluginConflict[],
  strategy: ConflictResolution,
  onConflict?: (conflict: PluginConflict) => boolean,
  category?: string
) {
  for (const key of Object.keys(items)) {
    let conflict: PluginConflict | undefined;
    if (category) {
      conflict = conflicts.find(c => c.type === 'fieldValidator' && c.name === `${category}:${key}`);
    } else if (items === plugin.components) {
      conflict = conflicts.find(c => c.type === 'component' && c.name === key);
    } else if (items === plugin.formValidators) {
      conflict = conflicts.find(c => c.type === 'formValidator' && c.name === key);
    } else if (items === plugin.submissionHandlers) {
      conflict = conflicts.find(c => c.type === 'submissionHandler' && c.name === key);
    }

    if (shouldRegister(conflict || null, strategy, onConflict)) {
      if (category) {
        const categoryMap = (ownershipMap as Map<string, Map<string, string>>).get(category) || new Map();
        categoryMap.set(key, plugin.name);
        (ownershipMap as Map<string, Map<string, string>>).set(category, categoryMap);
        // When registering categorized items (like field validators), `items` is
        // already the map for that category, so simply use `items[key]`.
        registerFn(key, items[key]);
      } else {
        (ownershipMap as Map<string, string>).set(key, plugin.name);
        registerFn(key, items[key]);
      }
    }
  }
}

/** Register a plugin */
export function registerPlugin(plugin: ReactaFormPlugin, options?: PluginRegistrationOptions): void {
  const strategy = options?.conflictResolution || 'error';

  // Check plugin itself
  if (installedPlugins.has(plugin.name)) {
    const conflict: PluginConflict = {
      type: 'plugin',
      name: plugin.name,
      existingPlugin: plugin.name,
      newPlugin: plugin.name,
    };
    if (!shouldRegister(conflict, strategy, options?.onConflict)) return;
  }

  // Detect conflicts
  const conflicts = handleConflicts(plugin);

  // Register components
  if (plugin.components) {
    registerItems(
      plugin.components,
      registrationOwnership.components,
      registerComponent,
      plugin,
      conflicts,
      strategy,
      options?.onConflict
    );
  }

  // Register field validators
  if (plugin.fieldValidators) {
    for (const [category, validators] of Object.entries(plugin.fieldValidators)) {
      registerItems(
        validators,
        registrationOwnership.fieldValidators,
        (name, handler) => registerFieldValidationHandler(category, name, handler),
        plugin,
        conflicts,
        strategy,
        options?.onConflict,
        category
      );
    }
  }

  // Register form validators
  if (plugin.formValidators) {
    registerItems(
      plugin.formValidators,
      registrationOwnership.formValidators,
      registerFormValidationHandler,
      plugin,
      conflicts,
      strategy,
      options?.onConflict
    );
  }

  // Register submission handlers
  if (plugin.submissionHandlers) {
    registerItems(
      plugin.submissionHandlers,
      registrationOwnership.submissionHandlers,
      registerSubmissionHandler,
      plugin,
      conflicts,
      strategy,
      options?.onConflict
    );
  }

  // Setup hook
  if (plugin.setup) plugin.setup();

  installedPlugins.set(plugin.name, plugin);
}

/** Unregister plugin */
export function unregisterPlugin(pluginName: string, removeRegistrations = false): boolean {
  const plugin = installedPlugins.get(pluginName);
  if (!plugin) return false;

  if (plugin.cleanup) plugin.cleanup();

  if (removeRegistrations) {
    // Remove components
    if (plugin.components) {
      for (const key of Object.keys(plugin.components)) {
        registrationOwnership.components.delete(key);
      }
    }

    // Remove field validators
    if (plugin.fieldValidators) {
      for (const [category, validators] of Object.entries(plugin.fieldValidators)) {
        const categoryMap = registrationOwnership.fieldValidators.get(category);
        if (!categoryMap) continue;
        for (const name of Object.keys(validators)) {
          categoryMap.delete(name);
        }
        if (categoryMap.size === 0) registrationOwnership.fieldValidators.delete(category);
      }
    }

    // Remove form validators
    if (plugin.formValidators) {
      for (const name of Object.keys(plugin.formValidators)) {
        registrationOwnership.formValidators.delete(name);
      }
    }

    // Remove submission handlers
    if (plugin.submissionHandlers) {
      for (const name of Object.keys(plugin.submissionHandlers)) {
        registrationOwnership.submissionHandlers.delete(name);
      }
    }
  }

  installedPlugins.delete(pluginName);
  return true;
}

/** Get a plugin by name */
export function getPlugin(pluginName: string): ReactaFormPlugin | undefined {
  return installedPlugins.get(pluginName);
}

/** Get all installed plugins */
export function getAllPlugins(): ReactaFormPlugin[] {
  return Array.from(installedPlugins.values());
}

/** Check if plugin is registered */
export function hasPlugin(pluginName: string): boolean {
  return installedPlugins.has(pluginName);
}

/** Helper to register multiple components at once */
export function registerComponents(components: Record<string, React.ComponentType<unknown>>): void {
  for (const [type, component] of Object.entries(components)) {
    registerComponent(type, component);
  }
}
