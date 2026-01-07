import * as React from 'react';
import useReactaFormContext from './useReactaFormContext';
import { validateField } from '../validation/validation';
import type { DefinitionPropertyField, FieldValueType } from '../core/reactaFormTypes';

export function useFieldValidator(field: DefinitionPropertyField, externalError?: string | null) {
  const { definitionName, t, fieldValidationMode } = useReactaFormContext();
  return React.useCallback(
    (value: FieldValueType) => 
      fieldValidationMode === "realTime" ? validateField(definitionName, field, value, t) : externalError ?? null,
    [definitionName, field, t, fieldValidationMode, externalError]
  );
}
