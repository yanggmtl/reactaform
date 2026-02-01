import * as React from "react";
import type { BaseInputProps, DefinitionPropertyField } from "../../core/reactaFormTypes";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { StandardFieldLayout } from "../layout/LayoutComponents";
import PopupOptionMenu from "../ui/PopupOptionMenu";
import type { PopupOptionMenuPosition } from "../ui/PopupOptionMenu";
import { getUnitFactors, convertTemperature } from "../../utils/unitValueMapper";
import { CSS_CLASSES, combineClasses } from "../../core/cssClasses";
import { useFieldValidator } from "../../hooks/useFieldValidator";

type UnitValueInputProps = BaseInputProps<[string | number, string], DefinitionPropertyField>;

interface UnitOption {
  label: string;
  value: string;
  unit: string;
}

// Conversion Button Component
interface ConversionButtonProps {
  disabled: boolean;
  inputValue: string;
  selectedUnit: string;
  dimension: string;
  unitFactors: { units: string[]; factors: Record<string, number> };
  onConversionSelect: (option: UnitOption) => void;
  t: (key: string) => string;
}

const ConversionButton: React.FC<ConversionButtonProps> = React.memo(({
  disabled,
  inputValue,
  selectedUnit,
  dimension,
  unitFactors,
  onConversionSelect,
  t,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState<PopupOptionMenuPosition | null>(null);
  const [menuOptions, setMenuOptions] = React.useState<UnitOption[]>([]);

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;

      const parsedValue = parseFloat(inputValue);
      if (!Number.isFinite(parsedValue)) return;

      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({ x: rect.left, y: rect.bottom });

      // Generate conversion options
      const options: UnitOption[] = [];
      const isTemp = dimension === "temperature";

      if (isTemp) {
        unitFactors.units.forEach((toUnit) => {
          const converted = convertTemperature(selectedUnit, toUnit, parsedValue);
          if (Number.isFinite(converted)) {
            options.push({
              label: `${converted.toFixed(6)} ${t(toUnit)}`,
              value: converted.toString(),
              unit: toUnit,
            });
          }
        });
      } else {
        const fromFactor = unitFactors.factors[selectedUnit];
        if (fromFactor !== undefined) {
          Object.entries(unitFactors.factors).forEach(([toUnit, toFactor]) => {
            const converted = (parsedValue / fromFactor) * toFactor;
            if (Number.isFinite(converted)) {
              options.push({
                label: `${converted.toFixed(6)} ${t(toUnit)}`,
                value: converted.toString(),
                unit: toUnit,
              });
            }
          });
        }
      }

      setMenuOptions(options);
      setShowMenu(options.length > 0);
    },
    [disabled, inputValue, selectedUnit, dimension, unitFactors, t]
  );

  const handleSelect = React.useCallback(
    (option: UnitOption) => {
      setShowMenu(false);
      setMenuPosition(null);
      onConversionSelect(option);
    },
    [onConversionSelect]
  );

  const handleClose = React.useCallback(() => {
    setShowMenu(false);
    setMenuPosition(null);
  }, []);

  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled}
        aria-disabled={disabled}
        style={{
          width: "var(--reactaform-unit-btn-width, 2.5em)",
          height: "auto",
          padding: "var(--reactaform-input-padding)",
          boxSizing: "border-box",
          border: "none",
          borderRadius: "var(--reactaform-button-border-radius, var(--reactaform-border-radius, 0.25em))",
          backgroundColor: disabled
            ? "var(--reactaform-button-disabled-bg, #cccccc)"
            : "var(--reactaform-button-bg, var(--reactaform-success-color))",
          color: "var(--reactaform-button-text, #ffffff)",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "center",
          lineHeight: 1,
        }}
      >
        <span style={{ fontSize: "1em", pointerEvents: "none" }}>
          ⇄
        </span>
      </button>

      {showMenu && menuOptions.length > 0 && (
        <PopupOptionMenu<UnitOption>
          pos={menuPosition}
          options={menuOptions}
          onClose={handleClose}
          onClickOption={handleSelect}
        />
      )}
    </>
  );
});

ConversionButton.displayName = "ConversionButton";

const UnitValueInput: React.FC<UnitValueInputProps> = ({ field, value, onChange, onError }) => {
  const { t } = useReactaFormContext();
  const validate = useFieldValidator(field);
  
  const dimension = field.dimension;

  // Load unit factors for this dimension
  const unitFactors = React.useMemo(() => {
    if (!dimension) return null;
    return getUnitFactors(dimension);
  }, [dimension]);

  // Parse current value
  const currentValue = String(value?.[0] ?? "");
  const currentUnit = String(value?.[1] ?? unitFactors?.default ?? "");

  // Controlled state
  const [inputValue, setInputValue] = React.useState(currentValue);
  const [selectedUnit, setSelectedUnit] = React.useState(currentUnit);

  // Sync with props
  React.useEffect(() => {
    setInputValue(currentValue);
  }, [currentValue]);

  React.useEffect(() => {
    setSelectedUnit(currentUnit);
  }, [currentUnit]);

  // Validation
  const error = validate([inputValue, selectedUnit]);

  // Notify parent of errors
  React.useEffect(() => {
    onError?.(error);
  }, [error, onError]);

  // Handlers
  const handleValueChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      validate([newValue, selectedUnit]);
      onChange?.([newValue, selectedUnit]);
    },
    [selectedUnit, validate, onChange]
  );

  const handleUnitChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newUnit = e.target.value;
      setSelectedUnit(newUnit);
      validate([inputValue, newUnit]);
      onChange?.([inputValue, newUnit]);
    },
    [inputValue, validate, onChange]
  );

  const handleConversionSelect = React.useCallback(
    (option: UnitOption) => {
      setInputValue(option.value);
      setSelectedUnit(option.unit);
      onChange?.([option.value, option.unit]);
    },
    [onChange]
  );

  // Memoize unit options to avoid recreating on every render
  const unitOptions = React.useMemo(
    () => {
      if (!unitFactors) return [];
      return unitFactors.units.map((u) => (
        <option key={u} value={u}>
          {t(u)}
        </option>
      ));
    },
    [unitFactors, t]
  );

  if (!dimension || !unitFactors) return null;

  const disableConversion = Boolean(error) || !inputValue.trim();

  return (
    <StandardFieldLayout field={field} error={error}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--reactaform-unit-gap, 8px)", width: "100%" }}>
        <input
          id={field.name}
          type="text"
          value={inputValue}
          onChange={handleValueChange}
          style={{ flex: "2 1 0" }}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.textInput)}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.name}-error` : undefined}
        />

        <select
          id={`${field.name}-unit`}
          value={selectedUnit}
          onChange={handleUnitChange}
          style={{ flex: "1 1 0" }}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.inputSelect)}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.name}-error` : undefined}
        >
          {unitOptions}
        </select>

        <ConversionButton
          disabled={disableConversion}
          inputValue={inputValue}
          selectedUnit={selectedUnit}
          dimension={dimension}
          unitFactors={unitFactors}
          onConversionSelect={handleConversionSelect}
          t={t}
        />
      </div>
    </StandardFieldLayout>
  );
};

UnitValueInput.displayName = "UnitValueInput";
export default React.memo(UnitValueInput);

