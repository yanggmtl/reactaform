import type { ReactaDefinition, FieldValueType } from "./reactaFormTypes";
import { validateFormValues } from "./validation";
import { getFormSubmissionHandler } from "./registries/submissionHandlerRegistry";

export interface SubmitResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  errors?: string[];
}

export function submitForm(
  definition: ReactaDefinition,
  instance: Record<string, unknown>,
  valuesMap: Record<string, FieldValueType | unknown>,
  t: (key: string) => string,
  errors: Record<string, string>
): SubmitResult {
  // mark `instance` as used to avoid unused parameter compile errors in some tsconfigs
  void instance;

  // Check for existing validation errors
  const existingErrors = Object.values(errors).filter(Boolean);
  if (existingErrors.length > 0) {
    return { 
      success: false, 
      message: t("Please fix validation errors before submitting."),
      errors: existingErrors
    };
  }

  // Transform and validate form data
  const finalMap: Record<string, FieldValueType | unknown> = { ...valuesMap };
  const transformationErrors: string[] = [];

  if (definition && Array.isArray(definition.properties)) {
    for (const prop of definition.properties) {
      const propName = prop.name;
      const raw = finalMap[propName];
      if (raw === undefined || raw === null) continue;
      
      const schemaType = prop.type;
      try {
        if ((schemaType === "int" || schemaType === "number" || schemaType === "float") && typeof raw === "string") {
          const numValue = Number(String(raw).trim());
          if (isNaN(numValue)) {
            transformationErrors.push(t(`Invalid number format for field ${prop.displayName || propName}`));
          } else {
            finalMap[propName] = numValue;
          }
        } else if ((schemaType === "int-array" || schemaType === "float-array") && typeof raw === "string") {
          const arr = String(raw)
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);
          
          const numArr = arr.map(v => {
            const num = Number(v);
            if (isNaN(num)) {
              transformationErrors.push(t(`Invalid number "${v}" in array for field ${prop.displayName || propName}`));
              return 0;
            }
            return num;
          });
          
          if (transformationErrors.length === 0) {
            finalMap[propName] = numArr;
          }
        }
      } catch (error) {
        transformationErrors.push(t(`Error processing field ${prop.displayName || propName}: ${error}`));
      }
    }
  }

  if (transformationErrors.length > 0) {
    return {
      success: false,
      message: t("Data transformation errors occurred."),
      errors: transformationErrors
    };
  }

  // Perform form-level validation
  const validationErrors = validateFormValues(definition, finalMap, t);
  if (validationErrors && validationErrors.length > 0) {
    return { 
      success: false, 
      message: t("Validation errors occurred."),
      errors: validationErrors
    };
  }

  // Execute custom submission handler if defined
  if (definition && typeof (definition as ReactaDefinition).submitHandlerName === 'string') {
    const submitHandler = getFormSubmissionHandler((definition as ReactaDefinition).submitHandlerName as string);

    if (submitHandler) {
      try {
        const submitResult = submitHandler(definition, finalMap, t);
        if (submitResult && submitResult.length > 0) {
          return { 
            success: false, 
            message: t("Submission failed."),
            errors: Array.isArray(submitResult) ? submitResult : [submitResult]
          };
        }
      } catch (error) {
        return {
          success: false,
          message: t("Submission handler error occurred."),
          errors: [String(error)]
        };
      }
    }
  }

  return { 
    success: true, 
    message: t("Form submitted successfully."),
    data: finalMap
  };
}

export default {
  submitForm,
};
