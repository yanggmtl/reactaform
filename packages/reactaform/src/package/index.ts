// ReactaForm Library Main Entry Point
// Import CSS as raw text and inject at runtime so consumers don't need to
// explicitly import the stylesheet. Vite supports `?raw` to load file contents
// as a string which will be bundled into the JS output.
import reactaformCss from './core/reactaform.css?raw';

function injectReactaFormStyles() {
  if (typeof document === 'undefined') return;
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

injectReactaFormStyles();

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
  FieldValidationHandler,
  FormValidationHandler,
  FormSubmissionHandler,
  InputOnChange,
  BaseInputProps
} from './core/reactaFormTypes';

// Component Registry
export { 
  registerComponent,
  getComponent,
} from './core/registries/componentRegistry';

// Validation
export {
  validateFieldValue,
  validateFormValues
} from './core/validation';

// Definition & Instance Management
export {
  loadJsonDefinition,
  createInstanceFromDefinition, // Create new instance with default values
  loadInstance // Load existing instance (valuesMap)
} from './core/reactaFormModel';

// Handler Registries
export {
  registerSubmissionHandler,
} from './core/registries/submissionHandlerRegistry';

export {
  registerFieldValidationHandler,
  registerFormValidationHandler,
} from './core/registries/validationHandlerRegistry';

// Hooks
export {
  useDebouncedCallback
} from './hooks/useDebouncedCallback';

// Unit Mapping (existing utilities)
export * as Units from './utils/unitValueMapper';

// Serialization Utilities
export {
  serializeInstance,
  deserializeInstance,
  serializeDefinition,
  deserializeDefinition
} from './utils/definitionSerializers';
