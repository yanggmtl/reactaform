import * as React from "react";

import type { BaseInputProps } from "../../core/reactaFormTypes";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";

import useReactaFormContext from "../../hooks/useReactaFormContext";
import { StandardFieldLayout } from "../LayoutComponents";

import { validateField } from "../../validation/validation";

import PopupOptionMenu from "../PopupOptionMenu";
import type { PopupOptionMenuPosition } from "../PopupOptionMenu";
import { unitsByDimension } from "../../utils/unitValueMapper";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";

// ========== Unit Types
type Dimension =
  | "length"
  | "area"
  | "volume"
  | "weight"
  | "time"
  | "temperature"
  | "angle";

type UnitFactors = {
  default: string;
  units: string[];
  factors: Record<string, number>;
};

type UnitValueInputProps = BaseInputProps<[string | number, string], DefinitionPropertyField>;

interface UnitOption {
  label: string;
  value: string;
  unit: string;
}

interface GenericUnitValueInputProps extends UnitValueInputProps {
  dimension: Dimension;
  unitFactors: UnitFactors;
}

// unitFactorsMap, a cache of loaded unit factors for dimensions
// initialized as empty; populated on demand
const unitFactorsMap: Record<string, UnitFactors> = {};

// populate unitFactorsMap for the given dimension
function loadUnitFactorsMap(dimension: string): void {
  if (dimension in unitFactorsMap) {
    return;
  }
  // Build unit factors and labels from the merged `unitsByDimension` map
  const unitsForDim = unitsByDimension[dimension] ?? {};

  const factorsMap: Record<string, number> = {};
  const unitKeys: string[] = [];

  // Preserve ordering from the original `dimensionUnitsMap` when possible by iterating unitsForDim in insertion order
  for (const [u, info] of Object.entries(unitsForDim)) {
    if (typeof info.factor === "number") factorsMap[u] = info.factor;
    unitKeys.push(u);
  }

  const preferredDefault = Object.keys(unitsForDim)[0] ?? "";
  unitFactorsMap[dimension as Dimension] = {
    default: preferredDefault,
    units: unitKeys,
    factors: factorsMap,
  };
}

// Unit Functions
function getTemperatureConvertValue(
  fromUnit: string,
  toUnit: string,
  value: number
): number {
  if (fromUnit === "C") {
    if (toUnit === "F") return value * (9 / 5) + 32;
    if (toUnit === "K") return value + 273.15;
  } else if (fromUnit === "F") {
    if (toUnit === "C") return ((value - 32) * 5) / 9;
    if (toUnit === "K") return ((value - 32) * 5) / 9 + 273.15;
  } else if (fromUnit === "K") {
    if (toUnit === "C") return value - 273.15;
    if (toUnit === "F") return ((value - 273.15) * 9) / 5 + 32;
  }
  return value;
}

function getConvertedOptions(
  value: number,
  unit: string,
  unitFactors: UnitFactors,
  isTemperature: boolean
): UnitOption[] {
  // If input value is not a finite number, no conversion can be performed
  if (!Number.isFinite(value)) return [];

  if (isTemperature) {
    // For temperature, iterate over available units (labels) and use special conversion
    return unitFactors.units.map((toUnit) => {
      const convertedValue = getTemperatureConvertValue(unit, toUnit, value);
      if (!Number.isFinite(convertedValue)) {
        return { label: `${String(convertedValue)} ${toUnit}`, value: String(convertedValue), unit: toUnit };
      }
      return { label: `${convertedValue.toFixed(6)} ${toUnit}`, value: convertedValue.toString(), unit: toUnit };
    });
  }

  const selectedFactor = unitFactors.factors[unit];
  if (selectedFactor === undefined) return [];

  return (Object.entries(unitFactors.factors) as [string, number][]).map(([toUnit, toFactor]) => {
    const convertedValue = (value / selectedFactor) * toFactor;
    if (!Number.isFinite(convertedValue)) {
      return { label: `${String(convertedValue)} ${toUnit}`, value: String(convertedValue), unit: toUnit };
    }
    return { label: `${convertedValue.toFixed(6)} ${toUnit}`, value: convertedValue.toString(), unit: toUnit };
  });
}

function normalizeUnit(
  inputUnit: string,
  unitFactors: UnitFactors,
  reverseLabels: Record<string, string>
): string | null {
  // If input matches a unit key, accept it
  if (unitFactors.factors[inputUnit] !== undefined || unitFactors.units.includes(inputUnit)) return inputUnit;
  // If input matches a friendly display name, map it back to the unit key
  if (reverseLabels[inputUnit]) return reverseLabels[inputUnit];
  return null;
}

