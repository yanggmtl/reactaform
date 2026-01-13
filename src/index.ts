// ReactaForm Library Main Entry Point
// Import CSS as raw text and inject at runtime so consumers don't need to
// explicitly import the stylesheet. Vite supports `?raw` to load file contents
// as a string which will be bundled into the JS output.
import reactaformCss from './core/reactaform.css?raw';

export function injectReactaFormStyles() {
  if (document.getElementById('reactaform-styles')) return;
  try {
    const style = document.createElement('style');
    style.id = 'reactaform-styles';
    style.textContent = reactaformCss as string;
    document.head.appendChild(style);
  } catch {
    // Fail silently in non-browser environments
  }
}

if (typeof document !== 'undefined') injectReactaFormStyles();

// Core Components
export { default as ReactaForm } from './components/ReactaForm';
export { default as ReactaFormRenderer } from './components/ReactaFormRenderer';
export type { ReactaFormRendererProps } from './components/ReactaFormRenderer';

// Context and Providers  
export { ReactaFormProvider } from './components/ReactaFormProvider';
export { default as useReactaFormContext } from './hooks/useReactaFormContext';

// Layout Components for Custom Field Development
export { StandardFieldLayout } from './components/LayoutComponents';

// CSS Utilities for Custom Field Development
export { CSS_CLASSES, combineClasses } from './utils/cssClasses';

// Types
export type {
  ReactaFormContextType,
  ReactaFormProviderProps,
  DefinitionPropertyField,
  ReactaDefinition,
  ReactaInstance,
  ReactaFormProps,
  FieldValueType,
  ErrorType,
  FieldCustomValidationHandler,
  FieldTypeValidationHandler,
  FormValidationHandler,
  FormSubmissionHandler,
  InputOnChange,
  BaseInputProps,
  TranslationFunction,
  FieldValidationMode
} from './core/reactaFormTypes';

// Component Registry, for registering custom field components
export { 
  registerComponent,
  getComponent,
} from './core/componentRegistry';

// Validation Utilities for custom validation logic
export {
  validateFieldValue, // Deprecated, use validateFieldWithHandler instead
  validateFieldWithCustomHandler
} from './validation/validation';

// Plugin System
export {
  type ReactaFormPlugin,
  type ConflictResolution,
  type PluginRegistrationOptions,
  type PluginConflict,

  registerPlugin,
  unregisterPlugin,
  getPlugin,
  getAllPlugins,
  hasPlugin,
  registerComponents,
} from './core/pluginRegistry';

// Definition & Instance Management
export type {
  LoadDefinitionOptions,
  DefinitionLoadResult,
  InstanceLoadResult,
} from './core/reactaFormModel';

export {
  loadJsonDefinition,
  createInstanceFromDefinition, // Create new instance with default values
  loadInstance, // Load existing instance (valuesMap)
  upgradeInstanceToLatestDefinition // Upgade instance to latest definition version
} from './core/reactaFormModel';

// Handler Registries
export {
  registerSubmissionHandler,
} from './core/submissionHandlerRegistry';

export {
  registerFieldCustomValidationHandler,
  registerFieldTypeValidationHandler,
  registerFormValidationHandler,
} from './validation/validationHandlerRegistry';

// Hooks
export {
  type DebouncedCallback,
  useDebouncedCallback
} from './hooks/useDebouncedCallback';

export {
  useFieldValidator
} from './hooks/useFieldValidator';

export {
  useUncontrolledValidatedInput,
  type UseUncontrolledValidatedInputProps
} from './hooks/useUncontrolledValidatedInput';

// Unit Mapping (existing utilities)
export * as Units from './utils/unitValueMapper';

// Theme Utilities
export { isDarkTheme } from './utils/themeUtils';

// Serialization Utilities
export {
  serializeInstance,
  deserializeInstance,
  serializeDefinition,
  deserializeDefinition
} from './utils/definitionSerializers';

// Translation Utilities
export {
  getSupportedLanguages
} from './utils/translationCache';
