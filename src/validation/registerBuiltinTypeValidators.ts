/**
 * @fileoverview Built-in validator registration
 * @description Imports all validator modules for side-effect registration.
 * Re-exports all validators to ensure bundlers don't tree-shake them.
 */

// Import all validators for side-effect registration
import { validateIntegerArrayField, validateIntegerField } from "./validateIntegerField";
import { validateFloatArrayField, validateFloatField } from "./validateFloatField";
import { validateTextField } from "./validateTextField";
import { validateDateField } from "./validateDateField";
import { validateTimeField } from "./validateTimeField";
import { validateEmailField } from "./validateEmailField";
import { validatePhoneField } from "./validatePhoneField";
import { validateUrlField } from "./validateUrlField";
import { validateUnitValueField } from "./validateUnitValueField";
import { validateFileField } from "./validateFileField";
import { validateDropdownField, validateMultiSelectionField } from "./validateSelectionFields";
import { validateColorField } from "./validateColorField";
import { validateRatingField } from "./validateRatingField";

import { registerBuiltinFieldTypeValidationHandler } from "./validationHandlerRegistry";

let registed = false;
/**
 * Ensures all built-in field validators are registered.
 * This function references all validators to prevent tree-shaking.
 * Safe to call multiple times as handlers are keyed.
 */
export function ensureBuiltinFieldTypeValidatorsRegistered(): void {
  if (registed) return;
  registerBuiltinFieldTypeValidationHandler("int", validateIntegerField);
  registerBuiltinFieldTypeValidationHandler("stepper", validateIntegerField);
  registerBuiltinFieldTypeValidationHandler("int-array", validateIntegerArrayField);
  registerBuiltinFieldTypeValidationHandler("float", validateFloatField);
  registerBuiltinFieldTypeValidationHandler("slider", validateFloatField);
  registerBuiltinFieldTypeValidationHandler("float-array", validateFloatArrayField);
  registerBuiltinFieldTypeValidationHandler("text", validateTextField);
  registerBuiltinFieldTypeValidationHandler("string", validateTextField);
  registerBuiltinFieldTypeValidationHandler("multiline", validateTextField);
  registerBuiltinFieldTypeValidationHandler("password", validateTextField);
  registerBuiltinFieldTypeValidationHandler("email", validateEmailField);
  registerBuiltinFieldTypeValidationHandler("date", validateDateField);
  registerBuiltinFieldTypeValidationHandler("time", validateTimeField);
  registerBuiltinFieldTypeValidationHandler("url", validateUrlField);
  registerBuiltinFieldTypeValidationHandler("phone", validatePhoneField);
  registerBuiltinFieldTypeValidationHandler("unit", validateUnitValueField);
  registerBuiltinFieldTypeValidationHandler("dropdown", validateDropdownField);
  registerBuiltinFieldTypeValidationHandler("multi-selection", validateMultiSelectionField);
  registerBuiltinFieldTypeValidationHandler("color", validateColorField);
  registerBuiltinFieldTypeValidationHandler("rating", validateRatingField);
  registerBuiltinFieldTypeValidationHandler("file", validateFileField);
  registed = true;
}

// Call at module load to ensure registration in typical usage
ensureBuiltinFieldTypeValidatorsRegistered();
