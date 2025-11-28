import type { DefinitionPropertyField, FieldValueType } from "./reactaFormTypes";

/**
 * Initializes the visibility map for all fields by setting them to `false`.
 */
export const initializeVisibility = (fields: DefinitionPropertyField[]): Record<string, boolean> => {
  const visibility: Record<string, boolean> = {};
  fields.forEach((field) => {
    visibility[field.name] = false;
  });
  return visibility;
};

/**
 * Creates a lookup map for faster field access during visibility calculations
 */
export const createFieldMap = (fields: DefinitionPropertyField[]): Record<string, DefinitionPropertyField> => {
  const fieldMap: Record<string, DefinitionPropertyField> = {};
  fields.forEach((field) => {
    fieldMap[field.name] = field;
  });
  return fieldMap;
};

/**
 * Recursively shows children of a field based on its current value
 */
const showChildrenRecursively = (
  parentName: string,
  fieldMap: Record<string, DefinitionPropertyField>,
  values: Record<string, FieldValueType>,
  visibility: Record<string, boolean>
): void => {
  const parentField = fieldMap[parentName];
  if (!parentField?.children) return;

  const selectedValue = String(values[parentName] || '');
  const childrenToShow = parentField.children[selectedValue] || [];
  
  childrenToShow.forEach((childName: string) => {
    visibility[childName] = true;
    showChildrenRecursively(childName, fieldMap, values, visibility);
  });
};

/**
 * Recursively hides children of a field
 */
const hideChildrenRecursively = (
  parentName: string,
  fieldMap: Record<string, DefinitionPropertyField>,
  visibility: Record<string, boolean>
): void => {
  const parentField = fieldMap[parentName];
  if (!parentField?.children) return;

  // Hide all possible children regardless of current value
  Object.values(parentField.children)
    .flat()
    .forEach((childName) => {
      visibility[childName] = false;
      hideChildrenRecursively(childName, fieldMap, visibility);
    });
};

/**
 * Updates visibility map based on current field values and parent-child relationships
 */
export const updateVisibilityMap = (
  fields: DefinitionPropertyField[],
  values: Record<string, FieldValueType>,
  oldVisibility: Record<string, boolean>,
  fieldMapRef: Record<string, DefinitionPropertyField>
): Record<string, boolean> => {
  const newVisibility = { ...oldVisibility };

  // First, show all root fields (fields without parents)
  fields.forEach((field) => {
    if (!field.parents || Object.keys(field.parents).length === 0) {
      newVisibility[field.name] = true;
      showChildrenRecursively(field.name, fieldMapRef, values, newVisibility);
    }
  });

  return newVisibility;
};

/**
 * Updates visibility when a specific field value changes
 */
export const updateVisibilityBasedOnSelection = (
  visibility: Record<string, boolean>,
  fieldMap: Record<string, DefinitionPropertyField>,
  valuesMap: Record<string, FieldValueType>,
  fieldName: string,
  value: FieldValueType
): Record<string, boolean> => {
  const newVisibility = { ...visibility };

  // Always hide previous children first to avoid stale visibility
  hideChildrenRecursively(fieldName, fieldMap, newVisibility);

  // Show new children based on the selected value
  if (value !== undefined && value !== null) {
    const field = fieldMap[fieldName];
    if (field?.children) {
      const valueKey = String(value);
      const childrenToShow = field.children[valueKey] || [];
      
      childrenToShow.forEach((childName) => {
        newVisibility[childName] = true;
        showChildrenRecursively(childName, fieldMap, valuesMap, newVisibility);
      });
    }
  }

  return newVisibility;
};

/**
 * Checks if a field should be visible based on its parent relationships
 */
export const isFieldVisible = (
  fieldName: string,
  fieldMap: Record<string, DefinitionPropertyField>,
  values: Record<string, FieldValueType>
): boolean => {
  const field = fieldMap[fieldName];
  if (!field) return false;

  // Root fields (no parents) are always visible
  if (!field.parents || Object.keys(field.parents).length === 0) {
    return true;
  }

  // Check if all parent conditions are satisfied
  for (const [parentName, expectedValues] of Object.entries(field.parents)) {
    const parentValue = values[parentName];
    if (parentValue === undefined || parentValue === null) {
      return false;
    }

    const parentValueStr = String(parentValue);
    const expectedValuesStr = expectedValues.map(v => String(v));
    
    if (!expectedValuesStr.includes(parentValueStr)) {
      return false;
    }
  }

  return true;
};

/**
 * Gets all visible fields efficiently
 */
export const getVisibleFields = (
  fields: DefinitionPropertyField[],
  values: Record<string, FieldValueType>
): DefinitionPropertyField[] => {
  const fieldMap = createFieldMap(fields);
  return fields.filter(field => isFieldVisible(field.name, fieldMap, values));
};
