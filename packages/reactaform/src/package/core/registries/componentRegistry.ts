/* eslint-disable @typescript-eslint/no-explicit-any */

import BaseRegistry from "./baseRegistry";
import React, { useEffect } from "react";
import type { DefinitionPropertyField } from "../reactaFormTypes";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";

import CheckboxInput from "../../components/fields/CheckboxInput";
import SwitchInput from "../../components/fields/SwitchInput"
import ColorInput from "../../components/fields/ColorInput";
import DateInput from "../../components/fields/DateInput";
import DateTimeInput from "../../components/fields/DateTimeInput";
import EmailInput from "../../components/fields/EmailInput";
import FloatInput from "../../components/fields/FloatInput";
import FloatArrayInput from "../../components/fields/FloatArrayInput";
import FieldSeparator from "../../components/fields/Separator";
import ImageDisplay from "../../components/fields/ImageDisplay";
import IntegerInput from "../../components/fields/IntegerInput";
import IntegerArrayInput from "../../components/fields/IntegerArrayInput";
import MultiSelect from "../../components/fields/MultiSelection";
import RadioInput from "../../components/fields/RadioInput";
import DropdownInput from "../../components/fields/DropdownInput";
import PhoneInput from "../../components/fields/PhoneInput";
import SliderInput from "../../components/fields/SliderInput";
import TextInput from "../../components/fields/TextInput";
import TimeInput from "../../components/fields/TimeInput";
import UnitValueInput from "../../components/fields/UnitValueInput";
import RatingInput from "../../components/fields/RatingInput";
import FileInput from "../../components/fields/FileInput";
import UrlInput from "../../components/fields/UrlInput";
import NumericStepperInput from "../../components/fields/NumericStepperInput";
import MultilineTextInput from "../../components/fields/MultilineTextInput";

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

export function registerComponent(type: string, component: ComponentType): void {

  if (NON_DEBOUNCED_TYPES.has(type)) {
    registry.register(type, component);
    return;
  }

  type WrappedProps = {
    field?: Partial<DefinitionPropertyField> & { debounceMs?: number };
    onChange?: ((...args: unknown[]) => void) | undefined;
  } & Record<string, unknown>;

  const Wrapped: ComponentType = (props: WrappedProps) => {
    // Allow per-field override via `field.debounceMs`; default to 200ms.
    const wait = (props.field?.debounceMs as number) ?? 200;
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

export function getComponent(type: string): ComponentType | undefined {
  return registry.get(type);
}

export function listComponents(): string[] {
  return registry.list();
}

let baseComponentRegistered = false;
export function registerBaseComponents(): void {
  if (baseComponentRegistered) return;

  const baseComponents: Record<string, ComponentType> = {
    checkbox: CheckboxInput,
    color: ColorInput,
    date: DateInput,
    "date-time": DateTimeInput,
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

  Object.entries(baseComponents).forEach(([type, component]) => {
    registerComponent(type, component);
  });

  baseComponentRegistered = true;
}

export default registry;
