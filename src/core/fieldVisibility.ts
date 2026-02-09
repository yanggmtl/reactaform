import type { DefinitionPropertyField, FieldValueType } from "./reactaFormTypes";

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

  // Handle boolean false correctly - don't use || which treats false as falsy
  const parentValue = values[parentName];
  const selectedValue = parentValue !== undefined && parentValue !== null 
    ? String(parentValue) 
    : '';
  
  const childrenToShow = parentField.children[selectedValue];
  if (!Array.isArray(childrenToShow)) return;
  
  for (const childName of childrenToShow) {
    if (typeof childName === 'string' && fieldMap[childName]) {
      visibility[childName] = true;
      showChildrenRecursively(childName, fieldMap, values, visibility);
    }
  }
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
  const allChildren = Object.values(parentField.children).flat();
  
  for (const childName of allChildren) {
    if (typeof childName === 'string' && childName in visibility) {
      visibility[childName] = false;
      hideChildrenRecursively(childName, fieldMap, visibility);
    }
  }
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
  const field = fieldMap[fieldName];

  // Always hide previous children first to avoid stale visibility
  hideChildrenRecursively(fieldName, fieldMap, newVisibility);

  // Show new children based on the selected value
  if (value !== undefined && value !== null && field?.children) {
    const valueKey = String(value);
    const childrenToShow = field.children[valueKey];
    
    if (Array.isArray(childrenToShow)) {
      for (const childName of childrenToShow) {
        if (typeof childName === 'string' && fieldMap[childName]) {
          newVisibility[childName] = true;
          showChildrenRecursively(childName, fieldMap, valuesMap, newVisibility);
        }
      }
    }
  }

  // Also update visibility for all fields that have the changed field as a parent
  for (const [otherFieldName, otherField] of Object.entries(fieldMap)) {
    if (otherField.parents && fieldName in otherField.parents) {
      newVisibility[otherFieldName] = isFieldVisible(otherFieldName, fieldMap, valuesMap);
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

  // Check if any parent condition is satisfied (OR logic)
  for (const [parentName, expectedValues] of Object.entries(field.parents)) {
    const parentField = fieldMap[parentName];
    
    // Parent must exist and be visible
    if (!parentField || !isFieldVisible(parentName, fieldMap, values)) {
      continue;
    }
    
    const parentValue = values[parentName];
    if (parentValue === undefined || parentValue === null) {
      continue;
    }

    const expectedValuesStr = expectedValues.map(v => String(v));
    
    // Handle multi-selection fields (arrays)
    if (Array.isArray(parentValue)) {
      const parentValuesStr = parentValue.map(v => String(v));
      // Check if any of the selected values match any expected value
      const hasMatch = parentValuesStr.some(val => expectedValuesStr.includes(val));
      if (hasMatch) {
        return true;
      }
    } else {
      // Handle single-value fields
      const parentValueStr = String(parentValue);
      if (expectedValuesStr.includes(parentValueStr)) {
        return true;
      }
    }
  }

  return false;
};

