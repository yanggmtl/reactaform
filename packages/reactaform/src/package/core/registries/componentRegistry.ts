import BaseRegistry from "./baseRegistry";
import React, { useEffect } from "react";
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
import SliderInput from "../../components/fields/SliderInput";
import SwitchInput from "../../components/fields/SwitchInput"
import TextInput from "../../components/fields/TextInput";
import TimeInput from "../../components/fields/TimeInput";
import UnitValueInput from "../../components/fields/UnitValueInput";
import UrlInput from "../../components/fields/UrlInput";

// Registry needs to accept components with many different prop shapes.
// Narrow typing here would make registering concrete field components
// (which each declare their own props) incompatible. Allow `any` for
// the component props and document the rationale so lint stays explicit.
/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- registry holds components with varied, specific prop types */
type ComponentType = React.ComponentType<any>;

const registry = new BaseRegistry<ComponentType>();

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

const baseComponents: Record<string, ComponentType> = {
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


export function registerComponentInternal(type: string, component: ComponentType, isBaseComponent: boolean): void {

  if (!isBaseComponent && type in baseComponents) {
    console.warn(
      `Can't Overwrite Base Component type "${type}".`
    );
    return;
  }

  if (NON_DEBOUNCED_TYPES.has(type)) {
    registry.register(type, component);
    return;
  }

  type WrappedProps = {
    field?: Partial<DefinitionPropertyField>;
    onChange?: ((...args: unknown[]) => void) | undefined;
  } & Record<string, unknown>;

  const Wrapped: ComponentType = (props: WrappedProps) => {
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

    useEffect(() => {
      return () => {
        // ensure we cancel pending debounced calls on unmount
        cancel();
      };
    }, [cancel]);

    return React.createElement(component as React.ComponentType<Record<string, unknown>>, { ...props, onChange: debouncedOnChange });
  };

  registry.register(type, Wrapped);
}

export function registerComponent(type: string, component: ComponentType): void {
  registerComponentInternal(type, component, false);
}

export function getComponent(type: string): ComponentType | undefined {
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
