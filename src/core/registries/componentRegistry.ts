import BaseRegistry from "./baseRegistry";
import * as React from "react";
import type { DefinitionPropertyField } from "../reactaFormTypes";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";
import { DEBOUNCE_CONFIG, DebounceConfig } from "./debounceConfig";
import { IS_TEST_ENV } from "./debounceEnv";

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

type WrappedProps = {
  field?: Partial<DefinitionPropertyField>;
  onChange?: ((...args: unknown[]) => void) | undefined;
} & Record<string, unknown>;

function wrapWithDebounce(
  Component: RegisteredComponent,
  config: Exclude<DebounceConfig, false>
): RegisteredComponent {
  if (IS_TEST_ENV) {
    // No debounce in test environment
    return Component;
  }
  
  const { wait = 200, leading, trailing } = config;

  const Wrapped = React.memo((props: WrappedProps) => {
    const onChangeRef = React.useRef(props.onChange);

    React.useEffect(() => {
      onChangeRef.current = props.onChange;
    }, [props.onChange]);

    const { callback, cancel } = useDebouncedCallback(
      (...args: unknown[]) => {
        onChangeRef.current?.(...args);
      },
      wait,
      { leading, trailing }
    );

    React.useEffect(() => cancel, [cancel]);

    return React.createElement(
      Component as React.ElementType,
      { ...props, onChange: callback }
    );
  });

  Wrapped.displayName = "DebouncedFieldWrapper";
  return Wrapped;
}

export function registerComponentInternal(
  type: string,
  component: unknown,
  isBaseComponent: boolean
): void {
  const typedComponent = component as RegisteredComponent;

  if (!isBaseComponent && type in baseComponents) {
    console.warn(`Can't overwrite base component type "${type}".`);
    return;
  }

  const debounceConfig = DEBOUNCE_CONFIG[type];

  // No debounce → register directly
  if (debounceConfig === false) {
    registry.register(type, typedComponent);
    return;
  }

  // Debounced (explicit or default)
  const effectiveConfig =
    debounceConfig ?? { wait: 200 };

  registry.register(
    type,
    wrapWithDebounce(typedComponent, effectiveConfig)
  );
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
