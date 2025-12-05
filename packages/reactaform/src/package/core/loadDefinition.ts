
import type { ReactaDefinition, ReactaInstance, DefinitionPropertyField } from "./reactaFormTypes";

export interface LoadDefinitionOptions {
  validateSchema?: boolean;
}

export interface DefinitionLoadResult {
  success: boolean;
  definition?: ReactaDefinition;
  error?: string;
}

/**
 * Validates that a definition object has the required structure
 */
export function validateDefinitionSchema(definition: ReactaDefinition): string | null {
  if (!definition || typeof definition !== "object") return "Definition must be an object";
  const def = definition;
  if (!def.name || typeof def.name !== "string") return "Definition must include a 'name' string";
  if (!def.version || typeof def.version !== "string") return "Definition must include a 'version' string";
  if (def.properties !== undefined && !Array.isArray(def.properties)) return "'properties' must be an array if provided";
  if (Array.isArray(def.properties)) {
    for (let i = 0; i < def.properties.length; i++) {
      const p = def.properties[i];
      if (!p || typeof p !== 'object') return `Property at index ${i} must be an object`;
      if (!p.name || typeof p.name !== 'string') return `Property at index ${i} must have a string 'name'`;
      if (!p.type || typeof p.type !== 'string') return `Property '${p.name}' must have a string 'type'`;
    }
  }
  return null;
}

/**
 * Load definition from a JSON string. This intentionally does not perform any file I/O.
 */
