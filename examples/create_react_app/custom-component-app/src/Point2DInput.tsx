import React, { useEffect, useRef } from "react";
import type { BaseInputProps, DefinitionPropertyField, FieldValueType, TranslationFunction } from "reactaform";
import { StandardFieldLayout, useReactaFormContext, useFieldValidator } from "reactaform";
import { registerFieldTypeValidationHandler } from "reactaform";
import { CSS_CLASSES, combineClasses } from "reactaform";

type Point2DValue = [string, string];

registerFieldTypeValidationHandler('point2d', (
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction) => 
{
  void field; // unused  
  if (!Array.isArray(input) || input.length !== 2) {
    return t('Value must be a 2D point array');
  }
  const [x, y] = input;
  const xNum = Number(x);
  const yNum = Number(y);
  if (!Number.isFinite(xNum)) {
    return t('X must be a valid number');
  }
  
  if (!Number.isFinite(yNum)) {
    return t('Y must be a valid number');
  }
  return null;
});

const Point2DInput: React.FC<BaseInputProps<Point2DValue>> = ({ field, value, onChange, onError, error: externalError }) => {
  const { t } = useReactaFormContext();

  // Important: useFieldValidator will take care of real time validation or on submit validation
  const validate = useFieldValidator(field, externalError);

  // Uncontrolled inputs: use refs and keep an `error` state.
  const xRef = useRef<HTMLInputElement | null>(null);
  const yRef = useRef<HTMLInputElement | null>(null);

  const error = validate(value)

  // keep parent informed when our local error state changes
  useEffect(() => {
    onError?.(error ?? null);
  }, [error, onError]);

  const handleXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const xs = e.target.value;
    const ys = yRef.current ? yRef.current.value : "";
    onChange?.([xs, ys] as Point2DValue);
  };

  const handleYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ys = e.target.value;
    const xs = xRef.current ? xRef.current.value : "";
    onChange?.([xs, ys] as Point2DValue);
  };

  return (
    <StandardFieldLayout field={field} error={error}>
      <input
        id={`${field.name}-x`}
        type="text"
        placeholder={t('X')}
        defaultValue={value && Array.isArray(value) ? String(value[0] ?? "") : undefined}
        ref={xRef}
        onChange={handleXChange}
        className={combineClasses( CSS_CLASSES.input, CSS_CLASSES.inputNumber)}
        aria-label={'X'}
      />
      <input
        id={`${field.name}-y`}
        type="text"
        placeholder={t('Y')}
        defaultValue={value && Array.isArray(value) ? String(value[1] ?? "") : undefined}
        ref={yRef}
        onChange={handleYChange}
        aria-label={'Y'}
        className={combineClasses( CSS_CLASSES.input, CSS_CLASSES.inputNumber)}
      />
    </StandardFieldLayout>
  );
};

export default Point2DInput;
