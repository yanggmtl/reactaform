"use client";
import React, { useEffect, useRef } from "react";
import type { BaseInputProps, DefinitionPropertyField, FieldValueType, TranslationFunction } from "reactaform";
import {
  StandardFieldLayout,
  registerFieldTypeValidationHandler,
  useReactaFormContext,
  useFieldValidator,
} from "reactaform";
import { CSS_CLASSES, combineClasses } from "reactaform";

type Point3DValue = [string, string, string];

registerFieldTypeValidationHandler('point3d', (
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction) => 
{
  void field; // unused  
  if (!Array.isArray(input) || input.length !== 3) {
    return t('Value must be a 3D point array');
  }
  const [x, y, z] = input;
  const xNum = Number(x);
  const yNum = Number(y);
  if (!Number.isFinite(xNum)) {
    return t('X must be a valid number');
  }
  
  if (!Number.isFinite(yNum)) {
    return t('Y must be a valid number');
  }

  const zNum = Number(z);
  if (!Number.isFinite(zNum)) {
    return t('Z must be a valid number');
  }

  return null;
});

const Point3DInput: React.FC<BaseInputProps<Point3DValue>> = ({
  field,
  value,
  onChange,
  onError,
  error: externalError,
}) => {
  const { t } = useReactaFormContext();

  // Important: useFieldValidator will take care of real time validation or on submit validation
  const validate = useFieldValidator(field, externalError);

  // Uncontrolled inputs: use refs and keep an `error` state.
  const xRef = useRef<HTMLInputElement | null>(null);
  const yRef = useRef<HTMLInputElement | null>(null);
  const zRef = useRef<HTMLInputElement | null>(null);
  
  const error = validate(value);

  // keep parent informed when our local error state changes
  useEffect(() => {
    onError?.(error ?? null);
  }, [error, onError]);

  const handleXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const xs = e.target.value;
    const ys = yRef.current ? yRef.current.value : "";
    const zs = zRef.current ? zRef.current.value : "";
    onChange?.([xs, ys, zs] as Point3DValue);
  };

  const handleYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ys = e.target.value;
    const xs = xRef.current ? xRef.current.value : "";
    const zs = zRef.current ? zRef.current.value : "";
    onChange?.([xs, ys, zs] as Point3DValue);
  };

  const handleZChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const zs = e.target.value;
    const xs = xRef.current ? xRef.current.value : "";
    const ys = yRef.current ? yRef.current.value : "";
    onChange?.([xs, ys, zs] as Point3DValue);
  };

  return (
    <StandardFieldLayout field={field} error={error}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          width: "100%",
          border: "1px solid var(--reactaform-border-color)",
          padding: "0.35rem",
          borderRadius: "var(--reactaform-border-radius)",
          backgroundColor: "var(--reactaform-secondary-bg)",
        }}
      >
        <input
          id={`${field.name}-x`}
          type="text"
          placeholder={t("X")}
          defaultValue={
            value && Array.isArray(value) ? String(value[0] ?? "") : undefined
          }
          ref={xRef}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.inputNumber)}
          onChange={handleXChange}
          aria-label={"X"}
        />
        <input
          id={`${field.name}-y`}
          type="text"
          placeholder={t("Y")}
          defaultValue={
            value && Array.isArray(value) ? String(value[1] ?? "") : undefined
          }
          ref={yRef}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.inputNumber)}
          onChange={handleYChange}
          aria-label={"Y"}
        />
        <input
          id={`${field.name}-z`}
          type="text"
          placeholder={t("Z")}
          defaultValue={
            value && Array.isArray(value) ? String(value[2] ?? "") : undefined
          }
          ref={zRef}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.inputNumber)}
          onChange={handleZChange}
          aria-label={"Z"}
        />
      </div>
    </StandardFieldLayout>
  );
};

export default Point3DInput;