export async function loadJsonDefinition(
  jsonData: string,
  options: LoadDefinitionOptions = {}
): Promise<DefinitionLoadResult> {
  const { validateSchema = true } = options;

  try {
    if (!jsonData || typeof jsonData !== 'string') {
      return { success: false, error: 'jsonData must be a non-empty JSON string' };
    }

    const text = jsonData.trim();
    if (!text) {
      return { success: false, error: 'jsonData is empty' };
    }

    let definition: ReactaDefinition;
    try {
      definition = JSON.parse(text) as unknown as ReactaDefinition;
    } catch (parseError) {
      return {
        success: false,
        error: `Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`
      };
    }

    if (validateSchema) {
      const validationError = validateDefinitionSchema(definition);
      if (validationError) {
        return { success: false, error: `Schema validation failed: ${validationError}` };
      }
    }

    return { success: true, definition: definition as ReactaDefinition };
  } catch (error) {
    return { success: false, error: `Unexpected error loading definition: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

/**
 * Create instance from definition with validation and error handling
 */
export function createInstanceFromDefinition(
  definition: ReactaDefinition, 
  name: string
): { success: boolean; instance?: ReactaInstance; error?: string } {
  try {
    if (!definition) {
      return { success: false, error: "Definition is required" };
    }

    if (!name || typeof name !== 'string') {
      return { success: false, error: "Instance name is required" };
    }

    const instance: ReactaInstance = {
      name,
      definition: definition.version ?? "1.0.0",
      version: definition.name ?? "unknown",
      values: {}
    };

    const properties = definition.properties || [];
    if (Array.isArray(properties)) {
      (properties as unknown[]).forEach((prop) => {
        const p = prop as Record<string, unknown>;
        if (p.defaultValue !== undefined) {
          (instance.values as Record<string, unknown>)[p.name as string] = p.defaultValue;
        }
      });
    }

    return { success: true, instance };
  } catch (error) {
    return { 
      success: false, 
      error: `Error creating instance: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Load instance data with validation
 */
export function loadInstance(
  instanceData: string | Record<string, unknown>
): { success: boolean; instance?: ReactaInstance; error?: string } {
  try {
    if (!instanceData) {
      return { success: false, error: "Instance data is required" };
    }

    let instance: ReactaInstance;
    
    if (typeof instanceData === "string") {
      try {
        instance = JSON.parse(instanceData);
      } catch (parseError) {
        return { 
          success: false, 
          error: `Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}` 
        };
      }
    } else {
      instance = instanceData as unknown as ReactaInstance;
    }

    // Basic validation
    if (typeof instance !== 'object' || instance === null) {
      return { success: false, error: "Instance must be a valid object" };
    }

    return { success: true, instance };
  } catch (error) {
    return { 
      success: false, 
      error: `Error loading instance: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

export function upgradeInstanceToLatestDefinition(
  instance: ReactaInstance,
  latestDefinition: ReactaDefinition,
  // optional callback allowing custom upgrade logic
  callback?: (oldInstance: ReactaInstance, newInstance: Record<string, unknown>, latestDefinition: ReactaDefinition) => void
): { success: boolean; upgradedInstance?: Record<string, unknown>; error?: string } {
  try {
    if (!instance) {
      return { success: false, error: "Instance is required" };
    }
    if (!latestDefinition) {
      return { success: false, error: "Latest definition is required" };
    }

    // If the instance version and definition match the latest, no upgrade needed
    if (instance.definition === latestDefinition.name && instance.version === latestDefinition.version) {
      return { success: true, upgradedInstance: instance as unknown as Record<string, unknown> };
    }

    // Create a new empty instance based on the latest definition (no values copied yet)
    const newInstance: Record<string, unknown> = {
      name: instance.name || (latestDefinition.name + "-instance"),
      definition: latestDefinition.name,
      version: latestDefinition.version,
      values: {},
    };

    const newValues = newInstance.values as Record<string, unknown>;

    // Build a map of latest property definitions for quick lookup
    const latestPropMap: Record<string, DefinitionPropertyField> = {};
    (latestDefinition.properties || []).forEach((p) => {
      latestPropMap[p.name] = p;
    });

    // Helper: best-effort conversion from old value to a target type string
    const convertValueToType = (value: unknown, targetType: string, prop?: DefinitionPropertyField) => {
      if (value === null || value === undefined) return value;
      const t = targetType.toLowerCase();
      try {
        if (t === 'string') return String(value);
        if (t === 'int' || t === 'integer' || t === 'number' || t === 'float') {
          if (typeof value === 'number') return value;
          if (typeof value === 'boolean') return value ? 1 : 0;
          if (typeof value === 'string') {
            const n = Number(value.trim());
            return Number.isNaN(n) ? 0 : n;
          }
          return 0;
        }
        if (t === 'boolean' || t === 'bool') {
          if (typeof value === 'boolean') return value;
          if (typeof value === 'number') return value !== 0;
          if (typeof value === 'string') return ['true','1','yes'].includes(value.toLowerCase());
          return Boolean(value);
        }
        if (t === 'unit') {
          // Expect [number, unit]
          if (Array.isArray(value) && value.length >= 1) return value;
          if (typeof value === 'number') return [value, (prop && prop.defaultUnit) || ''];
          if (typeof value === 'string') {
            const num = Number(value);
            if (!Number.isNaN(num)) return [num, (prop && prop.defaultUnit) || ''];
            return [0, (prop && prop.defaultUnit) || ''];
          }
          return value;
        }
        // array target type e.g., string[] or number[]
        if (t.endsWith('[]') || t === 'array') {
          if (Array.isArray(value)) return value;
          if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(Boolean);
          return [value];
        }
      } catch {
        // fallthrough
      }
      // default fallback
      return value;
    };

    // Iterate through old instance values and migrate those that still exist in latest definition
    const oldValues = (instance.values || {}) as Record<string, unknown>;
    Object.keys(oldValues).forEach((key) => {
      const oldVal = oldValues[key];
      const latestProp = latestPropMap[key];
      if (!latestProp) {
        // property removed in latest definition -- skip
        return;
      }

      // Compare types naively by string equality
      const oldType = (() => {
        if (Array.isArray(oldVal)) return 'array';
        if (oldVal === null) return 'null';
        return typeof oldVal;
      })();
      const newType = (latestProp.type || '').toLowerCase();

      if (oldType === newType || (newType === 'string' && typeof oldVal === 'string')) {
        // same-ish type, copy as is
        newValues[key] = oldVal;
      } else {
        // attempt conversion
        newValues[key] = convertValueToType(oldVal, newType, latestProp);
      }
    });

    // Add any new properties from the latest definition with default values if not present
    (latestDefinition.properties || []).forEach((prop) => {
      const propName = prop.name as string;
      if (!(propName in newValues)) {
        newValues[propName] = prop.defaultValue;
      }
    });

    // Allow caller to customize the upgrade process (merge/add custom values)
    try {
      if (typeof callback === 'function') {
        callback?.(instance, newInstance, latestDefinition);
      }
    } catch (cbErr) {
      // swallow callback errors but report them
      return { success: false, error: `Upgrade callback error: ${cbErr instanceof Error ? cbErr.message : String(cbErr)}` };
    }

    return { success: true, upgradedInstance: newInstance };
  } catch (error) {
    return { 
      success: false, 
      error: `Error upgrading instance: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
} 