import { useState, useEffect, useCallback, useRef } from "react";
import type { ChangeEvent, MouseEvent, FC } from "react";

import type { BaseInputProps } from "../../core/reactaFormTypes";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";

import useReactaFormContext from "../../hooks/useReactaFormContext";
import { StandardFieldLayout } from "../LayoutComponents";

import Tooltip from "../Tooltip";
import { validateFieldValue } from "../../core/validation";

import PopupOptionMenu from "../PopupOptionMenu";
import type { PopupOption, PopupOptionMenuPosition } from "../PopupOptionMenu";
import {
  dimensionUnitShortDisplayMap,
  dimensonUnitFactorsMap,
} from "../../utils/unitValueMapper";
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
  factors: Record<string, number>;
  labels: Record<string, string>;
  reverseLabels?: Record<string, string>;
};

export interface UnitValueField extends DefinitionPropertyField {
  dimension: Dimension;
  displayName: string;
  validationHandlerName?: string;
  tooltip?: string;
  required?: boolean;
}

type UnitValueInputProps = BaseInputProps<
  [string | number, string],
  UnitValueField
>;

interface UnitOption extends PopupOption {
  label: string;
  value: string;
  unit: string;
}

interface GenericUnitValueInputProps extends UnitValueInputProps {
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
  // Dynamically load unit factors for the given dimension if available
  const factorsMap = dimensonUnitFactorsMap[dimension];
  const labelsMap = dimensionUnitShortDisplayMap[dimension];
  const reverseLabelsMap: Record<string, string> = Object.fromEntries(
    Object.entries(labelsMap).map(([label, code]) => [code, label])
  );

  if (factorsMap) {
    unitFactorsMap[dimension as Dimension] = {
      default: Object.keys(factorsMap)[0],
      factors: factorsMap,
      labels: labelsMap,
      reverseLabels: reverseLabelsMap,
    };
  } else {
    unitFactorsMap[dimension as Dimension] = {
      default: "",
      factors: {},
      labels: {},
      reverseLabels: {},
    };
  }
}

// Unit Functions
function getTemperatureConvertValue(
  fromUnit: string,
  toUnit: string,
  value: number
): number {
  if (fromUnit === "°C") {
    if (toUnit === "°F") return value * (9 / 5) + 32;
    if (toUnit === "K") return value + 273.15;
  } else if (fromUnit === "°F") {
    if (toUnit === "°C") return ((value - 32) * 5) / 9;
    if (toUnit === "K") return ((value - 32) * 5) / 9 + 273.15;
  } else if (fromUnit === "K") {
    if (toUnit === "°C") return value - 273.15;
    if (toUnit === "°F") return ((value - 273.15) * 9) / 5 + 32;
  }
  return value;
}

function getConvertedOptions(
  value: number,
  unit: string,
  unitFactors: UnitFactors
): UnitOption[] {
  // If input value is not a finite number, no conversion can be performed
  if (!Number.isFinite(value)) return [];

  const selectedFactor = unitFactors.factors[unit];
  if (selectedFactor === undefined) return [];
  const isTemperature = unitFactors === unitFactorsMap.temperature;

  return (Object.entries(unitFactors.factors) as [string, number][]).map(
    ([toUnit, toFactor]) => {
      const convertedValue = isTemperature
        ? getTemperatureConvertValue(unit, toUnit, value)
        : (value / selectedFactor) * toFactor;

      if (!Number.isFinite(convertedValue)) {
        return {
          label: `${String(convertedValue)} ${toUnit}`,
          value: String(convertedValue),
          unit: toUnit,
        };
      }

      return {
        label: `${convertedValue.toFixed(6)} ${toUnit}`,
        value: convertedValue.toString(),
        unit: toUnit,
      };
    }
  );
}

function normalizeUnit(
  inputUnit: string,
  unitFactors: UnitFactors
): string | null {
  // Check if it"s a label
  const match = Object.entries(unitFactors.labels).find(
    ([label, code]) => label === inputUnit || code === inputUnit
  ) as [string, string] | undefined;
  return match ? match[1] : null;
}

const validFloatRegex = /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?$/;

