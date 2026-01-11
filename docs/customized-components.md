# Customized Components

Customized components allow you to extend **ReactaForm** with your own field types while fully integrating with its validation, layout, localization, and builder ecosystem. This enables you to model complex data structures, create specialized inputs, and maintain a consistent form experience across your application.

In this guide, you’ll learn how to:

- Implement a custom React input component
- Register the new component in your app.

  Then you can use this component the same as other built-in components.

- Define an example JSON schema using the new component
- Use the definition in a form with an instance

The following example demonstrates a **Point2D** component that captures a pair of values [`X`, `Y`] and validates them as a single value.

## Step 1: Implement Component

```ts
import React, { useCallback, useEffect, useRef, useState } from "react";
import type { BaseInputProps } from "reactaform";
import { StandardFieldLayout, validateFieldValue, useReactaFormContext } from "reactaform";
import { CSS_CLASSES, combineClasses } from "reactaform";

type Point2DValue = [string, string];

const Point2DInput: React.FC<BaseInputProps<Point2DValue>> = ({ field, value, onChange, onError }) => {
  const { t, definitionName } = useReactaFormContext();

  // Uncontrolled inputs: use refs and keep an `error` state.
  const xRef = useRef<HTMLInputElement | null>(null);
  const yRef = useRef<HTMLInputElement | null>(null);
  const validate = useCallback((xs: string, ys: string): string | null => {
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
  const [error, setError] = useState<string | null>(() => {
    if (value && Array.isArray(value)) {
      return validate(String(value[0] ?? ""), String(value[1] ?? ""));
    }
    return null;
  });

  useEffect(() => {
    // sync when external value changes by setting input values on refs
    if (value && Array.isArray(value)) {
      if (xRef.current) xRef.current.value = String(value[0] ?? "");
      if (yRef.current) yRef.current.value = String(value[1] ?? "");
    }
    // Do not run validation here; validation runs on user input handlers.
  }, [value]);

  // keep parent informed when our local error state changes
  useEffect(() => {
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
```

## Step 2: Register with registerComponent

```ts
// Register the custom component under type 'point2d' in your app.
registerComponent("point2d", Point2DInput);

```

## Step 3: Create a example definition using the component

```ts
const point2DDef: ReactaDefinition = {
{
  "name": "point2dDemo",
  "displayName": "Point2D Custom Component Demo",
  "version": "1.0.0",
  "properties": [
    {
      "type": "point2d",
      "name": "position",
      "displayName": "Position",
      "defaultValue": [
        "0",
        "0"
      ],
      "required": true
    }
  ]
};
```

## Step 4: Use in Form Definition

```ts
// Register the custom component under type 'point2d'
registerComponent("point2d", Point2DInput);

// Create instance data or get it from server
const instance = 
{
  "name": "pos1",
  "version": "1.0.0",
  "definition": "point2dDemo",
  "values": {
    "position": [
      "10",
      "20"
    ]
  }
};

export default function App() {
  return (
    <div className="app">
      <h2>Custom Component: Point2D</h2>
      <ReactaForm definitionData={point2DDef} instance={instance} />
    </div>
  );
}
```
