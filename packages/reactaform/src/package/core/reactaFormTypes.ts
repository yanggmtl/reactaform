import type { ReactNode } from 'react';

// You can't enforce Integer vs Float at compile time in TS, so both are number aliases
type Integer = number;
type Float = number;

export type FieldValueType =
  | boolean
  | Integer
  | Float
  | string
  | Integer[]
  | Float[]
  | string[]
  | [number, string]
  | File
  | File[];

export type ErrorType = string | null;

export type ParentField = Record<string, string[] | Integer[] | boolean[]>;

export interface DefinitionPropertyField {
  name: string;
  displayName: string;
  type: string; // 'string' | 'number' | 'boolean' | etc.
  defaultValue: FieldValueType;
  required?: boolean;
  parents?: ParentField;
  children?: Record<string, string[]>;
  group?: string;
  tooltip?: string;
  labelLayout?: 'row' | 'column-left' | 'column-center'; // Optional label layout: 'row' (default), 'column-left' (label left-aligned), or 'column-center' (label center-aligned)

  // Custom validation handler name
  validationHandlerName?: string;

  // Unit field properties
  dimension?: string; // for 'unit' type fields, e.g. 'length', 'angle', etc.
  defaultUnit?: string; // for 'unit' type fields

  // Enum/select field properties
  options?: Array<{ label: string; value: string }>;

  // Text/String field properties
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  placeholder?: string;
  
  // Numeric field properties
  min?: number;
  max?: number;
  minInclusive?: boolean;
  maxInclusive?: boolean;
  step?: number;

  // Array/collection properties
  minCount?: number;
  maxCount?: number;
  
  // Date/Time field properties
  minDate?: string;
  maxDate?: string;
  includeSeconds?: boolean; // for 'time' type fields
  
  // Layout properties
  layout?: 'horizontal' | 'vertical' | 'row' | 'column';
  alignment?: 'left' | 'center' | 'right';
  
  // Image/Display properties
  width?: number;
  height?: number;
  localized?: string;
  minHeight?: string; // For textarea minimum height
  
  // File input properties
  accept?: string; // e.g. "image/*,.pdf"
  multiple?: boolean;
}

export interface ReactaDefinition {
  name: string;
  version: string;
  displayName: string;
  localization?: string;
  properties: DefinitionPropertyField[];
  validationHandlerName?: string;
  submitHandlerName?: string;
}

export interface ReactaInstance {
  name: string;
  definition: string;
  version: string;
  values: {
    [fieldName: string]: FieldValueType;
  };
}

export interface ReactaFormProps {
  definitionData: string | Record<string, unknown>; // Json string or map object
  language?: string;
  instance?: ReactaInstance;
  className?: string;
  darkMode?: boolean;
  style?: React.CSSProperties;
}

// Field validator function: returns error string or undefined if valid
export type FieldValidationHandler = (
  value: FieldValueType | unknown,
  t: (defaultText: string, ...args: unknown[]) => string,
) => string | undefined;

// Form validator function: takes entire values map,
// and returns error string or undefined if valid
// This is used for cross-field validation
export type FormValidationHandler = (
  valuesMap: Record<string, FieldValueType | unknown>,
  t: (key: string, ...args: unknown[]) => string,
) => string[] | undefined;

// Submission function: returns error string or undefined if valid
export type FormSubmissionHandler = (
  definition: ReactaDefinition | Record<string, unknown>,
  instanceName: string | null,
  valuesMap: Record<string, FieldValueType | unknown>,
  t: (defaultText: string, ...args: unknown[]) => string
) => string[] | undefined;

// Generic input change callback used by input components
export type InputOnChange<T> = (value: T | string, error: string | null) => void;

// Shared base props for input components in the builder/renderer
export interface BaseInputProps<
  TValue = unknown,
  TField extends DefinitionPropertyField = DefinitionPropertyField
> {
  field: TField;
  value: TValue;
  placeholder?: string;
  onChange?: InputOnChange<TValue>;
  onError?: (error: string | null) => void;
}

// Context types
export type ReactaFormContextType = {
  definitionName: string;
  language: string;
  darkMode: boolean;
  formStyle: { container?: React.CSSProperties; titleStyle?: React.CSSProperties };
  fieldStyle: Record<string, unknown>;
  t: (defaultText: string, ...args: unknown[]) => string;
};

// Provider props types
export type ReactaFormProviderProps = {
  children: ReactNode;
  defaultDefinitionName?: string;
  defaultStyle?: Record<string, unknown>;
  defaultLanguage?: string;
  defaultDarkMode?: boolean;
  defaultLocalizeName?: string;
  className?: string;
};

// Translation cache types
export type TranslationMap = Record<string, string>;
export type TranslationCache = Map<string, TranslationMap>;

// Registry operation result types
export interface RegistryResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Field group configuration
export interface FieldGroup {
  name: string;
  displayName: string;
  description?: string;
  collapsed?: boolean;
  order?: number;
}

// Enhanced validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// Form lifecycle events
export type FormEventType = 'init' | 'change' | 'validate' | 'submit' | 'reset';

export interface FormEvent {
  type: FormEventType;
  timestamp: Date;
  data?: unknown;
}

// Enhanced field configuration
export interface EnhancedDefinitionPropertyField extends DefinitionPropertyField {
  category?: string;
  tags?: string[];
  dependencies?: string[];
  conditional?: {
    field: string;
    value: unknown;
    operator?: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  };
}