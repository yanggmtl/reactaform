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

import { registerBuiltinTypeFieldValidationHandler } from "./validationHandlerRegistry";

let registed = false;
/**
 * Ensures all built-in field validators are registered.
 * This function references all validators to prevent tree-shaking.
 * Safe to call multiple times as handlers are keyed.
 */
export function ensureBuiltinTypeValidatorsRegistered(): void {
  if (registed) return;
  registerBuiltinTypeFieldValidationHandler("int", validateIntegerField);
  registerBuiltinTypeFieldValidationHandler("stepper", validateIntegerField);
  registerBuiltinTypeFieldValidationHandler("int-array", validateIntegerArrayField);
  registerBuiltinTypeFieldValidationHandler("float", validateFloatField);
  registerBuiltinTypeFieldValidationHandler("slider", validateFloatField);
  registerBuiltinTypeFieldValidationHandler("float-array", validateFloatArrayField);
  registerBuiltinTypeFieldValidationHandler("text", validateTextField);
  registerBuiltinTypeFieldValidationHandler("string", validateTextField);
  registerBuiltinTypeFieldValidationHandler("multiline", validateTextField);
  registerBuiltinTypeFieldValidationHandler("password", validateTextField);
  registerBuiltinTypeFieldValidationHandler("email", validateEmailField);
  registerBuiltinTypeFieldValidationHandler("date", validateDateField);
  registerBuiltinTypeFieldValidationHandler("time", validateTimeField);
  registerBuiltinTypeFieldValidationHandler("url", validateUrlField);
  registerBuiltinTypeFieldValidationHandler("phone", validatePhoneField);
  registerBuiltinTypeFieldValidationHandler("unit", validateUnitValueField);
  registerBuiltinTypeFieldValidationHandler("dropdown", validateDropdownField);
  registerBuiltinTypeFieldValidationHandler("multi-selection", validateMultiSelectionField);
  registerBuiltinTypeFieldValidationHandler("color", validateColorField);
  registerBuiltinTypeFieldValidationHandler("rating", validateRatingField);
  registerBuiltinTypeFieldValidationHandler("file", validateFileField);
  registed = true;
}

// Call at module load to ensure registration in typical usage
ensureBuiltinTypeValidatorsRegistered();
