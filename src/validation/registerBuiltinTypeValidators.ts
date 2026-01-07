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
import {
  validateDropdownField,
  validateMultiSelectionField,
} from "./validateSelectionFields";
import { validateColorField } from "./validateColorField";
import { validateRatingField } from "./validateRatingField";
import { registerBuiltinFieldValidationHandler } from "./validationHandlerRegistry";
import { validateFileField } from "./validateFileField";

let registed = false;
/**
 * Ensures all built-in field validators are registered.
 * This function references all validators to prevent tree-shaking.
 * Safe to call multiple times as handlers are keyed.
 */
export function ensureBuiltinValidatorsRegistered(): void {
  if (registed) return;
  registerBuiltinFieldValidationHandler("int", validateIntegerField);
  registerBuiltinFieldValidationHandler("stepper", validateIntegerField);
  registerBuiltinFieldValidationHandler("int-array", validateIntegerArrayField);
  registerBuiltinFieldValidationHandler("float", validateFloatField);
  registerBuiltinFieldValidationHandler("slider", validateFloatField);
  registerBuiltinFieldValidationHandler("float-array", validateFloatArrayField);
  registerBuiltinFieldValidationHandler("text", validateTextField);
  registerBuiltinFieldValidationHandler("string", validateTextField);
  registerBuiltinFieldValidationHandler("multiline", validateTextField);
  registerBuiltinFieldValidationHandler("password", validateTextField);
  registerBuiltinFieldValidationHandler("email", validateEmailField);
  registerBuiltinFieldValidationHandler("date", validateDateField);
  registerBuiltinFieldValidationHandler("time", validateTimeField);
  registerBuiltinFieldValidationHandler("url", validateUrlField);
  registerBuiltinFieldValidationHandler("phone", validatePhoneField);
  registerBuiltinFieldValidationHandler("unit", validateUnitValueField);
  registerBuiltinFieldValidationHandler("dropdown", validateDropdownField);
  registerBuiltinFieldValidationHandler("multi-selection", validateMultiSelectionField);
  registerBuiltinFieldValidationHandler("color", validateColorField);
  registerBuiltinFieldValidationHandler("rating", validateRatingField);
  registerBuiltinFieldValidationHandler("file", validateFileField);
  registed = true;
}

// Call at module load to ensure registration in typical usage
ensureBuiltinValidatorsRegistered();
