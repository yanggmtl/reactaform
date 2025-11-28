/**
 * ReactaForm Utils - Comprehensive utility functions
 * 
 * This module provides enhanced utility functions for form building,
 * styling, serialization, translation, and component management.
 */

// CSS Variables and Styling Utilities
export {
  combineClasses,
  CSS_CLASSES,
} from './cssClasses';

// Definition Serialization
export {
  serializeInstance,
  deserializeInstance,
  serializeDefinition,
  deserializeDefinition,
  type SerializationOptions,
  type DeserializationOptions,
  type SerializationResult,
  type DeserializationResult
} from './definitionSerializers';

// Grouping and Organization Helpers
export {
  renameDuplicatedGroups,
  groupConsecutiveFields
} from './groupingHelpers';

// Translation System
export {
  loadCommonTranslation,
  loadUserTranslation,
  createTranslationFunction,
} from './translationCache';

// Unit Mapping (existing utilities)
export * from './unitValueMapper';

