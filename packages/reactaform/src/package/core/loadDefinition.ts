/* eslint-disable @typescript-eslint/no-explicit-any */

//import { XMLParser } from "fast-xml-parser";

// // Helpers
// const toArray = <T,>(x: T | T[] | undefined): T[] => (Array.isArray(x) ? x : x ? [x] : []);

// type Property = {
//   [key: string]: any; // We’ll keep it flexible to support dynamic structures
// };

// function transformXmlDefinition(xml: any) {
//   const root = xml.Config || xml;

//   const transformProperty = (prop: any): Property => {
//     const transformed: Property = { ...prop };

//     // Normalize Options
//     if (prop.Options?.Option) {
//       transformed.Options = toArray(prop.Options.Option).map(opt =>
//         typeof opt === "object" && "#text" in opt ? opt["#text"] : opt
//       );
//     }

//     // Convert Parents to object
//     if (prop.Parents?.Parent) {
//       transformed.Parents = {};
//       toArray(prop.Parents.Parent).forEach((parent: any) => {
//         const name = parent.Name;
//         const selections = toArray(parent.Selection);
//         transformed.Parents[name] = selections.map(s =>
//           typeof s === "object" && "#text" in s ? s["#text"] : s
//         );
//       });
//     }

//     // Handle Children recursively
//     if (prop.Children?.Property) {
//       transformed.Children = {};
//       toArray(prop.Children.Property).forEach((child: any) => {
//         const value = child.Value || "true"; // Default to "true" if missing
//         if (!transformed.Children[value]) {
//           transformed.Children[value] = [];
//         }
//         transformed.Children[value].push(transformProperty(child));
//       });
//     }

//     return transformed;
//   };

//   return {
//     Name: root.Name,
//     DisplayName: root.DisplayName,
//     Localization: root.Localization,
//     Style: root.Style || {},
//     Properties: toArray(root.Properties?.Property).map(transformProperty),
//   };
// }

import type { ReactaDefinition } from "./reactaFormTypes";

export interface LoadDefinitionOptions {
  timeout?: number;
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
export function validateDefinitionSchema(definition: any): string | null {
  if (!definition || typeof definition !== 'object') {
    return "Definition must be a valid object";
  }

  if (!definition.name || typeof definition.name !== 'string') {
    return "Definition must have a valid 'name' property";
  }

  if (!definition.version || typeof definition.version !== 'string') {
    return "Definition must have a valid 'version' property";
  }

  if (!definition.displayName || typeof definition.displayName !== 'string') {
    return "Definition must have a valid 'displayName' property";
  }

  if (!Array.isArray(definition.properties)) {
    return "Definition must have a 'properties' array";
  }

  // Validate each property
  for (let i = 0; i < definition.properties.length; i++) {
    const prop = definition.properties[i];
    if (!prop.name || typeof prop.name !== 'string') {
      return `Property at index ${i} must have a valid 'name'`;
    }
    if (!prop.displayName || typeof prop.displayName !== 'string') {
      return `Property '${prop.name}' must have a valid 'displayName'`;
    }
    if (!prop.type || typeof prop.type !== 'string') {
      return `Property '${prop.name}' must have a valid 'type'`;
    }
  }

  return null;
}

/**
 * Load definition from a configuration file with comprehensive error handling
 */
export async function loadDefinition(
  configFile: string, 
  options: LoadDefinitionOptions = {}
): Promise<DefinitionLoadResult> {
  const { timeout = 10000, validateSchema = true } = options;

  try {
    const ext = configFile.split(".").pop()?.toLowerCase();

    if (!ext || !["json"].includes(ext)) {
      return {
        success: false,
        error: `Unsupported config file type: ${ext}. Only JSON files are currently supported.`
      };
    }

    // Create abort controller for timeout handling
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), timeout);

    let response: Response;
    try {
      response = await fetch(configFile, { 
        signal: abortController.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch ${configFile}: ${response.status} ${response.statusText}`
      };
    }

    const text = await response.text();
    if (!text.trim()) {
      return {
        success: false,
        error: "Configuration file is empty"
      };
    }

    let definition: any;
    if (ext === "json") {
      try {
        definition = JSON.parse(text);
      } catch (parseError) {
        return {
          success: false,
          error: `Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`
        };
      }
    }

    // Validate schema if requested
    if (validateSchema) {
      const validationError = validateDefinitionSchema(definition);
      if (validationError) {
        return {
          success: false,
          error: `Schema validation failed: ${validationError}`
        };
      }
    }

    return {
      success: true,
      definition: definition as ReactaDefinition
    };

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: `Request timeout after ${timeout}ms`
      };
    }
    
    return {
      success: false,
      error: `Unexpected error loading config: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Create instance from definition with validation and error handling
 */
export function createInstanceFromDefinition(
  definition: ReactaDefinition | Record<string, any>, 
  name: string
): { success: boolean; instance?: Record<string, any>; error?: string } {
  try {
    if (!definition) {
      return { success: false, error: "Definition is required" };
    }

    if (!name || typeof name !== 'string') {
      return { success: false, error: "Instance name is required" };
    }

    const instance: Record<string, any> = { name };
    instance.version = definition.version || "1.0.0";
    instance.definition = definition.name || "unknown";
    instance.values = {};

    const properties = definition.properties || [];
    if (Array.isArray(properties)) {
      properties.forEach((prop: any) => {
        if (prop.defaultValue !== undefined) {
          instance.values[prop.name] = prop.defaultValue;
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
  instanceData: string | Record<string, any>
): { success: boolean; instance?: Record<string, any>; error?: string } {
  try {
    if (!instanceData) {
      return { success: false, error: "Instance data is required" };
    }

    let instance: Record<string, any>;
    
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
      instance = instanceData;
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
