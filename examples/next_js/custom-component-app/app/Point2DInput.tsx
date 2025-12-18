"use client";
import * as React from "react";
import type { BaseInputProps } from "reactaform";
import { StandardFieldLayout, validateFieldValue, useReactaFormContext } from "reactaform";
import { CSS_CLASSES, combineClasses } from "reactaform";

type Point2DValue = [string, string];

const Point2DInput: React.FC<BaseInputProps<Point2DValue>> = ({ field, value, onChange, onError }) => {
  const { t, definitionName } = useReactaFormContext();

  // Uncontrolled inputs: use refs and keep an `error` state.
  const xRef = React.useRef<HTMLInputElement | null>(null);
  const yRef = React.useRef<HTMLInputElement | null>(null);
  const validate = React.useCallback((xs: string, ys: string): string | null => {
    if ((xs.trim() === "" && ys.trim() === "") ) {
      return field.required ? t('Value required') : null;
    }

    const x = xs.trim() === "" ? 0 : Number(xs);
    if (!Number.isFinite(x)) return t('Invalid X value');
    const y = ys.trim() === "" ? 0 : Number(ys);
    if (!Number.isFinite(y)) return t('Invalid Y value');

    // allow library-level validation to run as well
    const err = validateFieldValue(definitionName, field, [xs, ys], t);
    return err ?? null;
  },
    [field, definitionName, t]
  );

  // initialize error from incoming value so initial instance errors are visible
  const [error, setError] = React.useState<string | null>(() => {
    if (value && Array.isArray(value)) {
      return validate(String(value[0] ?? ""), String(value[1] ?? ""));
    }
    return null;
  });

  React.useEffect(() => {
    // sync when external value changes by setting input values on refs
    if (value && Array.isArray(value)) {
      if (xRef.current) xRef.current.value = String(value[0] ?? "");
      if (yRef.current) yRef.current.value = String(value[1] ?? "");
    }
    // Do not run validation here; validation runs on user input handlers.
  }, [value]);

  // keep parent informed when our local error state changes
  React.useEffect(() => {
    onError?.(error ?? null);
  }, [error, onError]);

  const handleXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const xs = e.target.value;
    const ys = yRef.current ? yRef.current.value : "";
    const err = validate(xs, ys);
    setError(err);
    onChange?.([xs, ys] as Point2DValue, err ?? null);
  };

  const handleYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ys = e.target.value;
    const xs = xRef.current ? xRef.current.value : "";
    const err = validate(xs, ys);
    setError(err);
    onChange?.([xs, ys] as Point2DValue, err ?? null);
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
