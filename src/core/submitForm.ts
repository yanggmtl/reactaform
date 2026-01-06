import type { ReactaDefinition, FieldValueType, ReactaInstance, TranslationFunction } from "./reactaFormTypes";
import { validateFormValues } from "../validation/validation";
import { getFormSubmissionHandler } from "./submissionHandlerRegistry";

export interface SubmitResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  errors?: string[];
}

export async function submitForm(
  definition: ReactaDefinition,
  instance: ReactaInstance | null,
  valuesMap: Record<string, FieldValueType | unknown>,
  t: TranslationFunction,
  errors: Record<string, string>
): Promise<SubmitResult> {
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
        if (schemaType === "int" || schemaType === "number" || schemaType === "float") {
          const strValue = String(raw).trim();
          if (strValue === "") {
            finalMap[propName] = 0;
          } else {
            const numValue = Number(strValue);
            if (isNaN(numValue)) {
              transformationErrors.push(t(`Invalid number format for field {{1}}`, prop.displayName || propName));
            } else {
              finalMap[propName] = numValue;
            }
          }
        } else if (schemaType === "int-array" || schemaType === "float-array") {
          const arr = String(raw)
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);
          
          const numArr: number[] = [];
          let hasError = false;
          
          for (const v of arr) {
            const num = Number(v);
            if (isNaN(num)) {
              transformationErrors.push(t(`Invalid number {{1}} in array for field {{2}}`, v, prop.displayName || propName));
              hasError = true;
              break;
            }
            numArr.push(num);
          }
          
          if (!hasError) {
            finalMap[propName] = numArr;
          }
        }
      } catch (error) {
        transformationErrors.push(t(`Error processing field {{1}}: {{2}}`, prop.displayName || propName, error instanceof Error ? error.message : String(error)));
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
  const validationErrors = await validateFormValues(definition, finalMap, t);
  if (validationErrors && validationErrors.length > 0) {
    return {
      success: false,
      message: t("Validation failed"),
      errors: validationErrors,
    };
  }

  // Execute custom submission handler if defined
  if (definition && typeof definition.submitHandlerName === 'string') {
    const submitHandler = getFormSubmissionHandler(definition.submitHandlerName);

    if (submitHandler) {
      try {
        const submitResult = await submitHandler(definition, instance?.name ?? null, finalMap, t);
        if (submitResult && submitResult.length > 0) {
          return { 
            success: false, 
            message: t("Submission failed"),
            errors: Array.isArray(submitResult) ? submitResult : [String(submitResult)]
          };
        }
      } catch (error) {
        return {
          success: false,
          message: t("Submission handler error occurred"),
          errors: [String(error instanceof Error ? error.message : error)]
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

export default submitForm;
