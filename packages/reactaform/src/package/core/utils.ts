/* eslint-disable no-prototype-builtins, @typescript-eslint/no-explicit-any */

import type { DefinitionPropertyField, FieldValueType } from "./reactaFormTypes";

/**
 * Deep clone utility for objects
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

/**
 * Type-safe value comparison
 */
export function isEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a == null || b == null) return false;
  
  if (typeof a !== typeof b) return false;
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => isEqual(item, b[index]));
  }
  
  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every(key => isEqual(a[key], b[key]));
  }
  
  return false;
}

/**
 * Safe property access with default value
 */
export function safeGet<T>(obj: any, path: string, defaultValue?: T): T | undefined {
  try {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current == null || typeof current !== 'object') {
        return defaultValue;
      }
      current = current[key];
    }
    
    return current !== undefined ? current : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): T & { cancel: () => void } {
  let timeout: number | null = null;
  
  const debounced = function (this: any, ...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait) as unknown as number;
    
    if (callNow) {
      func.apply(this, args);
    }
  } as T & { cancel: () => void };
  
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout as unknown as number);
      timeout = null;
    }
  };
  
  return debounced;
}

/**
 * Generate unique ID
 */
export function generateId(prefix = 'reactaform'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format field value for display
 */
export function formatFieldValue(value: FieldValueType, field: DefinitionPropertyField): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  switch (field.type) {
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'int':
    case 'float':
    case 'number':
      return String(value);
    case 'int-array':
    case 'float-array':
      return Array.isArray(value) ? value.join(', ') : String(value);
    case 'date':
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }
      return String(value);
    case 'date-time':
      if (value instanceof Date) {
        return value.toLocaleString();
      }
      return String(value);
    case 'file':
      if (value instanceof File) {
        return value.name;
      }
      if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
        return (value as File[]).map(f => f.name).join(', ');
      }
      return String(value);
    default:
      return String(value);
  }
}

/**
 * Validate field value based on field configuration
 */
export function validateFieldBasic(value: FieldValueType, field: DefinitionPropertyField): string | null {
  // Required field validation
  if (field.required && (value === null || value === undefined || value === '')) {
    return `${field.displayName} is required`;
  }
  
  // Type-specific validations
  switch (field.type) {
    case 'email':
      if (typeof value === 'string' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return `${field.displayName} must be a valid email address`;
        }
      }
      break;
    case 'url':
      if (typeof value === 'string' && value) {
        try {
          new URL(value);
        } catch {
          return `${field.displayName} must be a valid URL`;
        }
      }
      break;
    case 'int':
      if (value !== null && value !== undefined && value !== '') {
        const numValue = Number(value);
        if (isNaN(numValue) || !Number.isInteger(numValue)) {
          return `${field.displayName} must be a valid integer`;
        }
      }
      break;
    case 'float':
    case 'number':
      if (value !== null && value !== undefined && value !== '') {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          return `${field.displayName} must be a valid number`;
        }
      }
      break;
  }
  
  return null;
}

/**
 * Get field dependencies based on parent-child relationships
 */
export function getFieldDependencies(
  fields: DefinitionPropertyField[]
): Record<string, string[]> {
  const dependencies: Record<string, string[]> = {};
  
  fields.forEach(field => {
    dependencies[field.name] = [];
    
    // Add parent dependencies
    if (field.parents) {
      Object.keys(field.parents).forEach(parentName => {
        dependencies[field.name].push(parentName);
      });
    }
    
    // Add children as reverse dependencies
    if (field.children) {
      Object.values(field.children).flat().forEach(childName => {
        if (!dependencies[childName]) {
          dependencies[childName] = [];
        }
        if (!dependencies[childName].includes(field.name)) {
          dependencies[childName].push(field.name);
        }
      });
    }
  });
  
  return dependencies;
}

/**
 * Group fields by their group property
 */
export function groupFields(fields: DefinitionPropertyField[]): Record<string, DefinitionPropertyField[]> {
  const groups: Record<string, DefinitionPropertyField[]> = {
    default: []
  };
  
  fields.forEach(field => {
    const groupName = field.group || 'default';
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(field);
  });
  
  return groups;
}