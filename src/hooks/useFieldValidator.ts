import * as React from 'react';
import useReactaFormContext from './useReactaFormContext';
import { validateField } from '../validation/validation';
import type { DefinitionPropertyField, FieldValueType } from '../core/reactaFormTypes';

export type ValidationTrigger = 'change' | 'blur' | 'sync';

export function useFieldValidator(field: DefinitionPropertyField, externalError?: string | null) {
  const { definitionName, t, fieldValidationMode } = useReactaFormContext();
  return React.useCallback(
    (value: FieldValueType, trigger: ValidationTrigger = 'change') => {
      if (fieldValidationMode === 'onEdit' || fieldValidationMode === 'realTime') {
        return validateField(definitionName, field, value, t);
      }

      if (fieldValidationMode === 'onBlur') {
        return trigger === 'blur'
          ? validateField(definitionName, field, value, t)
          : externalError ?? null;
      }

      return externalError ?? null;
    },
    [definitionName, field, t, fieldValidationMode, externalError]
  );
}