const GenericUnitValueInput: React.FC<GenericUnitValueInputProps> = React.memo(({
  dimension,
  unitFactors,
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();
  const value0 = value?.[0];
  const value1 = value?.[1];
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const selectRef = React.useRef<HTMLSelectElement | null>(null);
  const [localInput, setLocalInput] = React.useState<string | null>(null);
  const [showMenu, setShowMenu] = React.useState<boolean>(false);
  const [menuPosition, setMenuPosition] =
    React.useState<PopupOptionMenuPosition | null>(null);
  const [menuOptions, setMenuOptions] = React.useState<UnitOption[]>([]);

  const validate = React.useCallback(
    (input: string, unit: string): string | null => {
      return validateField(definitionName, field, [input, unit], t);
    },
    [definitionName, field, t]
  );

  // Locale-safe labels: computed from unit codes and current `t`.
  const unitLabels = React.useMemo<Record<string, string>>(() => {
    return Object.fromEntries(unitFactors.units.map((u) => [u, t(u)]));
  }, [unitFactors.units, t]);

  // Reverse lookup from translated label -> unit code (for backwards-compat inputs)
  const reverseLabels = React.useMemo<Record<string, string>>(() => {
    return Object.fromEntries(unitFactors.units.map((u) => [t(u), u]));
  }, [unitFactors.units, t]);

  const unitOptionElements = React.useMemo(
    () =>
      unitFactors.units.map((u) => (
        <option key={u} value={u}>
          {unitLabels[u] ?? u}
        </option>
      )),
    [unitFactors.units, unitLabels]
  );

  const prevErrorRef = React.useRef<string | null>(null);
  const onErrorRef = React.useRef<GenericUnitValueInputProps["onError"] | undefined>(
    onError
  );
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Single effect to sync props, validate, and update DOM - prevents duplicate validation
  React.useEffect(() => {
    const val = String(value0 ?? "");
    const rawUnit = String(value1 ?? unitFactors.default);
    const unit = normalizeUnit(rawUnit, unitFactors, reverseLabels) || rawUnit;

    // Validate only once per props change
    const err = validate(val, unit);
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      setError(err);
      onErrorRef.current?.(err ?? null);
    }

    // If the user is currently interacting with the input/select (focused),
    // avoid overwriting their edits. Otherwise update DOM values directly.
    const active = document.activeElement;
    if (active === inputRef.current || active === selectRef.current) {
      return;
    }

    if (inputRef.current && inputRef.current.value !== val) inputRef.current.value = val;
    if (selectRef.current && selectRef.current.value !== unit) selectRef.current.value = unit;
    
    // Clear transient local edits when props change
    setLocalInput(null);
  }, [value0, value1, unitFactors, reverseLabels, validate]);
  // Do NOT call onChange here: this effect synchronizes internal state from props.
  // Calling onChange would notify parent and can cause an update loop when parent
  // echoes the value back into props. Only user interactions should call onChange.

  const responseParentOnChange = React.useCallback(
    (value: string, unit: string, error: string | null) => {
      const finalUnit = reverseLabels[unit] || unit;
      const finalValue: [string, string] = [value, finalUnit];
      onChange?.(finalValue, error);
    },
    [reverseLabels, onChange]
  );

  const onValueChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const unit = selectRef.current ? selectRef.current.value : unitFactors.default;
    const err = validate(input, unit);
    setLocalInput(input);
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      setError(err);
      onErrorRef.current?.(err ?? null);
    }
    responseParentOnChange(input, unit, err);
  }, [unitFactors.default, validate, responseParentOnChange]);

  const onUnitChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value;
    const valueStr = inputRef.current ? inputRef.current.value : String(value0 ?? "");
    const err = validate(valueStr, newUnit);
    if (selectRef.current) selectRef.current.value = newUnit;
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      setError(err);
      onErrorRef.current?.(err ?? null);
    }
    responseParentOnChange(valueStr, newUnit, err);
  }, [value0, validate, responseParentOnChange]);

  const onConvertButtonClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    // Guard: don't open the conversion menu when conversion is disabled
    const val = inputRef.current ? inputRef.current.value : String(value0 ?? "");
    const parsedValue = parseFloat(val);
    const unit = selectRef.current ? selectRef.current.value : unitFactors.default;
    const localErr = validate(val, unit);
    if (localErr || !val.trim() || !Number.isFinite(parsedValue)) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left;
    const y = rect.bottom;

    setMenuPosition({ x, y });

    const convertedOptions = getConvertedOptions(parsedValue, unit, unitFactors, dimension === "temperature");
    if (convertedOptions.length === 0) {
      setMenuOptions([]);
      setShowMenu(false);
      return;
    }

    setMenuOptions(convertedOptions);
    setShowMenu((prev) => !prev);
  }, [value0, unitFactors, validate, dimension]);

  const onConversionMenuSelect = React.useCallback((option: UnitOption) => {
    const { value: newVal, unit: newUnit } = option;

    // Close menu first
    setShowMenu(false);
    setMenuPosition(null);

    // Update DOM elements (since this is an uncontrolled component)
    if (inputRef.current) {
      inputRef.current.value = newVal;
    }
    if (selectRef.current) {
      selectRef.current.value = newUnit;
    }

    // Update local state to track the conversion
    setLocalInput(newVal);

    // Validate the new values
    const err = validate(newVal, newUnit);

    // Notify parent of the change
    responseParentOnChange(newVal, newUnit, err);
  }, [validate, responseParentOnChange]);

  const propInputForValidation = String(value[0] ?? "");

  const inputForValidation = localInput ?? propInputForValidation;
  // unitForValidation intentionally unused after moving validation to `error` state
  const disableConversion = Boolean(error) || !inputForValidation.trim();

  // Dark mode aware button styling
  const convertButtonStyle = React.useMemo(() => ({
    width: "var(--reactaform-unit-btn-width, 2.5em)",
    height: "var(--reactaform-unit-btn-height, 2.5em)",
    padding: "var(--reactaform-unit-btn-padding, 0)",
    border: "none",
    borderRadius: "var(--reactaform-button-border-radius, var(--reactaform-border-radius, 0.25em))",
    backgroundColor: disableConversion
      ? "var(--reactaform-button-disabled-bg, #cccccc)"
      : "var(--reactaform-button-bg, var(--reactaform-success-color))",
    color: "var(--reactaform-button-text, #ffffff)",
    cursor: disableConversion ? "var(--reactaform-button-disabled-cursor, not-allowed)" : "pointer",
    opacity: disableConversion ? Number("var(--reactaform-button-disabled-opacity, 0.6)") : 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as const), [disableConversion]);

  const normalizedDefaultUnit = React.useMemo(() => {
    const rawUnit = String(value1 ?? unitFactors.default);
    return normalizeUnit(rawUnit, unitFactors, reverseLabels) || rawUnit;
  }, [value1, unitFactors, reverseLabels]);

  return (
    <StandardFieldLayout field={field} error={error}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--reactaform-unit-gap, 8px)", width: "100%" }}>
        <input
          id={field.name}
          type="text"
          ref={inputRef}
          defaultValue={String(value[0] ?? "")}
          onChange={onValueChange}
          style={{ width: "var(--reactaform-unit-input-width, 100px)" }}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.name}-error` : undefined}
        />

        {/* Units dropdown */}
        <select
          id={`${field.name}-unit`}
          ref={selectRef}
          defaultValue={normalizedDefaultUnit}
          onChange={onUnitChange}
          className={combineClasses(
            CSS_CLASSES.input,
            CSS_CLASSES.inputSelect
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.name}-error` : undefined}
        >
          {unitOptionElements}
        </select>

        {/* Conversion button */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            onClick={onConvertButtonClick}
            aria-disabled={disableConversion}
            disabled={disableConversion}
            style={convertButtonStyle}
            className={CSS_CLASSES.button}
          >
            <span
              style={{
                fontSize: "var(--reactaform-unit-btn-icon-size, 1em)",
                lineHeight: "1",
                transform: "translateY(-1px)",
                pointerEvents: "none",
              }}
            >
              {"\u27F7"}
            </span>
          </button>

          {showMenu && menuOptions.length > 0 && (
            <PopupOptionMenu<UnitOption>
              pos={menuPosition}
              options={menuOptions}
              onClose={() => {
                setMenuPosition(null);
                setShowMenu(false);
              }}
              onClickOption={onConversionMenuSelect}
            />
          )}
        </div>
      </div>
    </StandardFieldLayout>
  );
});

const UnitValueInput = React.memo(({ field, value, onChange }: UnitValueInputProps) => {
  const dimension = (field as DefinitionPropertyField & { dimension?: Dimension }).dimension;
  if (!dimension) return null;
  if (!unitFactorsMap[dimension]) {
    loadUnitFactorsMap(dimension);
  }

  const unitFactors = unitFactorsMap[dimension];
  if (!unitFactors) {
    return null;
  }

  return (
    <GenericUnitValueInput
      dimension={dimension}
      unitFactors={unitFactors}
      field={field}
      value={value}
      onChange={onChange}
    />
  );
});

export default UnitValueInput;
