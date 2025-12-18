import BaseRegistry from "./baseRegistry";
import * as React from "react";
import type { DefinitionPropertyField } from "../reactaFormTypes";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";

import CheckboxInput from "../../components/fields/CheckboxInput";
import ColorInput from "../../components/fields/ColorInput";
import DateInput from "../../components/fields/DateInput";
import DropdownInput from "../../components/fields/DropdownInput";
import EmailInput from "../../components/fields/EmailInput";
import FieldSeparator from "../../components/fields/Separator";
import FileInput from "../../components/fields/FileInput";
import FloatArrayInput from "../../components/fields/FloatArrayInput";
import FloatInput from "../../components/fields/FloatInput";
import ImageDisplay from "../../components/fields/ImageDisplay";
import IntegerArrayInput from "../../components/fields/IntegerArrayInput";
import IntegerInput from "../../components/fields/IntegerInput";
import MultilineTextInput from "../../components/fields/MultilineTextInput";
import MultiSelect from "../../components/fields/MultiSelection";
import NumericStepperInput from "../../components/fields/NumericStepperInput";
import PhoneInput from "../../components/fields/PhoneInput";
import RadioInput from "../../components/fields/RadioInput";
import RatingInput from "../../components/fields/RatingInput";
import PasswordInput from "../../components/fields/PasswordInput";
import SliderInput from "../../components/fields/SliderInput";
import SwitchInput from "../../components/fields/SwitchInput";
import TextInput from "../../components/fields/TextInput";
import TimeInput from "../../components/fields/TimeInput";
import UnitValueInput from "../../components/fields/UnitValueInput";
import UrlInput from "../../components/fields/UrlInput";

// IMPORTANT: This registry is part of the public API surface.
// Do not expose React types (e.g. `React.ComponentType`) from here, because
// the emitted `.d.ts` can become coupled to the consumer's React typings
// and cause friction across React 18/19 setups.
type RegisteredComponent = unknown;

const registry = new BaseRegistry<RegisteredComponent>();

// Only apply debouncing for a subset of interactive input types where
// rapid or repeated events are common and we want to stabilize updates.
const NON_DEBOUNCED_TYPES = new Set([
  "checkbox",
  "switch",
  "dropdown",
  "radio",
  "multi-selection",
  "slider",
  "stepper",
  "color",
  "rating",
]);

const baseComponents: Record<string, RegisteredComponent> = {
  checkbox: CheckboxInput,
  color: ColorInput,
  date: DateInput,
  dropdown: DropdownInput,
  email: EmailInput,
  file: FileInput,
  float: FloatInput,
  "float-array": FloatArrayInput,
  image: ImageDisplay,
  int: IntegerInput,
  "int-array": IntegerArrayInput,
  "multi-selection": MultiSelect,
  "multiline": MultilineTextInput,
  password: PasswordInput,
  phone: PhoneInput,
  radio: RadioInput,
  rating: RatingInput,
  separator: FieldSeparator,
  slider: SliderInput,
  string: TextInput,
  stepper: NumericStepperInput,
  switch: SwitchInput,
  text: TextInput,
  time: TimeInput,
  unit: UnitValueInput,
  url: UrlInput,
};
export function registerComponentInternal(
  type: string,
  component: unknown,
  isBaseComponent: boolean
): void {

  const typedComponent = component as RegisteredComponent;

  if (!isBaseComponent && type in baseComponents) {
    console.warn(
      `Can't Overwrite Base Component type "${type}".`
    );
    return;
  }

  if (NON_DEBOUNCED_TYPES.has(type)) {
    registry.register(type, typedComponent);
    return;
  }

  type WrappedProps = {
    field?: Partial<DefinitionPropertyField>;
    onChange?: ((...args: unknown[]) => void) | undefined;
  } & Record<string, unknown>;

  const Wrapped = (props: WrappedProps) => {
    // Default debounce to 200ms
    const wait = 200;
    const { callback: debouncedOnChange, cancel } = useDebouncedCallback(
      (...args: unknown[]) => {
        const onChange = props.onChange;
        if (typeof onChange === "function") {
          onChange(...args);
        }
      },
      wait
    );

    React.useEffect(() => {
      return () => {
        // ensure we cancel pending debounced calls on unmount
        cancel();
      };
    }, [cancel]);

    return React.createElement(
      // Registry stores arbitrary component shapes; runtime expects a valid React element type.
      typedComponent as React.ElementType,
      { ...props, onChange: debouncedOnChange }
    );
  };

  registry.register(type, Wrapped);
}

export function registerComponent(type: string, component: unknown): void {
  registerComponentInternal(type, component, false);
}

export function getComponent(type: string): unknown {
  return registry.get(type);
}

export function listComponents(): string[] {
  return registry.list();
}

let baseComponentRegistered = false;
export function registerBaseComponents(): void {
  if (baseComponentRegistered) return;

  Object.entries(baseComponents).forEach(([type, component]) => {
    registerComponentInternal(type, component, true);
  });

  baseComponentRegistered = true;
}

export default registry;