const GenericUnitValueInput: FC<GenericUnitValueInputProps> = ({
  unitFactors,
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();
  const [inputValue, setInputValue] = useState<string>("");
  const [inputUnit, setInputUnit] = useState<string>(unitFactors.default);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [menuPosition, setMenuPosition] =
    useState<PopupOptionMenuPosition | null>(null);
  const [menuOptions, setMenuOptions] = useState<UnitOption[] | []>([]);
  const [error, setError] = useState<string | null>(null);
  const isDisabled = field.disabled ?? false;

  const validateCb = useCallback(
    (input: string, unit: string): string | null => {
      if (!input || input.trim() === "")
        return field.required ? t("Value required.") : null;

      if (!validFloatRegex.test(input)) return t("Must be a valid number");

      const err = validateFieldValue(definitionName, field, [input, unit], t);
      return err ? err : null;
    },
    [definitionName, field, t]
  );
  // Create reverseLabels locally to avoid mutating the shared unitFactors object
  const reverseLabels = (() => {
    if (unitFactors.reverseLabels !== undefined)
      return unitFactors.reverseLabels;
    return Object.fromEntries(
      Object.entries(unitFactors.labels).map(([label, code]) => [code, label])
    );
  })();
  useEffect(() => {
    const val = String(value[0]);
    let unit = value[1] ?? unitFactors.default;
    unit = normalizeUnit(unit, unitFactors) || unit;
    const err = validateCb(val, unit);

    // Only update local state if values actually changed to avoid unnecessary re-renders
    if (val !== inputValue) setInputValue(val);
    if (unit !== inputUnit) setInputUnit(unit);
    if (err !== error) setError(err);
    // report error changes to parent via onError (do not call onChange here)
    // use refs to avoid adding onError to deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, unitFactors, field, definitionName, t, validateCb]);

  const prevErrorRef = useRef<string | null>(null);
  const onErrorRef = useRef<GenericUnitValueInputProps["onError"] | undefined>(
    onError
  );
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // separate effect to report error changes when props sync runs
  useEffect(() => {
    const val = String(value[0]);
    let unit = value[1] ?? unitFactors.default;
    unit = normalizeUnit(unit, unitFactors) || unit;
    const err = validateCb(val, unit);
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
  }, [value, unitFactors, validateCb]);
  // Do NOT call onChange here: this effect synchronizes internal state from props.
  // Calling onChange would notify parent and can cause an update loop when parent
  // echoes the value back into props. Only user interactions should call onChange.

  const responseParentOnChange = (
    value: string,
    unit: string,
    error: string | null
  ) => {
    onChange?.([value, reverseLabels[unit] || unit], error);
  };

  const onValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const input = e.target.value;
    const err = validateCb(input, inputUnit);

    setInputValue(input);
    setError(err);
    const unit = inputUnit ?? unitFactors.default;
    responseParentOnChange(input, unit, err);
  };

  const onUnitChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (isDisabled) return;
    const newUnit = e.target.value;
    const value = inputValue ?? "";

    const err = validateCb(value, newUnit);

    setInputUnit(newUnit);
    setError(err);
    responseParentOnChange(value, newUnit, err);
  };

  const onConvertButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    // Guard: don't open the conversion menu when conversion is disabled
    const val = inputValue ? inputValue : "";
    const parsedValue = parseFloat(val);
    if (error || !val.trim() || !Number.isFinite(parsedValue)) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + window.scrollX;
    const y = rect.bottom + window.scrollY;

    setMenuPosition({ x, y });

    const unit = inputUnit ?? unitFactors.default;
    const convertedOptions = getConvertedOptions(
      parsedValue,
      unit,
      unitFactors
    );
    if (convertedOptions.length === 0) {
      setMenuOptions([]);
      setShowMenu(false);
      return;
    }

    setMenuOptions(convertedOptions);
    setShowMenu((prev) => !prev);
  };

  const onConversionMenuSelect = (option: UnitOption) => {
    const { value, unit } = option;
    setInputValue(value);
    setInputUnit(unit);
    setShowMenu(false);
    responseParentOnChange(value, unit, null);
  };

  const disableConversion =
    isDisabled || Boolean(error) || !(inputValue ?? "").trim();

  // Dark mode aware button styling
  const convertButtonStyle = {
    width: "var(--reactaform-unit-btn-width, 2.5em)",
    height: "var(--reactaform-unit-btn-height, 2.5em)",
    padding: "var(--reactaform-unit-btn-padding, 0)",
    border: "var(--reactaform-unit-btn-border, 1px solid #ccc)",
    borderRadius: "var(--reactaform-unit-btn-radius, 0.25em)",
    background: disableConversion
      ? "var(--reactaform-unit-btn-bg-disabled, #f0f0f0)"
      : "var(--reactaform-unit-btn-bg, #f8f9fa)",
    color: "var(--reactaform-unit-btn-color, #333)",
    cursor: disableConversion ? "not-allowed" : "pointer",
    opacity: disableConversion ? 0.5 : 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <StandardFieldLayout field={field} error={error}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--reactaform-unit-gap, 8px)", width: "100%" }}>
        <input
          type="text"
          value={inputValue ?? ""}
          onChange={onValueChange}
          disabled={isDisabled}
          style={{ width: "var(--reactaform-unit-input-width, 100px)" }}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
        />

        {/* Units dropdown */}
        <select
          value={inputUnit ?? unitFactors.default}
          onChange={onUnitChange}
          className={combineClasses(
            CSS_CLASSES.input,
            CSS_CLASSES.inputSelect
          )}
          disabled={isDisabled}
        >
          {Object.keys(unitFactors.factors).map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>

        {/* Conversion button */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            onClick={onConvertButtonClick}
            aria-disabled={disableConversion}
            disabled={disableConversion}
            style={convertButtonStyle}
            className={undefined}
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

          {showMenu && menuOptions && (
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
        {field.tooltip && <Tooltip content={field.tooltip} />}
      </div>
    </StandardFieldLayout>
  );
};

function UnitValueInput({ field, value, onChange }: UnitValueInputProps) {
  if (!field.dimension) {
    return null;
  }
  if (!unitFactorsMap[field.dimension]) {
    loadUnitFactorsMap(field.dimension);
  }

  const unitFactors = unitFactorsMap[field.dimension];
  if (!unitFactors) {
    return null;
  }

  return (
    <GenericUnitValueInput
      unitFactors={unitFactors}
      field={field}
      value={value}
      onChange={onChange}
    />
  );
}

export default UnitValueInput;
