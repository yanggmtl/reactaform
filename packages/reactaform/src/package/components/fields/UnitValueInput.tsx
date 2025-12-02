import { useState, useEffect, useCallback, useRef } from "react";
import type { ChangeEvent, MouseEvent, FC } from "react";

import type { BaseInputProps } from "../../core/reactaFormTypes";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";

import useReactaFormContext from "../../hooks/useReactaFormContext";
import { StandardFieldLayout } from "../LayoutComponents";

import { validateFieldValue } from "../../core/validation";

import PopupOptionMenu from "../PopupOptionMenu";
import type { PopupOption, PopupOptionMenuPosition } from "../PopupOptionMenu";
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
  factors: Record<string, number>;
  labels: Record<string, string>;
  reverseLabels?: Record<string, string>;
};

type UnitValueInputProps = BaseInputProps<[string | number, string], DefinitionPropertyField>;

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
function loadUnitFactorsMap(dimension: string, t: (key: string) => string): void {
  if (dimension in unitFactorsMap) {
    return;
  }
  // Build unit factors and labels from the merged `unitsByDimension` map
  const unitsForDim = unitsByDimension[dimension] ?? {};

  const factorsMap: Record<string, number> = {};
  const labelsMap: Record<string, string> = {};
  const reverseLabelsMap: Record<string, string> = {};

  // Preserve ordering from the original `dimensionUnitsMap` when possible by iterating unitsForDim in insertion order
  for (const [u, info] of Object.entries(unitsForDim)) {
    if (typeof info.factor === "number") factorsMap[u] = info.factor;
    // labelsMap holds the friendly display name for the unit
    labelsMap[u] =  t(u);
    reverseLabelsMap[t(u)] = u;
  }

  const preferredDefault = Object.keys(unitsForDim)[0] ?? "";
  unitFactorsMap[dimension as Dimension] = {
    default: preferredDefault,
    factors: factorsMap,
    labels: labelsMap,
    reverseLabels: reverseLabelsMap,
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
  unitFactors: UnitFactors
): UnitOption[] {
  // If input value is not a finite number, no conversion can be performed
  if (!Number.isFinite(value)) return [];
  const isTemperature = unitFactors === unitFactorsMap.temperature;

  if (isTemperature) {
    // For temperature, iterate over available units (labels) and use special conversion
    return Object.keys(unitFactors.labels).map((toUnit) => {
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
  unitFactors: UnitFactors
): string | null {
  // If input matches a unit key, accept it
  if (inputUnit in unitFactors.labels) return inputUnit;
  // If input matches a friendly display name, map it back to the unit key
  if (unitFactors.reverseLabels && unitFactors.reverseLabels[inputUnit]) return unitFactors.reverseLabels[inputUnit];
  return null;
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const selectRef = useRef<HTMLSelectElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [localInput, setLocalInput] = useState<string | null>(null);
  const [localUnit, setLocalUnit] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [menuPosition, setMenuPosition] =
    useState<PopupOptionMenuPosition | null>(null);
  const [menuOptions, setMenuOptions] = useState<UnitOption[] | []>([]);
  const isDisabled = field.disabled ?? false;

  const validate = useCallback(
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

    // If the user is currently interacting with the input/select (focused),
    // avoid overwriting their edits. Otherwise update DOM values directly.
    const active = document.activeElement;
    if (active === inputRef.current || active === selectRef.current) {
      return;
    }

    if (inputRef.current) inputRef.current.value = val;
    if (selectRef.current) selectRef.current.value = unit;
    // clear transient local edits when props change (deferred to avoid sync setState)
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      setLocalInput(null);
      setLocalUnit(null);
    });
  }, [value, unitFactors]);
  // cleanup raf if unmounting
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

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
    const err = validate(val, unit);
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
  }, [value, unitFactors, validate]);
  // Do NOT call onChange here: this effect synchronizes internal state from props.
  // Calling onChange would notify parent and can cause an update loop when parent
  // echoes the value back into props. Only user interactions should call onChange.

  const responseParentOnChange = (
    value: string,
    unit: string,
    error: string | null
  ) => {
    const finalUnit = reverseLabels[unit] || unit;
    const finalValue: [string, string] = [value, finalUnit];
    onChange?.(finalValue, error);
  };

  const onValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const input = e.target.value;
    const unit = selectRef.current ? selectRef.current.value : unitFactors.default;
    const err = validate(input, unit);
    setLocalInput(input);
    responseParentOnChange(input, unit, err);
  };

  const onUnitChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (isDisabled) return;
    const newUnit = e.target.value;
    const valueStr = inputRef.current ? inputRef.current.value : String(value[0] ?? "");
    const err = validate(valueStr, newUnit);
    setLocalUnit(newUnit);
    if (selectRef.current) selectRef.current.value = newUnit;
    responseParentOnChange(valueStr, newUnit, err);
  };

  const onConvertButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    // Guard: don't open the conversion menu when conversion is disabled
    const val = inputRef.current ? inputRef.current.value : String(value[0] ?? "");
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

    const convertedOptions = getConvertedOptions(parsedValue, unit, unitFactors);
    if (convertedOptions.length === 0) {
      setMenuOptions([]);
      setShowMenu(false);
      return;
    }

    setMenuOptions(convertedOptions);
    setShowMenu((prev) => !prev);
  };

  const onConversionMenuSelect = (option: UnitOption) => {
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
    setLocalUnit(newUnit);

    // Validate the new values
    const err = validate(newVal, newUnit);

    // Notify parent of the change
    responseParentOnChange(newVal, newUnit, err);
  };

  const propInputForValidation = String(value[0] ?? "");
  const propUnitForValidation = normalizeUnit(value[1] ?? unitFactors.default, unitFactors) || (value[1] ?? unitFactors.default);

  const inputForValidation = localInput ?? propInputForValidation;
  const unitForValidation = localUnit ?? propUnitForValidation;

  const disableConversion =
    isDisabled || Boolean(validate(inputForValidation, unitForValidation)) || !inputForValidation.trim();

  // Dark mode aware button styling
  const convertButtonStyle = {
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
  } as const;

  return (
  <StandardFieldLayout field={field} error={validate(propInputForValidation, propUnitForValidation)}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--reactaform-unit-gap, 8px)", width: "100%" }}>
        <input
          type="text"
              ref={inputRef}
              defaultValue={String(value[0] ?? "")}
          onChange={onValueChange}
          disabled={isDisabled}
          style={{ width: "var(--reactaform-unit-input-width, 100px)" }}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
        />

        {/* Units dropdown */}
        <select
          ref={selectRef}
          defaultValue={normalizeUnit(value[1] ?? unitFactors.default, unitFactors) || (value[1] ?? unitFactors.default)}
          onChange={onUnitChange}
          className={combineClasses(
            CSS_CLASSES.input,
            CSS_CLASSES.inputSelect
          )}
          disabled={isDisabled}
        >
          {Object.keys(unitFactors.labels).map((u) => (
            <option key={u} value={u}>
              {unitFactors.labels[u] ?? u}
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
      </div>
    </StandardFieldLayout>
  );
};

function UnitValueInput({ field, value, onChange }: UnitValueInputProps) {
  const { t } = useReactaFormContext();
  const dimension = (field as DefinitionPropertyField & { dimension?: Dimension }).dimension;
  if (!dimension) return null;
  if (!unitFactorsMap[dimension]) {
    loadUnitFactorsMap(dimension, t);
  }

  const unitFactors = unitFactorsMap[dimension];
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
