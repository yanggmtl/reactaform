# Custom Components

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
import React, { useEffect, useRef } from "react";
import type { BaseInputProps, DefinitionPropertyField, FieldValueType, TranslationFunction } from "reactaform";
import { StandardFieldLayout, useReactaFormContext, useFieldValidator } from "reactaform";
import { registerFieldTypeValidationHandler } from "reactaform";
import { CSS_CLASSES, combineClasses } from "reactaform";

type Point2DValue = [string, string];

// Define a FieldTypeValidationHandler to process validation for the new type
// For example: following validation handler is registered for type point2d
// When field validate called, this type validator will be invoked.
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

  // For each component, two field validation modes are supported:
  //    realTime:     field validation happens when field is in edit
  //    onSubmission: field validation happens in submission process
  // Important: useFieldValidator will take care of real time validation or on submit validation
  const validate = useFieldValidator(field, externalError);

  // Uncontrolled inputs: use refs
  const xRef = useRef<HTMLInputElement | null>(null);
  const yRef = useRef<HTMLInputElement | null>(null);

  // Call field validate to check whether there is error
  const error = validate(value)

  // keep parent informed when local error change
  useEffect(() => {
    onError?.(error ?? null);
  }, [error, onError]);

  // Process X input change
  const handleXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const xs = e.target.value;
    const ys = yRef.current ? yRef.current.value : "";
    onChange?.([xs, ys] as Point2DValue);
  };

  // Process Y input change
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
```

## Step 2: Register with registerComponent

```ts
// Register the custom component under type 'point2d' in your app.
registerComponent("point2d", Point2DInput);

```

## Step 3: Create an example definition using the component

```ts
const rectDef: ReactaDefinition = {
{
  "name": "point2dDemo",
  "displayName": "Point2D Custom Component Demo",
  "version": "1.0.0",
  "properties": [
    {
      "type": "point2d",
      "name": "topLeft",
      "displayName": "Top Left",
      "defaultValue": [
        "0",
        "0"
      ],
      "required": true
    },
    {
      "type": "point2d",
      "name": "bottomRight",
      "displayName": "bottomRight",
      "defaultValue": [
        "640",
        "480"
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
    "topLeft": [
      "10",
      "20",
    ],
    "bottomRight": [
      "300",
      "200",
    ],
  }
};

export default function App() {
  return (
    <div className="app">
      <h2>Custom Component: Point2D</h2>
      <ReactaForm definitionData={rectDef} instance={instance} />
    </div>
  );
}
```
